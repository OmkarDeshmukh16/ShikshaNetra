import { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import styled from 'styled-components';

// --- YOUR ORIGINAL IMPORTS ---
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';
import AddStudent from './studentRelated/AddStudent';
import BulkEnrollment from './studentRelated/BulkEnrollment';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';
import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';
import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';
import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';
import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';
import ShowFees from './studentRelated/ShowFees';
import FeeLedger from './studentRelated/FeeLedger';
import LivingCertificate from './LivingCertificate';
import BonafideCertificate from './BonafideCertificate';
import SchoolDocuments from './documentRelated/SchoolDocuments';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => { setOpen(!open); };
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
            <CssBaseline />

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
                        System Administration
                    </DashboardTitle>
                    <AccountMenu />
                </Toolbar>
            </StyledAppBar>

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
                    <SideBar />
                </List>
            </StyledDrawer>

            <MainContent component="main">
                <Toolbar />
                <Box sx={{ p: 4 }}>
                    <Routes>
                        {/* Base Routes */}
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/documents" element={<SchoolDocuments />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />
                        <Route path="/Admin/students/student/lc/:id" element={<LivingCertificate />} />
                        <Route path="/Admin/students/student/bonafide/:id" element={<BonafideCertificate />} />

                        {/* Notice Routes */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject Routes */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class Routes */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student Routes */}
                        <Route path="/Admin/bulk-enroll" element={<BulkEnrollment />} />
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* --- Fee Routes --- */}
                        <Route path="/Admin/fees" element={currentUser ? <ShowFees /> : <Navigate to="/Adminlogin" />} />
                        <Route path="/Admin/students/student/fees/:id" element={<FeeLedger />} />

                        {/* Teacher Routes */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </MainContent>
        </Box>
    );
}

export default AdminDashboard;

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
    background-color: #f9f7f2;
`;

const styles = {
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
        borderBottom: '1px solid #e0dcd0',
    }
};