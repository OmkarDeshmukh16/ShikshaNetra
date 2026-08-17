import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Box, TextField, Container, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import axios from 'axios';
import { BASEURL } from '../utils/apiConfig';

const DemoRequestPage = () => {
    const [formData, setFormData] = useState({
        schoolName: '',
        contactPerson: '',
        phone: '',
        email: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Enter a valid 10-digit phone number';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError('');
        try {
            await axios.post(`${BASEURL}/DemoRequest`, formData);
            setSubmitted(true);
        } catch (error) {
            if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                setServerError('Unable to connect to backend server. Please ensure the backend server is running.');
            } else {
                setServerError(
                    error.response?.data?.message || 'Something went wrong. Please try again later.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <PageWrapper>
                <SuccessContainer>
                    <SuccessIconWrapper>
                        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#2e7d32' }} />
                    </SuccessIconWrapper>
                    <SuccessTitle>Request Submitted Successfully!</SuccessTitle>
                    <SuccessMessage>
                        Thank you for your interest in OM SaaS School Management System.
                        Our team will review your request and contact you within 24-48 hours
                        via phone or WhatsApp.
                    </SuccessMessage>
                    <BackButton to="/">
                        <ArrowBackIcon sx={{ mr: 1, fontSize: 18 }} /> Return to Homepage
                    </BackButton>
                </SuccessContainer>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Container maxWidth="lg">
                <Grid container sx={{ minHeight: '100vh', alignItems: 'center' }}>
                    {/* Left side — Info Panel */}
                    <Grid item xs={12} md={5}>
                        <InfoPanel>
                            <BackLink to="/">
                                <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} /> Back to Home
                            </BackLink>
                            <InfoTitle>Partner With Us</InfoTitle>
                            <InfoSubtitle>
                                Take the first step towards digitizing your institution's
                                administration with our comprehensive management platform.
                            </InfoSubtitle>
                            <StepList>
                                <StepItem>
                                    <StepNumber>01</StepNumber>
                                    <StepText>
                                        <StepLabel>Submit Request</StepLabel>
                                        <StepDesc>Fill the form with your institution details</StepDesc>
                                    </StepText>
                                </StepItem>
                                <StepItem>
                                    <StepNumber>02</StepNumber>
                                    <StepText>
                                        <StepLabel>Personal Demo</StepLabel>
                                        <StepDesc>Our team contacts you for a personalized walkthrough</StepDesc>
                                    </StepText>
                                </StepItem>
                                <StepItem>
                                    <StepNumber>03</StepNumber>
                                    <StepText>
                                        <StepLabel>Onboarding</StepLabel>
                                        <StepDesc>We set up your school and share admin credentials</StepDesc>
                                    </StepText>
                                </StepItem>
                                <StepItem>
                                    <StepNumber>04</StepNumber>
                                    <StepText>
                                        <StepLabel>Go Live</StepLabel>
                                        <StepDesc>Start managing your institution digitally</StepDesc>
                                    </StepText>
                                </StepItem>
                            </StepList>
                        </InfoPanel>
                    </Grid>

                    {/* Right side — Form */}
                    <Grid item xs={12} md={7}>
                        <FormPanel>
                            <FormHeader>
                                <FormTitle>Request a Demo</FormTitle>
                                <FormSubtitle>
                                    Complete the form below and our team will reach out to you shortly.
                                </FormSubtitle>
                            </FormHeader>

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <FieldGroup>
                                    <FieldLabel>
                                        <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} /> Institution Name *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth name="schoolName" placeholder="e.g. Springfield Public School"
                                        value={formData.schoolName} onChange={handleChange}
                                        error={!!errors.schoolName} helperText={errors.schoolName}
                                    />
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel>
                                        <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} /> Contact Person Name *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth name="contactPerson" placeholder="e.g. Rajesh Sharma"
                                        value={formData.contactPerson} onChange={handleChange}
                                        error={!!errors.contactPerson} helperText={errors.contactPerson}
                                    />
                                </FieldGroup>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FieldGroup>
                                            <FieldLabel>
                                                <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} /> Phone Number *
                                            </FieldLabel>
                                            <StyledTextField
                                                fullWidth name="phone" placeholder="e.g. 9876543210"
                                                value={formData.phone} onChange={handleChange}
                                                error={!!errors.phone} helperText={errors.phone}
                                            />
                                        </FieldGroup>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FieldGroup>
                                            <FieldLabel>
                                                <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} /> Email Address *
                                            </FieldLabel>
                                            <StyledTextField
                                                fullWidth name="email" placeholder="e.g. admin@school.com"
                                                value={formData.email} onChange={handleChange}
                                                error={!!errors.email} helperText={errors.email}
                                            />
                                        </FieldGroup>
                                    </Grid>
                                </Grid>

                                <FieldGroup>
                                    <FieldLabel>
                                        <MessageIcon sx={{ fontSize: 14, mr: 0.5 }} /> Message (Optional)
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth multiline rows={4} name="message"
                                        placeholder="Tell us about your institution, number of students, specific requirements..."
                                        value={formData.message} onChange={handleChange}
                                    />
                                </FieldGroup>

                                {serverError && (
                                    <ErrorBanner>{serverError}</ErrorBanner>
                                )}

                                <SubmitButton type="submit" disabled={loading}>
                                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Submit Request'}
                                </SubmitButton>

                                <LoginHint>
                                    Already have credentials?{' '}
                                    <StyledLink to="/choose">Sign in here</StyledLink>
                                </LoginHint>
                            </Box>
                        </FormPanel>
                    </Grid>
                </Grid>
            </Container>
        </PageWrapper>
    );
};

