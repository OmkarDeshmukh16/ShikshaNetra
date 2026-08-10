import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import axios from 'axios';
import { BASEURL } from '../../../utils/apiConfig';
import { Box, CircularProgress, Stack, TextField, Typography, Paper, Grid, MenuItem, Select, FormControl } from '@mui/material';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const AddStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const { status, response } = useSelector(state => state.user);
    const { sclassesList } = useSelector(state => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // State for all 15 headers identified in the Excel template
    const [formData, setFormData] = useState({
        name: '',
        rollNum: '',
        sclassName: params.id || '',
        email: '',
        gender: '',
        password: '',
        dob: '',
        birthDateInWords: '',
        generalRegisterNo: '',
        uid: '',
        penNumber: '',
        motherName: '',
        village: '',
        taluka: '',
        district: '',
        previousSchoolName: '',
        previousSchoolStandard: '',
        admissionDate: '',
        nationality: 'Indian',
        motherTongue: '',
        religion: '',
        caste: '',
        subCaste: '',
        birthPlace: '',
        progress: 'Good',
        conduct: 'Good',
        academicYear: '',
        remarks: '',
        phone: '',
        address: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "dob") {
            setFormData({
                ...formData,
                [name]: value,
                birthDateInWords: convertDateToWords(value) // Auto-fill
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Fetch the next GR number on component mount
    useEffect(() => {
        const fetchNextGRNo = async () => {
            try {
                const schoolId = currentUser?._id;
                if (!schoolId) return;

                const res = await axios.get(`${BASEURL}/NextGRNo/${schoolId}`);
                if (res.data.nextGRNo) {
                    setFormData(prev => ({ ...prev, generalRegisterNo: res.data.nextGRNo }));
                }
                // If nextGRNo is empty, it means no students exist yet — admin enters first GR manually
            } catch (err) {
                console.error("Could not fetch next GR number:", err);
            }
        };
        fetchNextGRNo();
    }, [currentUser]);

    const convertDateToWords = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
        const year = date.getFullYear();

        const ones = ["", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH",
            "ELEVENTH", "TWELFTH", "THIRTEENTH", "FOURTEENTH", "FIFTEENTH", "SIXTEENTH", "SEVENTEENTH",
            "EIGHTEENTH", "NINETEENTH"];
        const tens = ["", "", "TWENTY", "THIRTY"];

        const dayWord = day < 20 ? ones[day] : tens[Math.floor(day / 10)] + (day % 10 !== 0 ? " " + ones[day % 10] : "");

        // Simple year to words logic for 2000-2099
        const yearWord = "TWO THOUSAND " + (year % 100 < 20 ? ones[year % 100] : tens[Math.floor((year % 100) / 10)] + " " + ones[year % 100 % 10]);

        return `${dayWord} ${month} ${yearWord}`;
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);

        const fields = {
            ...formData,
            school: currentUser._id,
            role: "Student"
        };

        dispatch(registerUser(fields, "Student"));
    };

    useEffect(() => {
        if (status === 'added') {
            setLoader(false);
            setMessage("Student successfully enrolled in the registry.");
            setShowPopup(true);

            // Navigate back after short delay
            setTimeout(() => navigate(-1), 2000);
        } else if (status === 'failed') {
            setLoader(false);
            setMessage(response);
            setShowPopup(true);
        }
    }, [status, navigate, response]);

    return (
        <Box sx={{ backgroundColor: '#f9f7f2', minHeight: '100vh', py: 5 }}>
            <DossierPaper elevation={0}>
                <HeaderSection>
                    <ClassicTitle variant="h4">New Scholar Enrollment</ClassicTitle>
                    <ClassicSubtitle>Formal entry into the institutional academic registry</ClassicSubtitle>
                </HeaderSection>

                <form onSubmit={submitHandler}>
                    <Stack spacing={4}>
                        {/* SECTION 1: ACADEMIC IDENTITY */}
                        <Box>
                            <SectionHeading>Academic Identity</SectionHeading>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <LabelText>GR no.</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="generalRegisterNo"
                                        value={formData.generalRegisterNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <LabelText>Aadhar (UID) no.</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="uid"
                                        value={formData.uid}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <LabelText>Pen no.</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="penNumber"
                                        value={formData.penNumber}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Full Name</LabelText>
                                    <ClassicTextField fullWidth name="name" required value={formData.name} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Academic Details</LabelText>
                                    <FormControl fullWidth required>
                                        <ClassicSelect
                                            name="sclassName"
                                            value={formData.sclassName}
                                            onChange={handleInputChange}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>Select Designated Class</MenuItem>
                                            {sclassesList && sclassesList.map((item) => (
                                                <MenuItem key={item._id} value={item._id}>
                                                    {item.sclassName}
                                                </MenuItem>
                                            ))}
                                        </ClassicSelect>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LabelText>Roll Number</LabelText>
                                    <ClassicTextField fullWidth name="rollNum" type="number" required value={formData.rollNum} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LabelText>Temporary Password</LabelText>
                                    <ClassicTextField fullWidth name="password" type="password" required value={formData.password} onChange={handleInputChange} />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* SECTION 2: DEMOGRAPHIC REGISTRY */}
                        <Box>
                            <SectionHeading>Personal Details</SectionHeading>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <LabelText>Date of Birth</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <LabelText>Date in Words (Auto-Generated)</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="birthDateInWords"
                                        value={formData.birthDateInWords}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Gender</LabelText>
                                    <FormControl fullWidth>
                                        <ClassicSelect name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </ClassicSelect>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Mother Tongue</LabelText>
                                    <ClassicTextField fullWidth name="motherTongue" value={formData.motherTongue} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Religion</LabelText>
                                    <ClassicTextField fullWidth name="religion" value={formData.religion} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Caste</LabelText>
                                    <ClassicTextField fullWidth name="caste" value={formData.caste} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Sub-Caste</LabelText>
                                    <ClassicTextField fullWidth name="subCaste" value={formData.subCaste} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Mother's Full Name</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="motherName"
                                        value={formData.motherName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Date of Admission to This School</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        type="date"
                                        name="admissionDate"
                                        value={formData.admissionDate}
                                        onChange={handleInputChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <LabelText>Previous School Attended</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="previousSchoolName"
                                        value={formData.previousSchoolName}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LabelText>Last Standard Studied</LabelText>
                                    <ClassicTextField
                                        fullWidth
                                        name="previousSchoolStandard"
                                        value={formData.previousSchoolStandard}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* SECTION 3: CONTACT & ORIGIN */}
                        <Box>
                            <SectionHeading>Communication & Origin</SectionHeading>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Email Address</LabelText>
                                    <ClassicTextField fullWidth name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Mobile Number</LabelText>
                                    <ClassicTextField fullWidth name="phone" value={formData.phone} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Place of Birth</LabelText>
                                    <ClassicTextField fullWidth name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LabelText>Nationality</LabelText>
                                    <ClassicTextField fullWidth name="nationality" value={formData.nationality} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <LabelText>Permanent Residential Address</LabelText>
                                    <ClassicTextField fullWidth name="address" multiline rows={2} value={formData.address} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={4}>
                                    <LabelText>Village/City</LabelText>
                                    <ClassicTextField fullWidth name="village" value={formData.village} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={4}>
                                    <LabelText>Taluka</LabelText>
                                    <ClassicTextField fullWidth name="taluka" value={formData.taluka} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={4}>
                                    <LabelText>District</LabelText>
                                    <ClassicTextField fullWidth name="district" value={formData.district} onChange={handleInputChange} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                            <Primary3DButton type="submit" disabled={loader}>
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Authorize Enrollment"}
                            </Primary3DButton>
                        </Box>
                    </Stack>
                </form>
            </DossierPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AddStudent;

// --- STYLED COMPONENTS ---

const DossierPaper = styled(Paper)`
    && {
        max-width: 900px;
        margin: auto;
        padding: 50px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
        box-shadow: 10px 10px 0px #e0dcd0;
    }
`;

const HeaderSection = styled(Box)`
    margin-bottom: 30px;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 15px;
`;

const ClassicTitle = styled(Typography)`
    && { font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; }
`;

const ClassicSubtitle = styled(Typography)`
    && { font-family: serif; font-style: italic; color: #7d6b5d; font-size: 0.95rem; }
`;

const SectionHeading = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 1.5px;
        color: #1a1a1a;
        margin-bottom: 15px;
        border-left: 4px solid #1a1a1a;
        padding-left: 10px;
    }
`;

const LabelText = styled.p`
    font-family: serif; font-size: 0.7rem; text-transform: uppercase; color: #7d6b5d; font-weight: bold; margin: 0 0 5px 0;
`;

const ClassicTextField = styled(TextField)`
    & .MuiOutlinedInput-root {
        border-radius: 0;
        font-family: 'Georgia', serif;
        background-color: #fdfcf8;
        & fieldset { border-color: #e0dcd0; }
        &.Mui-focused fieldset { border-color: #1a1a1a; }
    }
`;

const ClassicSelect = styled(Select)`
    &.MuiOutlinedInput-root {
        border-radius: 0;
        font-family: 'Georgia', serif;
        background-color: #fdfcf8;
        & fieldset { border-color: #e0dcd0; }
        &.Mui-focused fieldset { border-color: #1a1a1a; }
    }
`;

const Primary3DButton = styled.button`
    background-color: #1a1a1a; color: white; padding: 14px 40px; border: none;
    font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 2px;
    box-shadow: 4px 4px 0px #7d6b5d; cursor: pointer;
    &:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #7d6b5d; }
    &:disabled { background-color: #ccc; box-shadow: none; }
`;