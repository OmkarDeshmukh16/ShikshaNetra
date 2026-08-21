const mongoose = require('mongoose');

// =============================================================
// PLATFORM FEE LEDGER
// =============================================================
// Records every ₹99 platform activation fee collected from students.
// Queryable for revenue reconciliation by Super Admin.
// =============================================================

const platformFeeLedgerSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true, // Amount in INR (e.g., 99)
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created',
    },
    paidAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for fast queries: "show me all platform fees for a school" or "all fees for a student"
platformFeeLedgerSchema.index({ school: 1, createdAt: -1 });
platformFeeLedgerSchema.index({ student: 1 });
platformFeeLedgerSchema.index({ razorpayOrderId: 1 }, { unique: true });

module.exports = mongoose.model('platformFeeLedger', platformFeeLedgerSchema);
