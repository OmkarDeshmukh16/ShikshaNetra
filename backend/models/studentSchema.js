const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    generalRegisterNo: {
        type: String,
        required: true,
        unique: true
    },
    penNumber: {
        type: Number,
        required: false
    },
    uid: {
        type: String,
        required: false,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    platformFeePaid: {
        type: Boolean,
        default: false, // Must pay ₹99 on first login to unlock the platform
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: Date, // Date of birth
    },
    birthDateInWords: { type: String },
    nationality: {
        type: String,
    },
    motherTongue: {
        type: String,
    },
    motherName: {
        type: String,
    },
    religion: {
        type: String,
    },
    caste: {
        type: String,
    },
    subCaste: {
        type: String,
    },
    birthPlace: {
        type: String,
    },
    phone: {
        type: String, // Mob no.
    },
    address: {
        type: String,
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }],
    fees: {
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        balanceAmount: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Pending', 'Partial'],
            default: 'Pending'
        },
        transactions: [{
            amount: Number,
            date: { type: Date, default: Date.now },
            paymentMethod: String, // e.g., Cash, UPI, Online
            receiptNo: String
        }]
    },
    // Birthplace Breakdown
    village: { type: String },
    taluka: { type: String },
    district: { type: String },

    // Institutional History
    previousSchoolName: { type: String },
    previousSchoolStandard: { type: String },
    admissionDate: { type: String },
    // Exit Details (Updated when LC is issued)
    dateOfLeaving: { type: String },
    reasonOfLeaving: { type: String },
    progress: { type: String, default: "Good" },
    conduct: { type: String, default: "Good" },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);