const Razorpay = require('razorpay');
const crypto = require('crypto');
const Admin = require('../models/adminSchema');
const Student = require('../models/studentSchema');
const PlatformFeeLedger = require('../models/platformFeeLedgerSchema');
const { PLATFORM_FEE_PER_STUDENT, PAYMENT_CURRENCY } = require('../constants');

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
// A. ONBOARDING CONTROLLER — One-time Linked Account Sync
// =============================================================
/**
 * POST /api/syncSchoolToRazorpay/:adminId
 *
 * Registers a School Admin's bank details as a Razorpay Route
 * Linked Account (V2 Account API).  On success, persists the
 * returned `acc_XXXXXX` ID in the Admin's `bankDetails.razorpayAccountId`.
 *
 * Idempotency: If the admin already has a razorpayAccountId, the
 * controller returns early to prevent duplicate accounts.
 */
const syncSchoolToRazorpay = async (req, res) => {
    try {
        const { adminId } = req.params;

        // 1. Fetch the admin document
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'School Admin not found.',
            });
        }

        // 2. Guard — check if already onboarded
        if (admin.bankDetails?.razorpayAccountId) {
            return res.status(200).json({
                success: true,
                message: 'School is already linked to Razorpay.',
                razorpayAccountId: admin.bankDetails.razorpayAccountId,
            });
        }

        // 3. Validate required bank details
        const { accountNumber, ifscCode, accountHolderName } = admin.bankDetails || {};
        if (!accountNumber || !ifscCode || !accountHolderName) {
            return res.status(400).json({
                success: false,
                message:
                    'Incomplete bank details. Please save Account Number, IFSC Code, and Account Holder Name before syncing.',
            });
        }

        if (!admin.email) {
            return res.status(400).json({
                success: false,
                message: 'Admin email is required for Razorpay onboarding.',
            });
        }

        // 4. Create a Linked Account via Razorpay Route V2 Account API
        const razorpay = getRazorpayInstance();

        const linkedAccountPayload = {
            email: admin.email,
            phone: admin.mobile || undefined,
            legal_business_name: admin.schoolName || accountHolderName,
            business_type: 'not_yet_registered',             // Adjust per Razorpay docs
            legal_info: {
                pan: undefined,                               // Optional — add if available
            },
            profile: {
                category: 'education',
                subcategory: 'college',                       // Closest match; adjust if needed
                addresses: {
                    registered: {
                        street1: admin.address || 'N/A',
                        street2: '',
                        city: 'N/A',
                        state: 'N/A',
                        postal_code: '000000',                // Placeholder — ideally from admin profile
                        country: 'IN',
                    },
                },
            },
            legal_entity: {
                name: accountHolderName,
            },
            // Attach the settlement (bank) details so funds land here
            settlement: {
                account_number: accountNumber,
                ifsc_code: ifscCode,
                beneficiary_name: accountHolderName,
            },
        };

        // Remove undefined keys for a cleaner payload
        const cleanPayload = JSON.parse(JSON.stringify(linkedAccountPayload));

        const linkedAccount = await razorpay.accounts.create(cleanPayload);

        // 5. Persist the returned Razorpay account ID
        admin.bankDetails.razorpayAccountId = linkedAccount.id; // e.g. acc_Hjs829Sj
        await admin.save();

        return res.status(201).json({
            success: true,
            message: 'School successfully linked to Razorpay Route.',
            razorpayAccountId: linkedAccount.id,
        });
    } catch (err) {
        console.error('[syncSchoolToRazorpay] Error:', err);

        // Surface Razorpay-specific error messages when available
        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to sync school to Razorpay.',
            error: razorpayError,
        });
    }
};

// =============================================================
// B. ORDER CREATION & TRANSFER CONTROLLER
// =============================================================
/**
 * POST /api/createFeeOrder
 * Body: { studentId: String, amount: Number }
 *
 * Creates a Razorpay Order with an embedded `transfers` array so
 * that once the student pays, Razorpay Route automatically splits
 * the funds into the school's linked bank account.
 *
 * Amount is accepted in INR (rupees) and converted to paisa internally.
 */
const createFeeOrder = async (req, res) => {
    try {
        const { studentId, amount } = req.body;

        // ── Input validation ──────────────────────────────────
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'studentId is required.',
            });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid positive amount (in INR) is required.',
            });
        }

        // ── Lookup student → school admin ─────────────────────
        const student = await Student.findById(studentId).populate('school');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
            });
        }

        const admin = student.school; // Populated Admin document
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Associated school admin not found.',
            });
        }

        // ── Ensure the school has been onboarded to Razorpay Route ─
        const razorpayAccountId = admin.bankDetails?.razorpayAccountId;
        if (!razorpayAccountId) {
            return res.status(400).json({
                success: false,
                message:
                    'This school has not been linked to Razorpay yet. Please run the onboarding sync first.',
            });
        }

        // ── Create the order with auto-transfer ───────────────
        const razorpay = getRazorpayInstance();
        const amountInPaisa = Math.round(amount * 100);

        const orderOptions = {
            amount: amountInPaisa,
            currency: 'INR',
            receipt: `fee_${studentId}_${Date.now()}`,
            notes: {
                studentId: studentId,
                schoolAdminId: admin._id.toString(),
                schoolName: admin.schoolName || '',
            },
            transfers: [
                {
                    account: razorpayAccountId,
                    amount: amountInPaisa,
                    currency: 'INR',
                    notes: {
                        purpose: 'fee_collection',
                        studentId: studentId,
                    },
                    linked_account_notes: ['purpose'],
                    on_hold: 0,  // Transfer immediately after capture
                },
            ],
        };

        const order = await razorpay.orders.create(orderOptions);

        return res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID, // Frontend needs this to open checkout
        });
    } catch (err) {
        console.error('[createFeeOrder] Error:', err);

        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to create fee order.',
            error: razorpayError,
        });
    }
};

