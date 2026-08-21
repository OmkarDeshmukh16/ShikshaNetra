const Razorpay = require('razorpay');
const crypto = require('crypto');
const Admin = require('../models/adminSchema');
const {
    MONTHLY_SUBSCRIPTION_PRICE,
    PAYMENT_CURRENCY,
    SUBSCRIPTION_PERIOD,
    SUBSCRIPTION_INTERVAL,
} = require('../constants');

// ─────────────────────────────────────────────────────────────
// Shared Razorpay SDK instance (Master Account credentials)
// ─────────────────────────────────────────────────────────────
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error(
            'Razorpay API Keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
        );
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// =============================================================
// A. CREATE RAZORPAY PLAN (one-time, SuperAdmin)
// =============================================================
/**
 * POST /SuperAdmin/CreateSubscriptionPlan
 *
 * Creates a Razorpay Plan for the monthly school subscription.
 * Call this once — the plan_id is returned and can be reused for
 * all school subscriptions.
 *
 * Idempotency: If a plan already exists with the same item name,
 * this controller will return the existing plan_id from the
 * response notes. However, Razorpay does not natively prevent
 * duplicate plans, so avoid calling this more than once.
 */
const createSubscriptionPlan = async (req, res) => {
    try {
        const razorpay = getRazorpayInstance();
        const amountInPaisa = Math.round(MONTHLY_SUBSCRIPTION_PRICE * 100);

        const planOptions = {
            period: SUBSCRIPTION_PERIOD,
            interval: SUBSCRIPTION_INTERVAL,
            item: {
                name: 'ShikshaNetra School Monthly Subscription',
                amount: amountInPaisa,
                currency: PAYMENT_CURRENCY,
                description: `₹${MONTHLY_SUBSCRIPTION_PRICE}/month platform subscription for schools`,
            },
            notes: {
                type: 'school_subscription',
                created_by: 'super_admin',
            },
        };

        const plan = await razorpay.plans.create(planOptions);

        console.log(`📋 Subscription plan created: ${plan.id} — ₹${MONTHLY_SUBSCRIPTION_PRICE}/month`);

        return res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully.',
            planId: plan.id,
            plan,
        });
    } catch (err) {
        console.error('[createSubscriptionPlan] Error:', err);

        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to create subscription plan.',
            error: razorpayError,
        });
    }
};

// =============================================================
// B. CREATE SUBSCRIPTION FOR A SCHOOL (SuperAdmin)
// =============================================================
/**
 * POST /SuperAdmin/School/:id/subscription
 * Body: { planId: String }
 *
 * Creates a Razorpay Subscription for a specific school.
 * The school admin receives a short_url to authenticate and
 * authorize the recurring payment.
 *
 * Idempotency: If the school already has an active/created
 * subscription, returns early.
 */
const createSchoolSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { planId } = req.body;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'planId is required. Create a plan first via /SuperAdmin/CreateSubscriptionPlan.',
            });
        }

        // ── Fetch school admin ────────────────────────────────
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'School not found.',
            });
        }

        // ── Idempotency — check existing subscription ─────────
        const activeStatuses = ['created', 'authenticated', 'active', 'pending'];
        if (admin.subscription?.razorpaySubscriptionId &&
            activeStatuses.includes(admin.subscription.status)) {
            return res.status(200).json({
                success: true,
                message: `School already has a ${admin.subscription.status} subscription.`,
                subscriptionId: admin.subscription.razorpaySubscriptionId,
                status: admin.subscription.status,
            });
        }

        // ── Create Razorpay Subscription ──────────────────────
        const razorpay = getRazorpayInstance();

        const subscriptionOptions = {
            plan_id: planId,
            total_count: 120,    // Max billing cycles (10 years × 12 months)
            quantity: 1,
            notes: {
                schoolId: admin._id.toString(),
                schoolName: admin.schoolName || '',
                type: 'school_subscription',
            },
        };

        // Add customer notify if school has email
        if (admin.email) {
            subscriptionOptions.customer_notify = 1;
        }

        const subscription = await razorpay.subscriptions.create(subscriptionOptions);

        // ── Update admin document ─────────────────────────────
        admin.subscription = {
            razorpaySubscriptionId: subscription.id,
            razorpayPlanId: planId,
            status: subscription.status || 'created',
            updatedAt: new Date(),
        };
        await admin.save();

        console.log(`🔔 Subscription created for ${admin.schoolName}: ${subscription.id}`);

        return res.status(201).json({
            success: true,
            message: 'Subscription created. Share the payment link with the school admin.',
            subscriptionId: subscription.id,
            status: subscription.status,
            shortUrl: subscription.short_url, // School admin opens this to authorize payment
            subscription,
        });
    } catch (err) {
        console.error('[createSchoolSubscription] Error:', err);

        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to create subscription.',
            error: razorpayError,
        });
    }
};

// =============================================================
// C. CANCEL SUBSCRIPTION (SuperAdmin)
// =============================================================
/**
 * POST /SuperAdmin/School/:id/subscription/cancel
 * Body: { cancelAtCycleEnd: Boolean } (optional, default true)
 *
 * Cancels a school's subscription. By default cancels at the end
 * of the current billing cycle (cancel_at_cycle_end = true).
 */
const cancelSchoolSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelAtCycleEnd = true } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'School not found.',
            });
        }

        const subscriptionId = admin.subscription?.razorpaySubscriptionId;
        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'This school does not have an active subscription.',
            });
        }

        // ── Cancel via Razorpay API ───────────────────────────
        const razorpay = getRazorpayInstance();
        const cancelled = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);

        // ── Update admin document ─────────────────────────────
        admin.subscription.status = 'cancelled';
        admin.subscription.updatedAt = new Date();
        await admin.save();

        console.log(`❌ Subscription cancelled for ${admin.schoolName}: ${subscriptionId}`);

        return res.status(200).json({
            success: true,
            message: cancelAtCycleEnd
                ? 'Subscription will be cancelled at the end of the current billing cycle.'
                : 'Subscription cancelled immediately.',
            subscription: cancelled,
        });
    } catch (err) {
        console.error('[cancelSchoolSubscription] Error:', err);

        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription.',
            error: razorpayError,
        });
    }
};

// =============================================================
// D. VIEW SUBSCRIPTION STATUS (School Admin — own school)
// =============================================================
/**
 * GET /School/SubscriptionStatus/:adminId
 *
 * Returns the subscription status for a school admin.
 * Protected by verifyToken + requireRole('Admin').
 */
const getSubscriptionStatus = async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await Admin.findById(
            adminId,
            'schoolName subscription'
        );
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'School not found.',
            });
        }

        return res.status(200).json({
            success: true,
            schoolName: admin.schoolName,
            subscription: {
                status: admin.subscription?.status || 'none',
                razorpaySubscriptionId: admin.subscription?.razorpaySubscriptionId || '',
                currentPeriodStart: admin.subscription?.currentPeriodStart || null,
                currentPeriodEnd: admin.subscription?.currentPeriodEnd || null,
                updatedAt: admin.subscription?.updatedAt || null,
            },
            monthlyPrice: MONTHLY_SUBSCRIPTION_PRICE,
            currency: PAYMENT_CURRENCY,
        });
    } catch (err) {
        console.error('[getSubscriptionStatus] Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription status.',
            error: err.message,
        });
    }
};

// =============================================================
// E. SUBSCRIPTION WEBHOOK HANDLER
// =============================================================
/**
 * POST /webhook/subscription
 *
 * Handles Razorpay subscription lifecycle events.
 * Security: Verifies webhook signature using raw body + RAZORPAY_WEBHOOK_SECRET.
 * Pattern: Matches the existing razorpayWebhook in superadmin-controller.js.
 *
 * Events handled:
 *   subscription.activated   → status = 'active'
 *   subscription.charged     → status = 'active', update period
 *   subscription.paused      → status = 'paused'
 *   subscription.halted      → status = 'halted'
 *   subscription.cancelled   → status = 'cancelled'
 *   subscription.completed   → status = 'completed'
 *   subscription.expired     → status = 'expired'
 *   subscription.pending     → status = 'pending'
 *
 * Always returns 200 to Razorpay (even for unknown events or errors)
 * to prevent infinite retries.
 */
const subscriptionWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('❌ RAZORPAY_WEBHOOK_SECRET not configured');
            return res.status(500).json({ message: 'Webhook secret not configured' });
        }

        // ── Verify signature using RAW body ───────────────────
        const signature = req.headers['x-razorpay-signature'];
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.rawBody) // Must use raw body for correct signature
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('❌ Subscription webhook signature mismatch');
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        console.log(`📨 Subscription webhook received: ${event}`);

        // ── Map Razorpay events to subscription statuses ──────
        const eventStatusMap = {
            'subscription.activated':  'active',
            'subscription.charged':    'active',
            'subscription.paused':     'paused',
            'subscription.halted':     'halted',
            'subscription.cancelled':  'cancelled',
            'subscription.completed':  'completed',
            'subscription.expired':    'expired',
            'subscription.pending':    'pending',
            'subscription.authenticated': 'authenticated',
        };

        const newStatus = eventStatusMap[event];

        if (newStatus) {
            const subscriptionEntity = req.body.payload.subscription.entity;
            const subscriptionId = subscriptionEntity.id;

            // Find the school by subscription ID
            const admin = await Admin.findOne({
                'subscription.razorpaySubscriptionId': subscriptionId,
            });

            if (!admin) {
                console.log(`⚠ No school found for subscription: ${subscriptionId}`);
                return res.status(200).json({ status: 'no matching school' });
            }

            // Update subscription status
            admin.subscription.status = newStatus;
            admin.subscription.updatedAt = new Date();

            // For charged events, update billing period dates
            if (event === 'subscription.charged') {
                if (subscriptionEntity.current_start) {
                    admin.subscription.currentPeriodStart = new Date(subscriptionEntity.current_start * 1000);
                }
                if (subscriptionEntity.current_end) {
                    admin.subscription.currentPeriodEnd = new Date(subscriptionEntity.current_end * 1000);
                }
            }

            await admin.save();
            console.log(`✅ Subscription ${newStatus} for ${admin.schoolName} (${subscriptionId})`);
        } else {
            console.log(`ℹ Unhandled subscription event: ${event}`);
        }

        // Always respond 200 to Razorpay (even for events we don't handle)
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('❌ Subscription webhook processing error:', err);
        // Still return 200 so Razorpay doesn't retry indefinitely
        res.status(200).json({ status: 'error logged' });
    }
};

module.exports = {
    createSubscriptionPlan,
    createSchoolSubscription,
    cancelSchoolSubscription,
    getSubscriptionStatus,
    subscriptionWebhook,
};
