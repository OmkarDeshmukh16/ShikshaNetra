import React, { useState, useEffect } from 'react';
import { Person, School, LocationOn, Fingerprint, Collections } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, getUserDetails } from '../../redux/userRelated/userHandle';
import { Box, Paper, Typography, Grid, TextField, Avatar, Button, Collapse, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import { BASEURL } from '../../utils/apiConfig';

const AdminProfile = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [showTab, setShowTab] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Whether this school is already linked to Razorpay Route
    const isLinkedToRazorpay = !!currentUser.bankDetails?.razorpayAccountId;

    // Initializing with existing institutional data 
    const [formData, setFormData] = useState({
        name: currentUser.name || "",
        email: currentUser.email || "",
        schoolName: currentUser.schoolName || "",
        udiseNumber: currentUser.udiseNumber || "",
        recognitionNumber: currentUser.recognitionNumber || "",
        board: currentUser.board || "",
        medium: currentUser.medium || "",
        address: currentUser.address || "",
        mobile: currentUser.mobile || "",
        schoolLogo: currentUser.schoolLogo || "",
        password: ""
    });

    // Add this to ensure the form updates after a successful save
    useEffect(() => {
        setFormData({
            name: currentUser.name || "",
            email: currentUser.email || "",
            schoolName: currentUser.schoolName || "",
            udiseNumber: currentUser.udiseNumber || "",
            recognitionNumber: currentUser.recognitionNumber || "",
            board: currentUser.board || "",
            medium: currentUser.medium || "",
            address: currentUser.address || "",
            mobile: currentUser.mobile || "",
            schoolLogo: currentUser.schoolLogo || "",
            password: ""
        });
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [bankDetails, setBankDetails] = useState({
        accountHolderName: currentUser.bankDetails?.accountHolderName || "",
        accountNumber: currentUser.bankDetails?.accountNumber || "",
        ifscCode: currentUser.bankDetails?.ifscCode || "",
        bankName: currentUser.bankDetails?.bankName || "",
        branchName: currentUser.bankDetails?.branchName || ""
    });

    // eslint-disable-next-line no-unused-vars
    const handleBankChange = (e) => {
        setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
    };

    // ── Razorpay Route Onboarding ─────────────────────────────
    const handleRazorpaySync = async () => {
        setIsSyncing(true);
        try {
            const response = await axios.post(
                `${BASEURL}/SyncSchoolRazorpay/${currentUser._id}`
            );

            if (response.data.success) {
                // Re-fetch the admin profile to update currentUser in Redux
                // This triggers authSuccess → currentUser.bankDetails.razorpayAccountId is set
                dispatch(getUserDetails(currentUser._id, "Admin"));
                // Also trigger authSuccess so currentUser in sidebar/header reflects the change
                const refreshed = await axios.get(`${BASEURL}/Admin/${currentUser._id}`);
                if (refreshed.data) {
                    dispatch({ type: 'user/authSuccess', payload: refreshed.data });
                }
                alert("✅ Success! Your school is now authorized to receive direct online fee settlements.");
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Sync failed. Please verify your IFSC code and account details, then try again."
            );
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, schoolLogo: reader.result });
        };
        if (file) reader.readAsDataURL(file);
    };

    const submitHandler = (event) => {
        event.preventDefault();
        // Remove empty password to avoid overwriting with blank string
        const Fields = formData.password === ""
            ? { ...formData, bankDetails, password: undefined }
            : formData;

        dispatch(updateUser(Fields, currentUser._id, "Admin"));
        setShowTab(false);
    };

    return (
        <ProfileContainer>
            <Grid container spacing={4}>
                {/* --- INSTITUTIONAL IDENTITY CARD --- */}
                <Grid item xs={12} md={5}>
                    <DossierCard>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <LogoAvatar src={formData.schoolLogo} variant="square">
                                <Collections />
                            </LogoAvatar>
                            <TypographyClassic variant="h5" sx={{ mt: 2, textAlign: 'center' }}>
                                {formData.schoolName}
                            </TypographyClassic>
                            <Label sx={{ textAlign: 'center' }}>UDISE: {formData.udiseNumber || "NOT REGISTERED"}</Label>
                        </Box>

                        <InfoRow><Person fontSize="small" /><Box><Label>Administrator</Label><Value>{formData.name}</Value></Box></InfoRow>
                        <InfoRow><School fontSize="small" /><Box><Label>Board & Medium</Label><Value>{formData.board} — {formData.medium}</Value></Box></InfoRow>
                        <InfoRow><Fingerprint fontSize="small" /><Box><Label>Recognition No.</Label><Value>{formData.recognitionNumber}</Value></Box></InfoRow>
                        <InfoRow><LocationOn fontSize="small" /><Box><Label>Physical Address</Label><Value>{formData.address}</Value></Box></InfoRow>

                        <EditButton fullWidth onClick={() => setShowTab(!showTab)}>
                            {showTab ? 'Cancel Edit' : 'Modify Institutional Registry'}
                        </EditButton>
                    </DossierCard>
                </Grid>

                {/* --- REGISTRY UPDATE FORM --- */}
                <Grid item xs={12} md={7}>
                    <Collapse in={showTab}>
                        <EditPaper>
                            <SectionTitle>Update Institutional Details</SectionTitle>
                            <form onSubmit={submitHandler}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2, borderRadius: 0, border: '1px dashed #7d6b5d', color: '#7d6b5d' }}>
                                            Upload Official School Seal (Logo)
                                            <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ClassicField label="School Name" name="schoolName" fullWidth value={formData.schoolName} onChange={handleChange} required />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ClassicField label="UDISE Number" name="udiseNumber" fullWidth value={formData.udiseNumber} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ClassicField label="Education Board" name="board" fullWidth value={formData.board} onChange={handleChange} placeholder="e.g. CBSE, SSC" />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ClassicField label="Medium" name="medium" fullWidth value={formData.medium} onChange={handleChange} placeholder="e.g. English, Marathi" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ClassicField label="Recognition Number" name="recognitionNumber" fullWidth value={formData.recognitionNumber} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ClassicField label="Full Address" name="address" fullWidth multiline rows={2} value={formData.address} onChange={handleChange} />
                                    </Grid>
                                    {/* Bank Account Details & Razorpay Integration - Commented out per request */}
                                     {/*
<Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold', color: '#2c3e50' }}>
                                        Bank Account for Fee Settlement
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Account Holder Name (As per Bank)"
                                                name="accountHolderName"
                                                value={bankDetails.accountHolderName}
                                                onChange={handleBankChange}
                                                disabled={isLinkedToRazorpay}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Account Number"
                                                name="accountNumber"
                                                value={bankDetails.accountNumber}
                                                onChange={handleBankChange}
                                                disabled={isLinkedToRazorpay}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="IFSC Code"
                                                name="ifscCode"
                                                value={bankDetails.ifscCode}
                                                onChange={handleBankChange}
                                                disabled={isLinkedToRazorpay}
                                                helperText={isLinkedToRazorpay ? "Locked — linked to payment gateway" : "Example: SBIN0001234"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Bank Name"
                                                name="bankName"
                                                value={bankDetails.bankName}
                                                onChange={handleBankChange}
                                                disabled={isLinkedToRazorpay}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* ── Razorpay Route Status / Activation ── */}
                                    {isLinkedToRazorpay ? (
                                        <RazorpayStatusBox>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                                                <Typography sx={{ color: '#2e7d32', fontWeight: 'bold', fontFamily: 'Georgia, serif', fontSize: '0.95rem' }}>
                                                    Linked with Payment Gateway
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: '#7d6b5d', fontFamily: 'serif', display: 'block', ml: 3.5 }}>
                                                ID: {currentUser.bankDetails.razorpayAccountId} — Bank details are locked. Contact support to modify settlement details.
                                            </Typography>
                                        </RazorpayStatusBox>
                                    ) : (
                                        <SyncButton
                                            fullWidth
                                            onClick={handleRazorpaySync}
                                            disabled={isSyncing || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName}
                                        >
                                            {isSyncing ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <CircularProgress size={18} sx={{ color: 'white' }} />
                                                    Verifying with Gateway...
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SyncLock fontSize="small" />
                                                    Activate Direct Online Payments
                                                </Box>
                                            )}
                                        </SyncButton>
                                    )}

                                    */}
                                     <Grid item xs={12}>
                                         <Update3DButton type="submit" fullWidth>Confirm Registry Update</Update3DButton>
                                    </Grid>
                                </Grid>
                            </form>
                        </EditPaper>
                    </Collapse>
                </Grid>
            </Grid>

        </ProfileContainer>
    );
}

