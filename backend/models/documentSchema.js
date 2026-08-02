const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "General"
    },
    fileName: {
        type: String,
        required: true
    },
    fileData: {
        type: String,
        required: true // Base64 encoded file content
    },
    fileType: {
        type: String,
        default: "application/octet-stream"
    },
    fileSize: {
        type: Number,
        default: 0
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("document", documentSchema);
