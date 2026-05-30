import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button, Grid, Box, Typography, Paper, Checkbox,
    FormControlLabel, TextField, CssBaseline, IconButton,
    InputAdornment, CircularProgress, Backdrop
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import login from "../assets/login.jpg";
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

// Creating a Classic Theme Override for MUI
const classicTheme = createTheme({
    palette: {
        primary: { main: '#1a1a1a' }, // Deep Charcoal/Black
        secondary: { main: '#7d6b5d' }, // Muted Taupe
    },
    typography: {
        fontFamily: "'Charter', 'Georgia', serif",
    },
});

const LoginPage = ({ role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false);
    const [guestLoader, setGuestLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (role === "Student") {
            const rollNum = event.target.rollNumber.value;
            const studentName = event.target.studentName.value;
            const password = event.target.password.value;

            if (!rollNum || !studentName || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!studentName) setStudentNameError(true);
                if (!password) setPasswordError(true);
                return;
            }
            dispatch(loginUser({ rollNum, studentName, password }, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;
            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }
            dispatch(loginUser({ email, password }, role));
        }
        setLoader(true);
    };

    const handleInputChange = (e) => {
        const { name } = e.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') navigate('/Admin/dashboard');
            else if (currentRole === 'Student') navigate('/Student/dashboard');
            else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
        } else if (status === 'failed' || status === 'error') {
            setMessage(status === 'failed' ? response : "Network Error");
            setShowPopup(true);
            setLoader(false);
            setGuestLoader(false);
        }
    }, [status, currentRole, navigate, response, currentUser]);

    return (
        <ThemeProvider theme={classicTheme}>
            <Grid container component="main" sx={{ height: '100vh', backgroundColor: "#f9f7f2" }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square
                    sx={{ borderRight: '1px solid #e0dcd0', backgroundColor: '#fff' }}>
                    <Box sx={{ my: 12, mx: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

                        <BackLink to="/choose">
                            <ArrowBack sx={{ fontSize: 18, mr: 1 }} /> Back to Portals
                        </BackLink>

                        <ClassicTitle variant="h3">
                            {role} Portal
                        </ClassicTitle>
                        <ClassicSubtitle>
                            Enter your credentials to access the academic management system.
                        </ClassicSubtitle>

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4, width: '100%' }}>
                            {role === "Student" ? (
                                <>
                                    <StyledTextField
                                        margin="normal" required fullWidth name="rollNumber"
                                        label="Roll Number" type="number" error={rollNumberError}
                                        onChange={handleInputChange} helperText={rollNumberError && 'Required'}
                                    />
                                    <StyledTextField
                                        margin="normal" required fullWidth name="studentName"
                                        label="Full Name" error={studentNameError}
                                        onChange={handleInputChange} helperText={studentNameError && 'Required'}
                                    />
                                </>
                            ) : (
                                <StyledTextField
                                    margin="normal" required fullWidth name="email"
                                    label="Email Address" error={emailError}
                                    onChange={handleInputChange} helperText={emailError && 'Required'}
                                />
                            )}
                            <StyledTextField
                                margin="normal" required fullWidth name="password"
                                label="Password" type={toggle ? 'text' : 'password'}
                                error={passwordError} onChange={handleInputChange}
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

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" sx={{ '&.Mui-checked': { color: '#1a1a1a' } }} />}
                                    label={<Typography sx={{ fontSize: '0.9rem', fontFamily: 'serif' }}>Remember me</Typography>}
                                />
                                <ForgotLink href="#">Forgot password?</ForgotLink>
                            </Box>

                            <Primary3DButton type="submit" fullWidth variant="contained">
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                            </Primary3DButton>

                            <Secondary3DButton fullWidth variant="outlined" onClick={() => { setGuestLoader(true); /* add guest logic */ }}>
                                Continue as Guest
                            </Secondary3DButton>

                            {role === "Admin" && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'serif', fontStyle: 'italic' }}>
                                        New School? <StyledLink to="/request-demo">Request a Demo</StyledLink>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={false} sm={4} md={7}
                    sx={{
                        backgroundImage: `url(${login})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'grayscale(20%) contrast(1.1)', // Classic editorial photo filter
                    }}
                />
            </Grid>
            <Backdrop sx={{ color: '#fff', zIndex: 999 }} open={guestLoader}>
                <CircularProgress color="inherit" />
                <Typography sx={{ ml: 2, fontFamily: 'serif' }}>Initialising Session...</Typography>
            </Backdrop>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ThemeProvider>
    );
}

export default LoginPage;

// --- STYLED COMPONENTS ---

const ClassicTitle = styled(Typography)`
    font-family: 'Georgia', serif !important;
    font-weight: 400 !important;
    color: #1a1a1a;
    letter-spacing: -1px;
`;

const ClassicSubtitle = styled(Typography)`
    font-family: 'serif' !important;
    font-style: italic;
    color: #666;
    margin-top: 8px !important;
`;

const StyledTextField = styled(TextField)`
    & .MuiOutlinedInput-root {
        border-radius: 0; /* Classic sharp corners */
        &.Mui-focused fieldset {
            border-color: #1a1a1a;
        }
    }
    & .MuiInputLabel-root.Mui-focused {
        color: #1a1a1a;
    }
`;

const Primary3DButton = styled(Button)`
    && {
        background-color: #1a1a1a;
        margin-top: 24px;
        padding: 12px;
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 4px 4px 0px #7d6b5d; /* 3D Offset shadow */
        transition: all 0.2s ease;

        &:hover {
            background-color: #333;
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px #7d6b5d;
        }
        &:active {
            transform: translate(2px, 2px);
            box-shadow: 0px 0px 0px #7d6b5d;
        }
    }
`;

const Secondary3DButton = styled(Button)`
    && {
        margin-top: 16px;
        padding: 12px;
        border-radius: 0;
        border: 1px solid #1a1a1a;
        color: #1a1a1a;
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: all 0.2s ease;

        &:hover {
            background-color: #f5f5f5;
            border-color: #1a1a1a;
        }
    }
`;

const StyledLink = styled(Link)`
    text-decoration: underline;
    color: #1a1a1a;
    font-weight: bold;
`;

const ForgotLink = styled.a`
    font-family: serif;
    font-size: 0.9rem;
    color: #666;
    text-decoration: none;
    &:hover { text-decoration: underline; }
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