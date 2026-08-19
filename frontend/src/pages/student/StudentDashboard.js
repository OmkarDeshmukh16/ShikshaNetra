import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudentSideBar from './StudentSideBar';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import StudentMarks from './StudentMarks';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import StudentFees from './StudentFees';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import styled from 'styled-components';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => { setOpen(!open); };

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Styled AppBar: Ink-black text on white surface */}
            <StyledAppBar open={open} position='absolute' elevation={0}>
                <Toolbar sx={{ pr: '24px', borderBottom: '1px solid #e0dcd0' }}>
                    <IconButton
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{ marginRight: '36px', color: '#1a1a1a', ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, color: '#7d6b5d' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <DashboardTitle variant="h6" noWrap>
                        Scholar Portal
                    </DashboardTitle>
                    <AccountMenu />
                </Toolbar>
            </StyledAppBar>

            {/* Styled Drawer: High-contrast Sidebar */}
            <StyledDrawer variant="permanent" open={open}>
                <Toolbar sx={styles.toolBarStyled}>
                    <Typography sx={{ fontFamily: 'serif', fontStyle: 'italic', color: '#7d6b5d', flexGrow: 1, ml: 2, fontSize: '0.9rem' }}>
                        Index
                    </Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider sx={{ borderColor: '#e0dcd0' }} />
                <List component="nav" sx={{ pt: 1 }}>
                    <StudentSideBar />
                </List>
            </StyledDrawer>

            {/* Main Content Area */}
            <MainContent component="main">
                <Toolbar />
                <Box sx={{ p: 4 }}>
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />
                        <Route path="/Student/subjects" element={<StudentSubjects />} />
                        <Route path="/Student/marks" element={<StudentMarks />} />
                        <Route path="/Student/attendance" element={<ViewStdAttendance />} />
                        <Route path="/Student/fees" element={<StudentFees />} />
                        <Route path="/Student/complain" element={<StudentComplain />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </MainContent>
        </Box>
    );
}

export default StudentDashboard;

// --- CLASSIC STYLED COMPONENTS ---

const StyledAppBar = styled(AppBar)`
    && {
        background-color: #ffffff;
        color: #1a1a1a;
        box-shadow: none;
        border-bottom: 1px solid #e0dcd0;
        z-index: 1201;
    }
    @media print {
        display: none !important;
    }
`;

const DashboardTitle = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #1a1a1a;
        flex-grow: 1;
        font-size: 1.1rem;
    }
`;

const StyledDrawer = styled(Drawer)`
    & .MuiDrawer-paper {
        background-color: #ffffff;
        border-right: 1px solid #e0dcd0 !important;
        box-shadow: none !important;
    }
    @media print {
        display: none !important;
    }
`;

const MainContent = styled(Box)`
    flex-grow: 1;
    height: 100vh;
    overflow: auto;
    background-color: #f9f7f2;
    @media print {
        height: auto !important;
        overflow: visible !important;
        background-color: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
    }
`;

const styles = {
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
        borderBottom: '1px solid #e0dcd0',
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
};