const Document = require('../models/documentSchema.js');

// Upload / Store a document
const documentUpload = async (req, res) => {
    try {
        const { title, description, category, fileName, fileData, fileType, fileSize, adminID } = req.body;
        if (!title || !fileName || !fileData || !adminID) {
            return res.status(400).json({ message: "Missing required document fields (title, fileName, fileData, adminID)" });
        }

        const document = new Document({
            title,
            description: description || "",
            category: category || "General",
            fileName,
            fileData,
            fileType: fileType || "application/octet-stream",
            fileSize: fileSize || 0,
            school: adminID
        });

        const result = await document.save();
        res.status(201).json({ success: true, message: "Document uploaded successfully", document: {
            _id: result._id,
            title: result.title,
            description: result.description,
            category: result.category,
            fileName: result.fileName,
            fileType: result.fileType,
            fileSize: result.fileSize,
            createdAt: result.createdAt
        }});
    } catch (err) {
        console.error("Document upload error:", err);
        res.status(500).json({ message: "Failed to save document", error: err.message });
    }
};

// Fetch document list for a school (without transferring large fileData payloads)
const documentList = async (req, res) => {
    try {
        const documents = await Document.find({ school: req.params.id })
            .select('-fileData') // Exclude fileData for fast listing
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (err) {
        console.error("Document list fetch error:", err);
        res.status(500).json({ message: "Failed to fetch document list", error: err.message });
    }
};

// Get full document details including fileData for viewing/downloading
const documentDetail = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.status(200).json(document);
    } catch (err) {
        console.error("Document detail fetch error:", err);
        res.status(500).json({ message: "Failed to fetch document details", error: err.message });
    }
};

// Delete a document by ID
const documentDelete = async (req, res) => {
    try {
        const result = await Document.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Document not found or already deleted" });
        }
        res.status(200).json({ success: true, message: "Document deleted successfully", deletedId: req.params.id });
    } catch (err) {
        console.error("Document delete error:", err);
        res.status(500).json({ message: "Failed to delete document", error: err.message });
    }
};

module.exports = {
    documentUpload,
    documentList,
    documentDetail,
    documentDelete
};
