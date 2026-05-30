import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Icons
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';


const SideBar = () => {
    const location = useLocation();

    // Helper to check if a route is active
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

    return (
        <NavContainer>
            <React.Fragment>
                <ClassicNavButton component={Link} to="/" className={isActive("/") && location.pathname !== "/Admin/profile" ? "active" : ""}>
                    <ClassicListItemIcon>
                        <HomeIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Home" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/classes" className={isActive("/Admin/classes") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <ClassOutlinedIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Classes" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/subjects" className={isActive("/Admin/subjects") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <AssignmentIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Subjects" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/teachers" className={isActive("/Admin/teachers") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <SupervisorAccountOutlinedIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Teachers" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/students" className={isActive("/Admin/students") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <PersonOutlineIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Students" />
                </ClassicNavButton>

                <ClassicNavButton
                    component={Link}
                    to="/Admin/bulk-enroll"
                    $active={isActive("/Admin/bulk-enroll")}
                >
                    <ClassicListItemIcon>
                        <FileUploadIcon fontSize="small" color="inherit" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Bulk Enrollment" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/fees">
                    <ClassicListItemIcon>
                        <AccountBalanceWalletIcon color={location.pathname.startsWith("/Admin/fees") ? 'primary' : 'inherit'} />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Fee Ledger" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/notices" className={isActive("/Admin/notices") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <AnnouncementOutlinedIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Notices" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/Admin/complains" className={isActive("/Admin/complains") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <ReportIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Complains" />
                </ClassicNavButton>
            </React.Fragment>

            <DividerClassic />

            <React.Fragment>
                <ClassicListSubheader>User Management</ClassicListSubheader>

                <ClassicNavButton component={Link} to="/Admin/profile" className={isActive("/Admin/profile") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <AccountCircleOutlinedIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Profile" />
                </ClassicNavButton>

                <ClassicNavButton component={Link} to="/logout" className={isActive("/logout") ? "active" : ""}>
                    <ClassicListItemIcon>
                        <ExitToAppIcon fontSize="small" />
                    </ClassicListItemIcon>
                    <ClassicListItemText primary="Logout" />
                </ClassicNavButton>
            </React.Fragment>
        </NavContainer>
    );
}

export default SideBar;

// --- STYLED COMPONENTS ---

const NavContainer = styled(Box)`
    padding: 10px 14px;
`;

const ClassicNavButton = styled(ListItemButton)`
    && {
        margin-bottom: 4px;
        border-radius: 0;
        border-left: 3px solid transparent;
        transition: all 0.2s ease;
        padding: 10px 16px;

        &:hover {
            background-color: #f9f7f2;
            border-left: 3px solid #7d6b5d;
        }

        &.active {
            background-color: #f4f1ea;
            border-left: 3px solid #1a1a1a;
            
            span {
                font-weight: bold;
                color: #1a1a1a;
            }
            svg {
                color: #1a1a1a;
            }
        }
    }
`;

const ClassicListItemIcon = styled(ListItemIcon)`
    && {
        min-width: 40px;
        color: #7d6b5d; /* Muted accent color */
    }
`;

const ClassicListItemText = styled(ListItemText)`
    & span {
        font-family: 'Georgia', serif;
        font-size: 0.95rem;
        color: #444;
    }
`;

const ClassicListSubheader = styled(ListSubheader)`
    && {
        background: none;
        font-family: serif;
        font-style: italic;
        font-size: 0.8rem;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-top: 15px;
        padding-bottom: 5px;
    }
`;

const DividerClassic = styled(Divider)`
    && {
        margin: 15px 0;
        border-color: #e0dcd0;
    }
`;