export default AdminProfile;

// --- ADDITIONAL STYLES ---

const LogoAvatar = styled(Avatar)`
    && {
        width: 120px;
        height: 120px;
        border: 2px solid #1a1a1a;
        background-color: #fdfcf8;
        color: #e0dcd0;
    }
`;

const ProfileContainer = styled(Box)` padding: 30px; background-color: #f9f7f2; min-height: 90vh; `;
const DossierCard = styled(Paper)` && { padding: 40px; border-radius: 0; border: 1px solid #e0dcd0; box-shadow: 10px 10px 0px #e0dcd0; } `;
const TypographyClassic = styled(Typography)` && { font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 2px; color: #1a1a1a; font-weight: bold; } `;
const InfoRow = styled(Box)` display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; `;
const Label = styled.p` font-family: serif; font-size: 0.7rem; text-transform: uppercase; color: #7d6b5d; font-weight: 700; margin: 0; `;
const Value = styled.p` font-family: 'Georgia', serif; font-size: 1rem; color: #1a1a1a; margin: 2px 0 0 0; `;
const EditPaper = styled(Paper)` && { padding: 40px; border-radius: 0; border: 1px solid #e0dcd0; background: white; } `;
const SectionTitle = styled.h3` font-family: 'Georgia', serif; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; `;
const ClassicField = styled(TextField)` & .MuiOutlinedInput-root { border-radius: 0; & fieldset { border-color: #e0dcd0; } } `;
const EditButton = styled(Button)` && { border-radius: 0; background-color: #1a1a1a; color: white; margin-top: 20px; font-family: serif; &:hover { background-color: #333; } } `;
const Update3DButton = styled(Button)` && { background-color: #1a1a1a; color: white; padding: 12px; border-radius: 0; box-shadow: 4px 4px 0px #7d6b5d; font-family: 'Georgia', serif; &:hover { background-color: #333; transform: translate(-1px, -1px); box-shadow: 6px 6px 0px #7d6b5d; } } `;

/* Razorpay Route onboarding styles */
const RazorpayStatusBox = styled(Box)`
    margin-top: 20px;
    padding: 16px 20px;
    background-color: #e8f5e9;
    border-left: 4px solid #2e7d32;
    border-radius: 0;
`;
const SyncButton = styled(Button)`
    && {
        margin-top: 20px;
        background: linear-gradient(135deg, #e65100, #ff8f00);
        color: white;
        padding: 14px;
        border-radius: 0;
        box-shadow: 4px 4px 0px #bf360c;
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.85rem;
        &:hover {
            background: linear-gradient(135deg, #bf360c, #e65100);
            transform: translate(-1px, -1px);
            box-shadow: 6px 6px 0px #bf360c;
        }
        &:disabled {
            background: #bdbdbd;
            box-shadow: none;
            color: #757575;
        }
    }
`;