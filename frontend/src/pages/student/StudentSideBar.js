import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const StudentSideBar = () => {
    const location = useLocation();

    // Helper to determine if the current path matches the navigation item
    const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

    return (
        <>
            <NavSection>
                <ClassicListItem
                    component={Link}
                    to="/"
                    $active={isActive("/") || location.pathname === "/Student/dashboard"}
                >
                    <ListItemIcon>
                        <HomeIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Institutional Home" />
                </ClassicListItem>

                <ClassicListItem
                    component={Link}
                    to="/Student/subjects"
                    $active={isActive("/Student/subjects")}
                >
                    <ListItemIcon>
                        <AssignmentIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Academic Subjects" />
                </ClassicListItem>

                <ClassicListItem
                    component={Link}
                    to="/Student/attendance"
                    $active={isActive("/Student/attendance")}
                >
                    <ListItemIcon>
                        <ClassOutlinedIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Presence Registry" />
                </ClassicListItem>

                <ClassicListItem component={Link} to="/Student/fees">
                    <ListItemIcon>
                        <AccountBalanceWalletIcon color={location.pathname === "/Student/fees" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Fee Ledger" />
                </ClassicListItem>

                <ClassicListItem
                    component={Link}
                    to="/Student/complain"
                    $active={isActive("/Student/complain")}
                >
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Grievance Record" />
                </ClassicListItem>
            </NavSection>

            <Divider sx={{ my: 2, mx: 2, borderColor: '#e0dcd0' }} />

            <NavSection>
                <ClassicListSubheader component="div" inset>
                    Scholar Identity
                </ClassicListSubheader>

                <ClassicListItem
                    component={Link}
                    to="/Student/profile"
                    $active={isActive("/Student/profile")}
                >
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Academic Profile" />
                </ClassicListItem>

                <ClassicListItem
                    component={Link}
                    to="/logout"
                    $active={isActive("/logout")}
                >
                    <ListItemIcon>
                        <ExitToAppIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Terminate Session" />
                </ClassicListItem>
            </NavSection>
        </>
    );
}

export default StudentSideBar;

// --- CLASSIC STYLED COMPONENTS ---

const NavSection = styled.div`
    padding: 0 8px;
`;

const ClassicListItem = styled(ListItemButton)`
    && {
        margin: 4px 0;
        border-radius: 0; // Removing modern curves for an architectural feel
        transition: all 0.2s ease;
        
        // Active State Logic: High contrast Ink Black background
        background-color: ${props => props.$active ? '#1a1a1a' : 'transparent'};
        
        // Text and Icon logic
        color: ${props => props.$active ? '#ffffff' : '#7d6b5d'};
        & .MuiListItemIcon-root {
            color: ${props => props.$active ? '#ffffff' : '#7d6b5d'};
            min-width: 40px;
        }

        & .MuiListItemText-primary {
            font-family: 'serif';
            font-size: 0.85rem;
            letter-spacing: 0.5px;
            text-transform: uppercase; // Matching the ledger/index feel
        }

        &:hover {
            background-color: ${props => props.$active ? '#1a1a1a' : '#f4f1ea'};
            color: ${props => props.$active ? '#ffffff' : '#1a1a1a'};
            & .MuiListItemIcon-root {
                color: ${props => props.$active ? '#ffffff' : '#1a1a1a'};
            }
        }
    }
`;

const ClassicListSubheader = styled(ListSubheader)`
    && {
        background: transparent;
        font-family: 'Georgia', serif;
        font-style: italic;
        color: #1a1a1a;
        font-size: 0.75rem;
        text-transform: none;
        letter-spacing: 1px;
        padding-bottom: 8px;
    }
`;