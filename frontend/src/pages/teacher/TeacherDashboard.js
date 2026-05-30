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
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';
import styled from 'styled-components';

import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherViewStudent from './TeacherViewStudent';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';
import TeacherBulkMarks from './TeacherBulkMarks';  
import TeacherBulkAttendance from './TeacherBulkAttendance';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => { setOpen(!open); };

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
            <CssBaseline />
            
            {/* Styled AppBar: White background with ink-black text */}
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
                        Faculty Portal
                    </DashboardTitle>
                    <AccountMenu />
                </Toolbar>
            </StyledAppBar>

            {/* Styled Drawer: Ivory background and structural borders */}
            <StyledDrawer variant="permanent" open={open}>
                <Toolbar sx={styles.toolBarStyled}>
                    <Typography sx={{ fontFamily: 'serif', fontStyle: 'italic', color: '#7d6b5d', flexGrow: 1, ml: 2 }}>
                        Navigation
                    </Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider sx={{ borderColor: '#e0dcd0' }} />
                <List component="nav" sx={{ pt: 2 }}>
                    <TeacherSideBar />
                </List>
            </StyledDrawer>

            <MainContent component="main">
                <Toolbar />
                <Box sx={{ p: 4 }}>
                    <Routes>
                        <Route path="/" element={<TeacherHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/profile" element={<TeacherProfile />} />
                        <Route path="/Teacher/complain" element={<TeacherComplain />} />
                        <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                        <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />
                        <Route path="/Teacher/class/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />
                        <Route path="/Teacher/marks" element={<TeacherBulkMarks />} />
                        <Route path="/Teacher/attendance" element={<TeacherBulkAttendance />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </MainContent>
        </Box>
    );
}

export default TeacherDashboard;

// --- CLASSIC STYLED COMPONENTS ---

const StyledAppBar = styled(AppBar)`
    && {
        background-color: #ffffff;
        color: #1a1a1a;
        z-index: 1201;
    }
`;

const DashboardTitle = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-size: 1.1rem;
        color: #1a1a1a;
    }
`;

const StyledDrawer = styled(Drawer)`
    & .MuiDrawer-paper {
        background-color: #ffffff;
        border-right: 1px solid #e0dcd0 !important;
        box-shadow: none !important;
    }
`;

const MainContent = styled(Box)`
    flex-grow: 1;
    height: 100vh;
    overflow: auto;
    background-color: #f9f7f2; /* Light cream/ivory background */
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