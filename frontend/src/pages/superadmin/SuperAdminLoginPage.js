import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid, Box, Paper, TextField, CssBaseline,
    IconButton, InputAdornment, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import SecurityIcon from '@mui/icons-material/Security';
import styled from 'styled-components';
import { loginSuperAdmin } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';

const SuperAdminLoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!email || !password) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }

        setLoader(true);
        dispatch(loginSuperAdmin({ email, password }));
    };

    const handleInputChange = (e) => {
        const { name } = e.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
    };

    useEffect(() => {
        if (status === 'success' && currentRole === 'SuperAdmin') {
            navigate('/SuperAdmin/dashboard');
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage('Network Error');
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, currentRole, navigate, response]);

    return (
        <PageWrapper>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                {/* Left — Branding Panel */}
                <Grid item xs={false} sm={4} md={7}>
                    <BrandingPanel>
                        <BrandingContent>
                            <SecurityIcon sx={{ fontSize: 80, color: '#7d6b5d', mb: 3 }} />
                            <BrandTitle>Platform Control Center</BrandTitle>
                            <BrandSubtitle>
                                Restricted access. This portal is exclusively for the
                                OM SaaS platform administrator.
                            </BrandSubtitle>
                            <DecorativeLine />
                            <BrandFooter>OM SaaS · School Management Platform</BrandFooter>
                        </BrandingContent>
                    </BrandingPanel>
                </Grid>

                {/* Right — Login Form */}
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square
                    sx={{ backgroundColor: '#ffffff', borderLeft: '1px solid #e0dcd0' }}>
                    <Box sx={{ my: 12, mx: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

                        <BackLink to="/">
                            <ArrowBack sx={{ fontSize: 18, mr: 1 }} /> Back to Home
                        </BackLink>

                        <HeaderSection>
                            <ClassicTitle>Super Admin</ClassicTitle>
                            <ClassicSubtitle>Enter your platform administrator credentials</ClassicSubtitle>
                        </HeaderSection>

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4, width: '100%' }}>
                            <LabelText>Email Address</LabelText>
                            <StyledTextField
                                margin="normal" required fullWidth name="email"
                                autoComplete="email" autoFocus
                                error={emailError}
                                helperText={emailError && 'Email is required'}
                                onChange={handleInputChange}
                            />

                            <LabelText>Password</LabelText>
                            <StyledTextField
                                margin="normal" required fullWidth name="password"
                                type={toggle ? 'text' : 'password'}
                                error={passwordError}
                                helperText={passwordError && 'Password is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <LoginButton type="submit" disabled={loader}>
                                {loader ? <CircularProgress size={22} color="inherit" /> : 'Access Control Panel'}
                            </LoginButton>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageWrapper>
    );
};

export default SuperAdminLoginPage;

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
    background-color: #f9f7f2;
    min-height: 100vh;
`;

const BrandingPanel = styled.div`
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BrandingContent = styled.div`
    text-align: center;
    padding: 60px;
    max-width: 500px;
`;

const BrandTitle = styled.h1`
    font-family: 'Georgia', serif;
    color: #ffffff;
    font-size: 2.2rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin: 0 0 20px 0;
`;

const BrandSubtitle = styled.p`
    font-family: serif;
    color: #999;
    font-size: 1rem;
    line-height: 1.7;
    font-style: italic;
`;

const DecorativeLine = styled.div`
    width: 60px;
    height: 2px;
    background-color: #7d6b5d;
    margin: 30px auto;
`;

const BrandFooter = styled.p`
    font-family: serif;
    color: #555;
    font-size: 0.8rem;
    letter-spacing: 2px;
    text-transform: uppercase;
`;

const HeaderSection = styled.div`
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 15px;
    width: 100%;
`;

const ClassicTitle = styled.h2`
    font-family: 'Georgia', serif;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 400;
    margin: 0 0 8px 0;
    font-size: 1.8rem;
`;

const ClassicSubtitle = styled.p`
    font-family: serif;
    font-style: italic;
    color: #7d6b5d;
    font-size: 0.9rem;
    margin: 0;
`;

const LabelText = styled.p`
    font-family: serif;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #7d6b5d;
    margin: 15px 0 0 0;
    letter-spacing: 1px;
    font-weight: 700;
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

const LoginButton = styled.button`
    background-color: #1a1a1a;
    color: white;
    border: none;
    padding: 15px;
    margin-top: 30px;
    width: 100%;
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 0.9rem;
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
    &:disabled {
        background-color: #aaa;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
    }
`;

const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    font-family: 'Georgia', serif;
    font-size: 0.9rem;
    color: #7d6b5d;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 24px;
    transition: color 0.2s ease;
    &:hover {
        color: #1a1a1a;
    }
`;