export default DemoRequestPage;

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
    background-color: #f9f7f2;
    min-height: 100vh;
`;

const InfoPanel = styled.div`
    padding: 60px 40px;
    @media (max-width: 900px) {
        padding: 40px 20px;
    }
`;

const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    font-family: serif;
    font-size: 0.85rem;
    color: #7d6b5d;
    text-decoration: none;
    margin-bottom: 40px;
    &:hover { color: #1a1a1a; }
`;

const InfoTitle = styled.h1`
    font-family: 'Georgia', serif;
    font-size: 2.8rem;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0 0 20px 0;
    line-height: 1.1;
`;

const InfoSubtitle = styled.p`
    font-family: serif;
    font-size: 1.05rem;
    color: #666;
    line-height: 1.7;
    margin-bottom: 50px;
`;

const StepList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
`;

const StepItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 18px;
`;

const StepNumber = styled.div`
    font-family: 'Georgia', serif;
    font-size: 1.5rem;
    font-weight: bold;
    color: #e0dcd0;
    min-width: 40px;
`;

const StepText = styled.div``;

const StepLabel = styled.h4`
    font-family: 'Georgia', serif;
    font-size: 1rem;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StepDesc = styled.p`
    font-family: serif;
    font-size: 0.9rem;
    color: #888;
    margin: 0;
`;

const FormPanel = styled.div`
    background: white;
    border: 1px solid #e0dcd0;
    padding: 50px 45px;
    box-shadow: 8px 8px 0px #e0dcd0;
    margin: 40px 0;
    @media (max-width: 600px) {
        padding: 30px 20px;
    }
`;

const FormHeader = styled.div`
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 20px;
    margin-bottom: 35px;
`;

const FormTitle = styled.h2`
    font-family: 'Georgia', serif;
    font-size: 1.6rem;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0 0 8px 0;
`;

const FormSubtitle = styled.p`
    font-family: serif;
    font-style: italic;
    color: #7d6b5d;
    font-size: 0.9rem;
    margin: 0;
`;

const FieldGroup = styled.div`
    margin-bottom: 20px;
`;

const FieldLabel = styled.p`
    font-family: serif;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #7d6b5d;
    margin: 0 0 6px 0;
    letter-spacing: 1px;
    font-weight: 700;
    display: flex;
    align-items: center;
`;

const StyledTextField = styled(TextField)`
    & .MuiOutlinedInput-root {
        border-radius: 0;
        font-family: 'Georgia', serif;
        background-color: #fafaf8;
        & fieldset { border-color: #e0dcd0; }
        &.Mui-focused fieldset { border-color: #1a1a1a; }
    }
    & .MuiFormHelperText-root {
        font-family: serif;
        font-style: italic;
    }
`;

const ErrorBanner = styled.div`
    background-color: #fff5f5;
    border: 1px solid #e53e3e;
    color: #c53030;
    padding: 12px 16px;
    font-family: serif;
    font-size: 0.9rem;
    margin-bottom: 20px;
`;

const SubmitButton = styled.button`
    background-color: #1a1a1a;
    color: white;
    border: none;
    padding: 16px;
    width: 100%;
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 5px 5px 0px #7d6b5d;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        transform: translate(-2px, -2px);
        box-shadow: 7px 7px 0px #7d6b5d;
    }
    &:active {
        transform: translate(2px, 2px);
        box-shadow: 0px 0px 0px;
    }
    &:disabled {
        background-color: #aaa;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
    }
`;

const LoginHint = styled.p`
    text-align: center;
    font-family: serif;
    color: #7d6b5d;
    margin-top: 20px;
    font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
    color: #1a1a1a;
    font-weight: bold;
    text-decoration: none;
    border-bottom: 1px solid #1a1a1a;
    &:hover { background-color: #f4f1ea; }
`;

// Success state components
const SuccessContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
    text-align: center;
`;

const SuccessIconWrapper = styled.div`
    width: 120px;
    height: 120px;
    border: 2px solid #e0dcd0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    animation: fadeIn 0.6s ease-out;
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
    }
`;

const SuccessTitle = styled.h2`
    font-family: 'Georgia', serif;
    font-size: 1.8rem;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0 0 20px 0;
`;

const SuccessMessage = styled.p`
    font-family: serif;
    font-size: 1.05rem;
    color: #666;
    line-height: 1.8;
    max-width: 500px;
    margin-bottom: 40px;
`;

const BackButton = styled(Link)`
    display: inline-flex;
    align-items: center;
    background-color: #1a1a1a;
    color: white;
    text-decoration: none;
    padding: 14px 30px;
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 0.85rem;
    box-shadow: 4px 4px 0px #7d6b5d;
    transition: all 0.2s;
    &:hover {
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0px #7d6b5d;
    }
`;
