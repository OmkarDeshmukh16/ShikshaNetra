import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Chip,
    CircularProgress,
    InputAdornment,
    Snackbar,
    Alert
} from '@mui/material';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { BASEURL } from '../../../utils/apiConfig';

const CATEGORIES = [
    "All",
    "Legal & Accreditation",
    "Academic & Affiliation",
    "Financial & Audit",
    "Staff & HR",
    "Administrative & Misc"
];

const SchoolDocuments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser?._id;

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Upload Modal State
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Legal & Accreditation',
        description: '',
        file: null,
        fileData: '',
        fileName: '',
        fileType: '',
        fileSize: 0
    });

    // Alert State
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch school documents
    const fetchDocuments = useCallback(async () => {
        if (!adminID) return;
        setLoading(true);
        try {
            const res = await axios.get(`${BASEURL}/DocumentList/${adminID}`);
            setDocuments(res.data || []);
        } catch (err) {
            console.error("Error fetching documents:", err);
            setSnackbar({ open: true, message: "Failed to load document vault.", severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [adminID]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Helper to compress image files client-side before base64 encoding
    const compressImage = (file, callback) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1600;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG data URL with 0.75 quality for optimal size (<300KB)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                callback(compressedDataUrl);
            };
            img.onerror = () => {
                callback(event.target.result);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // File selection & base64 conversion with auto-compression
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const isImage = selectedFile.type.startsWith('image/') || selectedFile.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);

        // Max 3.5MB limit check for non-images to guarantee compatibility with Vercel/Render hosting limits
        if (!isImage && selectedFile.size > 3.5 * 1024 * 1024) {
            setSnackbar({ open: true, message: "File size exceeds 3.5MB cloud host limit. Please compress your document before uploading.", severity: 'warning' });
            return;
        }

        if (isImage) {
            compressImage(selectedFile, (compressedBase64) => {
                const approxSize = Math.round((compressedBase64.length * 3) / 4);
                setFormData(prev => ({
                    ...prev,
                    file: selectedFile,
                    fileData: compressedBase64,
                    fileName: selectedFile.name.replace(/\.[^/.]+$/, "") + ".jpg",
                    fileType: 'image/jpeg',
                    fileSize: approxSize
                }));
            });
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    file: selectedFile,
                    fileData: reader.result,
                    fileName: selectedFile.name,
                    fileType: selectedFile.type || "application/octet-stream",
                    fileSize: selectedFile.size
                }));
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    // Upload submit handler
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.fileData) {
            setSnackbar({ open: true, message: "Please provide a document title and select a file.", severity: 'warning' });
            return;
        }

        setUploading(true);
        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                fileName: formData.fileName,
                fileData: formData.fileData,
                fileType: formData.fileType,
                fileSize: formData.fileSize,
                adminID
            };

            const res = await axios.post(`${BASEURL}/DocumentUpload`, payload);
            if (res.data.success || res.status === 201) {
                setSnackbar({ open: true, message: "Document safely stored in vault!", severity: 'success' });
                setOpenUploadModal(false);
                setFormData({
                    title: '',
                    category: 'Legal & Accreditation',
                    description: '',
                    file: null,
                    fileData: '',
                    fileName: '',
                    fileType: '',
                    fileSize: 0
                });
                fetchDocuments();
            }
        } catch (err) {
            console.error("Upload error:", err);
            let errMsg = "Document upload failed.";
            if (err.response?.status === 413) {
                errMsg = "File is too large for the hosting server limits (Max 3.5MB). Please compress the document.";
            } else if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            } else if (err.message) {
                errMsg = err.message;
            }
            setSnackbar({ open: true, message: errMsg, severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    // Download document handler
    const handleDownload = async (docId, defaultFileName) => {
        try {
            setSnackbar({ open: true, message: "Retrieving document...", severity: 'info' });
            const res = await axios.get(`${BASEURL}/Document/${docId}`);
            const fullDoc = res.data;

            if (!fullDoc || !fullDoc.fileData) {
                setSnackbar({ open: true, message: "Document data unavailable.", severity: 'error' });
                return;
            }

            // Create download link
            const downloadLink = document.createElement("a");
            downloadLink.href = fullDoc.fileData;
            downloadLink.download = fullDoc.fileName || defaultFileName || "document";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            setSnackbar({ open: true, message: "Document downloaded successfully.", severity: 'success' });
        } catch (err) {
            console.error("Download error:", err);
            setSnackbar({ open: true, message: "Failed to download document.", severity: 'error' });
        }
    };

    // Delete document handler
    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to permanently delete this document from the vault?")) {
            return;
        }

        try {
            await axios.delete(`${BASEURL}/Document/${docId}`);
            setSnackbar({ open: true, message: "Document deleted from vault.", severity: 'success' });
            setDocuments(prev => prev.filter(d => d._id !== docId));
        } catch (err) {
            console.error("Delete error:", err);
            setSnackbar({ open: true, message: "Failed to delete document.", severity: 'error' });
        }
    };

    // Helpers
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType, fileName) => {
        const type = (fileType || "").toLowerCase();
        const name = (fileName || "").toLowerCase();

        if (type.includes("pdf") || name.endsWith(".pdf")) {
            return <PictureAsPdfIcon sx={{ color: '#d32f2f', fontSize: 32 }} />;
        }
        if (type.includes("image") || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <ImageIcon sx={{ color: '#1976d2', fontSize: 32 }} />;
        }
        if (name.match(/\.(doc|docx|txt|rtf)$/)) {
            return <DescriptionIcon sx={{ color: '#2e7d32', fontSize: 32 }} />;
        }
        return <InsertDriveFileIcon sx={{ color: '#7d6b5d', fontSize: 32 }} />;
    };

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        const matchesQuery = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesQuery;
    });

    return (
        <VaultContainer>
            {/* --- HEADER --- */}
            <HeaderBox>
                <Box>
                    <TypographyHeader variant="h4">INSTITUTIONAL DOCUMENT VAULT</TypographyHeader>
                    <TypographySubtitle>
                        Secure, centralized storage for official school documents, accreditation certificates, and administrative records.
                    </TypographySubtitle>
                </Box>
                <PrimaryButton onClick={() => setOpenUploadModal(true)} startIcon={<AddIcon />}>
                    Deposit Document
                </PrimaryButton>
            </HeaderBox>

            {/* --- FILTERS & SEARCH --- */}
            <PaperBar elevation={0}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search documents by title, file name, or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#7d6b5d' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 0, fontFamily: 'serif' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
                            {CATEGORIES.map(cat => (
                                <CategoryChip
                                    key={cat}
                                    label={cat}
                                    clickable
                                    $active={selectedCategory === cat}
                                    onClick={() => setSelectedCategory(cat)}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </PaperBar>

            {/* --- DOCUMENT GRID / LIST --- */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: '#1a1a1a' }} />
                </Box>
            ) : filteredDocuments.length === 0 ? (
                <EmptyPaper elevation={0}>
                    <FolderIcon sx={{ fontSize: 60, color: '#e0dcd0', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                        No Documents Found
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'serif', color: '#7d6b5d', mt: 1 }}>
                        {documents.length === 0
                            ? "Your institutional vault is currently empty. Click 'Deposit Document' to store your first file."
                            : "No documents match your current filter or search criteria."}
                    </Typography>
                </EmptyPaper>
            ) : (
                <Grid container spacing={3}>
                    {filteredDocuments.map(doc => (
                        <Grid item xs={12} sm={6} md={4} key={doc._id}>
                            <DocCard elevation={0}>
                                <DocHeader>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {getFileIcon(doc.fileType, doc.fileName)}
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <DocTitle noWrap title={doc.title}>{doc.title}</DocTitle>
                                            <DocDate>{new Date(doc.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</DocDate>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={doc.category || "General"}
                                        size="small"
                                        sx={{
                                            borderRadius: 0,
                                            fontFamily: 'serif',
                                            fontSize: '0.7rem',
                                            backgroundColor: '#f4f1ea',
                                            color: '#7d6b5d',
                                            border: '1px solid #e0dcd0'
                                        }}
                                    />
                                </DocHeader>

                                {doc.description && (
                                    <DocDescription>
                                        {doc.description}
                                    </DocDescription>
                                )}

                                <DocMetaBox>
                                    <MetaLabel noWrap title={doc.fileName}>
                                        {doc.fileName}
                                    </MetaLabel>
                                    <MetaSize>{formatBytes(doc.fileSize)}</MetaSize>
                                </DocMetaBox>

                                <DocActions>
                                    <ActionButton onClick={() => handleDownload(doc._id, doc.fileName)} startIcon={<DownloadIcon fontSize="small" />}>
                                        Access / Download
                                    </ActionButton>
                                    <IconButton size="small" onClick={() => handleDelete(doc._id)} sx={{ color: '#d32f2f' }}>
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </DocActions>
                            </DocCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* --- UPLOAD DIALOG --- */}
            <Dialog open={openUploadModal} onClose={() => !uploading && setOpenUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #e0dcd0' }}>
                    Deposit Document into Vault
                </DialogTitle>
                <form onSubmit={handleUploadSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Document Title"
                                    placeholder="e.g. CBSE Affiliation Certificate 2025"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 0 } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        label="Category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        sx={{ borderRadius: 0 }}
                                    >
                                        {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description / Notes (Optional)"
                                    placeholder="Add any relevant notes, validity dates, or document reference numbers..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 0 } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <UploadDropZone component="label">
                                    <UploadFileIcon sx={{ fontSize: 42, color: '#7d6b5d', mb: 1 }} />
                                    {formData.file ? (
                                        <Box sx={{ width: '100%', textAlign: 'center', px: 2 }}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1a1a1a', mb: 0.5, wordBreak: 'break-word' }}>
                                                {formData.fileName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontFamily: 'serif', color: '#2e7d32', fontWeight: 'bold', display: 'inline-block', background: '#e8f5e9', px: 1.5, py: 0.5, borderRadius: '4px' }}>
                                                ✓ {formatBytes(formData.fileSize)} selected
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>
                                                Click to select a file from your device
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontFamily: 'serif', color: '#7d6b5d' }}>
                                                Supports PDF, Word, JPEG, PNG (Max 3.5MB)
                                            </Typography>
                                        </Box>
                                    )}
                                    <input type="file" hidden onChange={handleFileChange} />
                                </UploadDropZone>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: '1px solid #e0dcd0' }}>
                        <Button onClick={() => setOpenUploadModal(false)} disabled={uploading} sx={{ color: '#7d6b5d', fontFamily: 'serif' }}>
                            Cancel
                        </Button>
                        <PrimaryButton type="submit" disabled={uploading || !formData.fileData || !formData.title}>
                            {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Save to Vault"}
                        </PrimaryButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* --- SNACKBAR --- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 0 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </VaultContainer>
    );
};

export default SchoolDocuments;

// --- STYLED COMPONENTS ---

const VaultContainer = styled(Box)`
    padding: 30px;
    background-color: #f9f7f2;
    min-height: 90vh;
`;

const HeaderBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    border-left: 4px solid #1a1a1a;
    padding-left: 20px;
    flex-wrap: wrap;
    gap: 20px;
`;

const TypographyHeader = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        letter-spacing: 2px;
        color: #1a1a1a;
        font-weight: 400;
        line-height: 1.3;
        font-size: 1.8rem;
    }
`;

const TypographySubtitle = styled(Typography)`
    && {
        font-family: 'serif';
        font-style: italic;
        color: #7d6b5d;
        margin-top: 4px;
    }
`;

const PaperBar = styled(Paper)`
    && {
        padding: 16px 20px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
        margin-bottom: 30px;
        box-shadow: 4px 4px 0px #e0dcd0;
    }
`;

const CategoryChip = styled(Chip)`
    && {
        border-radius: 0;
        font-family: serif;
        font-size: 0.8rem;
        background-color: ${props => props.$active ? '#1a1a1a' : '#f4f1ea'};
        color: ${props => props.$active ? '#ffffff' : '#7d6b5d'};
        border: 1px solid ${props => props.$active ? '#1a1a1a' : '#e0dcd0'};
        &:hover {
            background-color: ${props => props.$active ? '#1a1a1a' : '#e0dcd0'};
        }
    }
`;

const EmptyPaper = styled(Paper)`
    && {
        padding: 60px;
        text-align: center;
        background-color: #ffffff;
        border: 1px dashed #e0dcd0;
        border-radius: 0;
    }
`;

const DocCard = styled(Paper)`
    && {
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
        box-shadow: 4px 4px 0px #e0dcd0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 220px;
        transition: all 0.2s ease;

        &:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px #7d6b5d;
            border-color: #1a1a1a;
        }
    }
`;

const DocHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
`;

const DocTitle = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        font-weight: bold;
        font-size: 1rem;
        color: #1a1a1a;
        max-width: 170px;
    }
`;

const DocDate = styled(Typography)`
    && {
        font-family: serif;
        font-style: italic;
        font-size: 0.75rem;
        color: #7d6b5d;
    }
`;

const DocDescription = styled(Typography)`
    && {
        font-family: serif;
        font-size: 0.85rem;
        color: #555;
        margin-bottom: 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;

const DocMetaBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #f9f7f2;
    border: 1px solid #e0dcd0;
    margin-bottom: 14px;
`;

const MetaLabel = styled(Typography)`
    && {
        font-family: serif;
        font-size: 0.75rem;
        color: #7d6b5d;
        max-width: 140px;
    }
`;

const MetaSize = styled(Typography)`
    && {
        font-family: serif;
        font-size: 0.75rem;
        font-weight: bold;
        color: #1a1a1a;
    }
`;

const DocActions = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    pt: 10px;
    border-top: 1px solid #f4f1ea;
`;

const PrimaryButton = styled(Button)`
    && {
        background-color: #1a1a1a;
        color: #ffffff;
        border-radius: 0;
        padding: 8px 20px;
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.85rem;
        box-shadow: 3px 3px 0px #7d6b5d;
        &:hover {
            background-color: #333333;
            transform: translate(-1px, -1px);
            box-shadow: 5px 5px 0px #7d6b5d;
        }
    }
`;

const ActionButton = styled(Button)`
    && {
        color: #1a1a1a;
        font-family: 'Georgia', serif;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        &:hover {
            background-color: #f4f1ea;
        }
    }
`;

const UploadDropZone = styled(Box)`
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    box-sizing: border-box !important;
    border: 2px dashed #7d6b5d;
    background-color: #fdfcf8;
    padding: 25px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
        background-color: #f4f1ea;
        border-color: #1a1a1a;
    }
`;
