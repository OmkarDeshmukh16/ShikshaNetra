import { useState } from 'react';
import {
    CssBaseline, Box, Toolbar, List, Typography, Divider, IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import styled from 'styled-components';

import SASideBar from './SASideBar';
import SAHomePage from './SAHomePage';
import SADemoRequests from './SADemoRequests';
import SASchoolList from './SASchoolList';
import SACreateSchool from './SACreateSchool';
import Logout from '../Logout';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
            <CssBaseline />

            <StyledAppBar open={open} position="absolute" elevation={0}>
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
                        Super Admin — Platform Control
                    </DashboardTitle>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography sx={{ fontFamily: 'serif', color: '#7d6b5d', fontSize: '0.85rem' }}>
                        OM SaaS Platform
                    </Typography>
                </Toolbar>
            </StyledAppBar>

            <StyledDrawer variant="permanent" open={open}>
                <Toolbar sx={styles.toolBarStyled}>
                    <Typography sx={{
                        fontFamily: "'Georgia', serif",
                        color: '#1a1a1a',
                        flexGrow: 1,
                        ml: 2,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                    }}>
                        Control Panel
                    </Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider sx={{ borderColor: '#e0dcd0' }} />
                <List component="nav" sx={{ pt: 2 }}>
                    <SASideBar />
                </List>
            </StyledDrawer>

            <MainContent component="main">
                <Toolbar />
                <Box sx={{ p: 4 }}>
                    <Routes>
                        <Route path="/" element={<SAHomePage />} />
                        <Route path="/SuperAdmin/dashboard" element={<SAHomePage />} />
                        <Route path="/SuperAdmin/demo-requests" element={<SADemoRequests />} />
                        <Route path="/SuperAdmin/schools" element={<SASchoolList />} />
                        <Route path="/SuperAdmin/create-school" element={<SACreateSchool />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Box>
            </MainContent>
        </Box>
    );
};

export default SuperAdminDashboard;

// --- STYLED COMPONENTS ---

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
        font-size: 1.05rem;
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
    background-color: #f9f7f2;
`;

const styles = {
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
        borderBottom: '1px solid #e0dcd0',
    },
};
