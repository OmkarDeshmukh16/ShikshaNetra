// =============================================================
// PLATFORM PRICING CONSTANTS
// =============================================================
// Change pricing here — takes effect everywhere.
// Env vars override defaults so you can adjust without a redeploy.
// =============================================================

/**
 * One-time platform activation fee per student (INR).
 * Collected on the student's first login before they can use the platform.
 */
const PLATFORM_FEE_PER_STUDENT = Number(process.env.PLATFORM_FEE_PER_STUDENT) || 99;

/**
 * Monthly subscription price per school (INR).
 * Billed on a recurring basis via Razorpay Subscriptions API.
 */
const MONTHLY_SUBSCRIPTION_PRICE = Number(process.env.MONTHLY_SUBSCRIPTION_PRICE) || 999;

/**
 * Currency for all platform payments.
 */
const PAYMENT_CURRENCY = 'INR';

/**
 * Razorpay subscription billing period.
 */
const SUBSCRIPTION_PERIOD = 'monthly';

/**
 * Subscription billing interval (every 1 month).
 */
const SUBSCRIPTION_INTERVAL = 1;

module.exports = {
    PLATFORM_FEE_PER_STUDENT,
    MONTHLY_SUBSCRIPTION_PRICE,
    PAYMENT_CURRENCY,
    SUBSCRIPTION_PERIOD,
    SUBSCRIPTION_INTERVAL,
};
