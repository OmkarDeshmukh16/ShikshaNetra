import React, { useEffect, useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents, deleteUser } from '../../../redux/studentRelated/studentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import {
    Box, IconButton, Paper, Typography, CircularProgress,
    Button, ButtonGroup, ClickAwayListener, Grow, Popper,
    MenuItem, MenuList, Select
} from '@mui/material';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
// Icons
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
//import { calculateOverallAttendancePercentage } from '../../../components/attendanceCalculator';

// Components
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { studentsList, loading, response } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [selectedClass, setSelectedClass] = useState("all");
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    // --- FILTER LOGIC ---
    const filteredStudents = selectedClass === "all"
        ? studentsList
        : studentsList?.filter(student => student.sclassName?._id === selectedClass);

    const [studentToDelete, setStudentToDelete] = useState(null);
    const deleteHandler = (id) => {
        setStudentToDelete(id);
        setMessage("Are you sure you want to permanently purge this scholar's record?");
        setShowPopup(true);
    };

    const confirmDeletion = () => {
        dispatch(deleteUser(studentToDelete, "Student"));
        setShowPopup(false);
    };

    // Update useEffect to catch deletion success
    useEffect(() => {
        if (response === 'deleted') {
            setMessage("Registry updated: Record removed.");
            setShowPopup(true);
            dispatch(getAllStudents(currentUser._id)); // Refresh the list
        }
    }, [response, dispatch, currentUser._id]);

    const exportToExcel = () => {
        // 1. Prepare data from the currently filtered list
        const reportData = filteredStudents.map((student) => ({
            "Student Name": student.name,
            "Roll Number": student.rollNum,
            "Class": student.sclassName?.sclassName || "Unassigned",
            "Email": student.email || "N/A",
            "Gender": student.gender || "N/A",
            "Date of birth": student.dob ? new Date(student.dob).toLocaleDateString() : "N/A",
            "Nationality": student.nationality || "N/A",
            "Mother Tongue": student.motherTongue || "N/A",
            "Religion": student.religion || "N/A",
            "Caste": student.caste || "N/A",
            "Sub caste": student.subCaste || "N/A",
            "Birth Place": student.birthPlace || "N/A",
            "Address": student.address || "N/A",
            "Date of admission": student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A",
            "Previous School Name": student.previousSchoolName || "N/A",
            "Previous School Standard": student.previousSchoolStandard || "N/A",
            "Progress": student.progress || "N/A",
            "Conduct": student.conduct || "N/A",
        }));

        // 2. Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered_Scholar_List");

        // 3. Set column widths for a "Classic" professional look
        const wscols = Object.keys(reportData[0] || {}).map(() => ({ wch: 20 }));
        worksheet['!cols'] = wscols;

        // 4. Generate filename based on selection
        const className = selectedClass === "all" ? "All_Classes" : filteredStudents[0]?.sclassName?.sclassName;
        const fileName = `Scholar_Registry_${className}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // 5. Trigger download
        XLSX.writeFile(workbook, fileName);
    };

    const studentColumns = [
        { id: 'name', label: 'Scholar Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
        { id: 'sclassName', label: 'Designated Class', minWidth: 170 },
    ];

    const studentRows = filteredStudents?.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student.sclassName?.sclassName || "Unassigned",
        id: student._id,
    }));

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) navigate("/Admin/students/student/attendance/" + row.id);
            else if (selectedIndex === 1) navigate("/Admin/students/student/marks/" + row.id);
        };

        return (
            <ActionContainer>
                <IconButton onClick={() => deleteHandler(row.id)}>
                    <PersonRemoveIcon color="error" fontSize="small" />
                </IconButton>

                <ClassicSmallButton onClick={() => navigate("/Admin/students/student/" + row.id)}>
                    <VisibilityIcon fontSize="inherit" sx={{ mr: 1 }} /> View File
                </ClassicSmallButton>

                <Fragment>
                    <StyledButtonGroup variant="outlined" ref={anchorRef}>
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <Button
                            size="small"
                            onClick={() => setOpen((prev) => !prev)}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </Button>
                    </StyledButtonGroup>
                    <Popper open={open} anchorEl={anchorRef.current} transition disablePortal sx={{ zIndex: 10 }}>
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                            >
                                <Paper sx={styles.classicMenu}>
                                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                                        <MenuList id="split-button-menu">
                                            {options.map((option, index) => (
                                                <ClassicMenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={() => {
                                                        setSelectedIndex(index);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {option}
                                                </ClassicMenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </Fragment>
            </ActionContainer>
        );
    };

    const actions = [
        { icon: <PersonAddAlt1Icon />, name: 'Enroll Scholar', action: () => navigate("/Admin/addstudents") },
        { icon: <PersonRemoveIcon />, name: 'Purge Registry', action: deleteHandler },
    ];

    return (
        <RegistryContainer>
            <RegistryHeader>
                <Box>
                    <TypographyClassic variant="h4">General Registr</TypographyClassic>
                    <TypographySubtitle>A comprehensive index of enrolled scholars and academic standings</TypographySubtitle>
                </Box>
                {studentsList && studentsList.length > 0 && (
                    <Classic3DButton onClick={() => navigate("/Admin/addstudents")}>
                        Enroll Scholar
                    </Classic3DButton>
                )}
            </RegistryHeader>

            {/* CLASSIC FILTER BAR */}
            <FilterPaper elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FilterListIcon sx={{ color: '#7d6b5d' }} />
                    <Box>
                        <LabelText>Filter by Academic Cohort</LabelText>
                        <ClassicSelect
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all"><em>All Registered Students</em></MenuItem>
                            {sclassesList?.map((sclass) => (
                                <MenuItem key={sclass._id} value={sclass._id}>
                                    {sclass.sclassName}
                                </MenuItem>
                            ))}
                        </ClassicSelect>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* NEW EXPORT BUTTON */}
                    <Box sx={{ textAlign: 'center' }}>
                        <LabelText>Data Export</LabelText>
                        <ClassicSmallButton
                            onClick={exportToExcel}
                            disabled={filteredStudents?.length === 0}
                            style={{ borderStyle: 'dashed' }}
                        >
                            Download GR File
                        </ClassicSmallButton>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <LabelText>Registry Count</LabelText>
                        <Typography sx={{ fontFamily: 'Georgia', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {filteredStudents?.length || 0}
                        </Typography>
                    </Box>
                </Box>
            </FilterPaper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress color="inherit" /></Box>
            ) : (
                <TableWrapper>
                    {response || filteredStudents?.length === 0 ? (
                        <EmptyState>
                            <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
                                No scholars found in the selected category.
                            </Typography>
                        </EmptyState>
                    ) : (
                        <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                    )}
                    <SpeedDialTemplate actions={actions} />
                </TableWrapper>
            )}
            <Popup
                message={message}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                showConfirm={message.includes("permanently purge")}
                onConfirm={confirmDeletion}
            />
        </RegistryContainer>
    );
};

export default ShowStudents;

// --- CLASSIC STYLED COMPONENTS ---

const RegistryContainer = styled(Box)`
    padding: 20px;
    background-color: #f9f7f2;
    min-height: 100vh;
`;

const RegistryHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 30px;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 20px;
`;

const FilterPaper = styled(Paper)`
    && {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        margin-bottom: 30px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
    }
`;

const TypographyClassic = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        color: #1a1a1a;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
`;

const TypographySubtitle = styled.p`
    font-family: serif; font-style: italic; color: #7d6b5d; margin: 5px 0 0 0;
`;

const LabelText = styled.p`
    font-family: serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #7d6b5d;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
    font-weight: bold;
`;

const ClassicSelect = styled(Select)`
    &.MuiOutlinedInput-root {
        border-radius: 0;
        min-width: 250px;
        font-family: 'Georgia', serif;
        background-color: #ffffff;
        & fieldset { border-color: #e0dcd0; }
        &.Mui-focused fieldset { border-color: #1a1a1a; }
    }
`;

const TableWrapper = styled(Paper)`
    && {
        border-radius: 0; border: 1px solid #e0dcd0; box-shadow: 8px 8px 0px #e0dcd0;
        & .MuiTableCell-head {
            background-color: #1a1a1a !important; color: white !important;
            font-family: 'Georgia', serif !important; text-transform: uppercase; letter-spacing: 1px;
        }
        & .MuiTableCell-body {
            font-family: 'serif';
        }
    }
`;

const ActionContainer = styled.div`
    display: flex; align-items: center; gap: 1rem;
`;

const ClassicSmallButton = styled.button`
    background: none; border: 1px solid #1a1a1a; color: #1a1a1a;
    padding: 6px 12px; font-family: serif; text-transform: uppercase;
    font-size: 0.7rem; letter-spacing: 1px; cursor: pointer;
    &:hover { background-color: #1a1a1a; color: white; }
`;

const StyledButtonGroup = styled(ButtonGroup)`
    & .MuiButton-root {
        border-radius: 0; font-family: serif; font-size: 0.7rem;
        text-transform: uppercase; color: #1a1a1a; border-color: #1a1a1a;
        &:hover { border-color: #1a1a1a; background-color: #f4f1ea; }
    }
`;

const Classic3DButton = styled.button`
    background-color: #1a1a1a; color: white; border: none;
    padding: 12px 24px; font-family: 'Georgia', serif; text-transform: uppercase;
    box-shadow: 4px 4px 0px #7d6b5d; cursor: pointer;
    &:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #7d6b5d; }
`;

const EmptyState = styled(Box)`
    text-align: center; padding: 60px; background-color: #fdfcf8;
`;

const ClassicMenuItem = styled(MenuItem)`
    && {
        font-family: 'Georgia', serif; font-size: 0.85rem;
        &.Mui-selected { background-color: #f4f1ea; color: #1a1a1a; }
    }
`;

const styles = {
    classicMenu: {
        borderRadius: 0, border: '1px solid #e0dcd0', boxShadow: '4px 4px 0px rgba(0,0,0,0.05)',
    }
};