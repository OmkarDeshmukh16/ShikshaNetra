const Razorpay = require('razorpay');
const Admin = require('../models/adminSchema');
const Student = require('../models/studentSchema');

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

module.exports = { syncSchoolToRazorpay, createFeeOrder };