// =============================================================
// C. PLATFORM FEE — One-time ₹99 Activation
// =============================================================
/**
 * POST /api/CreatePlatformFeeOrder
 * Body: { studentId: String }
 *
 * Creates a Razorpay Order for the one-time platform activation fee.
 * The payment goes to the master Razorpay account (no Route transfer).
 * Students must pay this before they can use the platform.
 *
 * Idempotency: If the student has already paid, returns early.
 */
const createPlatformFeeOrder = async (req, res) => {
    try {
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'studentId is required.',
            });
        }

        // ── Lookup student ────────────────────────────────────
        const student = await Student.findById(studentId).populate('school');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
            });
        }

        // ── Idempotency — already paid ────────────────────────
        if (student.platformFeePaid) {
            return res.status(200).json({
                success: true,
                message: 'Platform fee already paid.',
                alreadyPaid: true,
            });
        }

        // ── Create the order (no transfers — stays in master account) ─
        const razorpay = getRazorpayInstance();
        const amountInPaisa = Math.round(PLATFORM_FEE_PER_STUDENT * 100);

        const orderOptions = {
            amount: amountInPaisa,
            currency: PAYMENT_CURRENCY,
            receipt: `platform_fee_${studentId}_${Date.now()}`,
            notes: {
                type: 'platform_fee',
                studentId: studentId,
                schoolId: student.school?._id?.toString() || '',
                schoolName: student.school?.schoolName || '',
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        // ── Record in ledger (status = created, updated to paid on verification) ─
        await PlatformFeeLedger.create({
            student: student._id,
            school: student.school?._id || student.school,
            razorpayOrderId: order.id,
            amount: PLATFORM_FEE_PER_STUDENT,
            status: 'created',
        });

        return res.status(200).json({
            success: true,
            order,
            amount: PLATFORM_FEE_PER_STUDENT,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('[createPlatformFeeOrder] Error:', err);

        const razorpayError = err?.error?.description || err.message;
        return res.status(500).json({
            success: false,
            message: 'Failed to create platform fee order.',
            error: razorpayError,
        });
    }
};

/**
 * POST /api/VerifyPlatformFeePayment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId }
 *
 * Verifies the Razorpay payment signature for the platform fee,
 * marks the student as platformFeePaid = true, and updates the
 * PlatformFeeLedger record.
 */
const verifyPlatformFeePayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId.',
            });
        }

        // ── Verify Razorpay signature ─────────────────────────
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature.',
            });
        }

        // ── Update student record ─────────────────────────────
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
            });
        }

        // Idempotency — already paid
        if (student.platformFeePaid) {
            return res.status(200).json({
                success: true,
                message: 'Platform fee already recorded.',
                alreadyPaid: true,
            });
        }

        student.platformFeePaid = true;
        await student.save();

        // ── Update ledger ─────────────────────────────────────
        await PlatformFeeLedger.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                status: 'paid',
                paidAt: new Date(),
            }
        );

        console.log(`✅ Platform fee paid: Student ${studentId} — ₹${PLATFORM_FEE_PER_STUDENT}`);

        return res.status(200).json({
            success: true,
            message: 'Platform fee verified and student activated.',
        });
    } catch (err) {
        console.error('[verifyPlatformFeePayment] Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Failed to verify platform fee payment.',
            error: err.message,
        });
    }
};

/**
 * GET /api/PlatformFeeStatus/:studentId
 *
 * Returns whether the student has paid the platform fee
 * and the fee amount (so the frontend can show the payment gate).
 */
const getPlatformFeeStatus = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId, 'platformFeePaid name');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
            });
        }

        return res.status(200).json({
            success: true,
            platformFeePaid: student.platformFeePaid,
            feeAmount: PLATFORM_FEE_PER_STUDENT,
            currency: PAYMENT_CURRENCY,
        });
    } catch (err) {
        console.error('[getPlatformFeeStatus] Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch platform fee status.',
            error: err.message,
        });
    }
};

module.exports = {
    syncSchoolToRazorpay,
    createFeeOrder,
    createPlatformFeeOrder,
    verifyPlatformFeePayment,
    getPlatformFeeStatus,
};
