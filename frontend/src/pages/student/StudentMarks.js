import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, Grid, Paper, Typography, Box, Table, TableBody, 
    TableHead, Button, CircularProgress, Chip, TableCell, TableRow 
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import CustomBarChart from '../../components/CustomBarChart';
import styled from 'styled-components';

import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StudentMarks = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

    const student = userDetails || currentUser || {};
    const classID = currentUser?.sclassName?._id;

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
        if (classID) {
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [dispatch, currentUser?._id, classID]);

    useEffect(() => {
        if (userDetails?.examResult) {
            setSubjectMarks(userDetails.examResult);
        }
    }, [userDetails]);

    // Calculate Grade based on percentage
    const getGrade = (percentage) => {
        if (percentage >= 90) return { label: 'A+ (Outstanding)', color: '#2e7d32' };
        if (percentage >= 80) return { label: 'A (Excellent)', color: '#1b5e20' };
        if (percentage >= 70) return { label: 'B (Good)', color: '#0288d1' };
        if (percentage >= 60) return { label: 'C (Average)', color: '#ed6c02' };
        if (percentage >= 35) return { label: 'D (Pass)', color: '#7d6b5d' };
        return { label: 'F (Needs Improvement)', color: '#d32f2f' };
    };

    // Calculate Summary Statistics
    const validMarks = subjectMarks.filter(item => item.subName && typeof item.marksObtained === 'number');
    const totalObtained = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
    const maxTotal = validMarks.length * 100;
    const overallPercentage = maxTotal > 0 ? ((totalObtained / maxTotal) * 100).toFixed(1) : 0;
    const overallGrade = getGrade(overallPercentage);

    const handlePrint = () => {
        window.print();
    };

    return (
        <PrintPageWrapper maxWidth="lg">
            {/* --- PRINT ONLY OFFICIAL INSTITUTIONAL HEADER --- */}
            <PrintHeader className="print-only">
                <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', color: '#1a1a1a', mb: 0.5 }}>
                    {student.school?.schoolName || "SCHOOL MANAGEMENT SYSTEM"}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'serif', fontStyle: 'italic', color: '#555', mb: 1 }}>
                    Official Academic Evaluation & Examination Marksheet
                </Typography>
                <Box sx={{ borderBottom: '2px solid #1a1a1a', mb: 2 }} />
            </PrintHeader>

            {/* --- ON-SCREEN PAGE HEADER --- */}
            <HeaderBox className="no-print">
                <Box>
                    <TypographyHeader variant="h4">EXAMINATION MARKSHEET</TypographyHeader>

                </Box>
                <ActionGroup>
                    <SecondaryButton 
                        onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
                        startIcon={viewMode === 'table' ? <BarChartIcon /> : <TableChartIcon />}
                    >
                        {viewMode === 'table' ? 'Visual Analytics' : 'Ledger View'}
                    </SecondaryButton>
                    <PrimaryButton onClick={handlePrint} startIcon={<PrintIcon />}>
                        Print Marksheet
                    </PrimaryButton>
                </ActionGroup>
            </HeaderBox>

            {loading ? (
                <LoaderBox className="no-print">
                    <CircularProgress sx={{ color: '#1a1a1a' }} />
                </LoaderBox>
            ) : (
                <>
                    {/* --- SCHOLAR INFORMATION DOSSIER CARD --- */}
                    <DossierPaper elevation={0}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <InfoBlock>
                                    <InfoLabel>Scholar Name</InfoLabel>
                                    <InfoValue>{student.name || 'N/A'}</InfoValue>
                                </InfoBlock>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <InfoBlock>
                                    <InfoLabel>GR Number</InfoLabel>
                                    <InfoValue>{student.generalRegisterNo || 'N/A'}</InfoValue>
                                </InfoBlock>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <InfoBlock>
                                    <InfoLabel>Roll Number</InfoLabel>
                                    <InfoValue>{student.rollNum || 'N/A'}</InfoValue>
                                </InfoBlock>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <InfoBlock>
                                    <InfoLabel>Academic Class</InfoLabel>
                                    <InfoValue>{student.sclassName?.sclassName || 'Enrolled Class'}</InfoValue>
                                </InfoBlock>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <InfoBlock>
                                    <InfoLabel>Evaluation Status</InfoLabel>
                                    <Chip 
                                        label={validMarks.length > 0 ? "GRADED" : "PENDING"} 
                                        size="small"
                                        sx={{ 
                                            borderRadius: '2px', 
                                            fontWeight: 'bold',
                                            bgcolor: validMarks.length > 0 ? '#e8f5e9' : '#fff3e0',
                                            color: validMarks.length > 0 ? '#2e7d32' : '#e65100',
                                            fontFamily: 'serif',
                                            px: 1
                                        }} 
                                    />
                                </InfoBlock>
                            </Grid>
                        </Grid>
                    </DossierPaper>

                    {/* --- MARKS SUMMARY METRIC CARDS (ON SCREEN) --- */}
                    {validMarks.length > 0 && (
                        <Grid container spacing={3} sx={{ mb: 4 }} className="no-print">
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard elevation={0}>
                                    <MetricIconBox>
                                        <AssessmentIcon sx={{ fontSize: 32, color: '#1a1a1a' }} />
                                    </MetricIconBox>
                                    <MetricLabel>Total Score</MetricLabel>
                                    <MetricValue>{totalObtained} <SpanMax>/ {maxTotal}</SpanMax></MetricValue>
                                </MetricCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard elevation={0}>
                                    <MetricIconBox>
                                        <EmojiEventsIcon sx={{ fontSize: 32, color: '#1a1a1a' }} />
                                    </MetricIconBox>
                                    <MetricLabel>Aggregate Percentage</MetricLabel>
                                    <MetricValue>{overallPercentage}%</MetricValue>
                                </MetricCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard elevation={0}>
                                    <MetricIconBox>
                                        <SchoolIcon sx={{ fontSize: 32, color: '#1a1a1a' }} />
                                    </MetricIconBox>
                                    <MetricLabel>Overall Standing</MetricLabel>
                                    <MetricValue style={{ fontSize: '1.15rem', color: overallGrade.color, fontWeight: 'bold' }}>
                                        {overallGrade.label}
                                    </MetricValue>
                                </MetricCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard elevation={0}>
                                    <MetricIconBox>
                                        <CheckCircleIcon sx={{ fontSize: 32, color: '#1a1a1a' }} />
                                    </MetricIconBox>
                                    <MetricLabel>Evaluated Subjects</MetricLabel>
                                    <MetricValue>{validMarks.length} <SpanMax>/ {subjectsList?.length || validMarks.length}</SpanMax></MetricValue>
                                </MetricCard>
                            </Grid>
                        </Grid>
                    )}

                    {/* --- MAIN MARKS LEDGER TABLE / CHART --- */}
                    {validMarks.length === 0 ? (
                        <EmptyStateCard elevation={0}>
                            <AssessmentIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Georgia', textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                                No Marks Records Published Yet
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'serif', color: '#64748b', maxWidth: '500px', mb: 3 }}>
                                Your subject examination results have not been uploaded by your instructors yet. Below is your current registered curriculum.
                            </Typography>
                            
                            {subjectsList && subjectsList.length > 0 && (
                                <Box sx={{ width: '100%', maxWidth: '600px', mt: 2 }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'serif', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a1a', fontWeight: 'bold', display: 'block', mb: 2 }}>
                                        Registered Enrolled Subjects ({subjectsList.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {subjectsList.map((sub, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <SubjectBanner>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Georgia', fontWeight: 'bold' }}>
                                                        {sub.subName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'serif', color: '#64748b' }}>
                                                        Code: {sub.subCode || 'N/A'} • Status: Pending
                                                    </Typography>
                                                </SubjectBanner>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </EmptyStateCard>
                    ) : (
                        <>
                            {viewMode === 'table' ? (
                                <CleanTablePaper elevation={0}>
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#1a1a1a' }}>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '5%' }}>#</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '35%' }}>Subject Designation</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '15%' }}>Subject Code</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '15%' }}>Max Marks</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '15%' }}>Marks Obtained</TableCell>
                                                <TableCell align="right" sx={{ color: 'white', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.8rem', py: 1.5, width: '15%' }}>Grade / Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {validMarks.map((result, index) => {
                                                const subObj = result.subName || {};
                                                const score = result.marksObtained || 0;
                                                const percent = score;
                                                const gradeInfo = getGrade(percent);

                                                return (
                                                    <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#faf9f6' }, borderBottom: '1px solid #e2e8f0' }}>
                                                        <TableCell sx={{ fontFamily: 'serif', color: '#64748b', py: 2 }}>
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1e293b', py: 2 }}>
                                                            {subObj.subName || 'Academic Subject'}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'serif', color: '#475569', py: 2 }}>
                                                            {subObj.subCode || '-'}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'serif', color: '#475569', py: 2 }}>
                                                            100
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a', py: 2 }}>
                                                            {score}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ py: 2 }}>
                                                            <Chip 
                                                                label={gradeInfo.label} 
                                                                size="small"
                                                                sx={{ 
                                                                    borderRadius: '2px', 
                                                                    fontFamily: 'serif',
                                                                    fontWeight: 'bold',
                                                                    bgcolor: '#f1f5f9',
                                                                    color: gradeInfo.color,
                                                                    border: `1px solid ${gradeInfo.color}`
                                                                }} 
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            {/* Summary Row */}
                                            <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #1a1a1a' }}>
                                                <TableCell colSpan={3} sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#1a1a1a', py: 2 }}>
                                                    TOTAL AGGREGATE EVALUATION
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1a1a1a', py: 2 }}>
                                                    {maxTotal}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '1.2rem', color: '#1a1a1a', py: 2 }}>
                                                    {totalObtained} ({overallPercentage}%)
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: overallGrade.color, py: 2 }}>
                                                    {overallGrade.label}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CleanTablePaper>
                            ) : (
                                <ChartPaper elevation={0} className="no-print">
                                    <Typography variant="h6" sx={{ fontFamily: 'Georgia', textTransform: 'uppercase', letterSpacing: '1px', mb: 3 }}>
                                        Subject-Wise Evaluation Chart
                                    </Typography>
                                    <CustomBarChart chartData={validMarks} dataKey="marksObtained" />
                                </ChartPaper>
                            )}
                        </>
                    )}

                    {/* --- PRINT FOOTER STAMP --- */}
                    <PrintFooter className="print-only">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '1px dashed #94a3b8' }}>
                            <Box sx={{ textAlign: 'center', width: '200px' }}>
                                <Box sx={{ borderBottom: '1px solid #1a1a1a', mb: 1, height: '30px' }} />
                                <Typography variant="caption" sx={{ fontFamily: 'serif', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                                    Class Instructor Signature
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', width: '200px' }}>
                                <Box sx={{ borderBottom: '1px solid #1a1a1a', mb: 1, height: '30px' }} />
                                <Typography variant="caption" sx={{ fontFamily: 'serif', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                                    Institutional Seal & Controller
                                </Typography>
                            </Box>
                        </Box>
                    </PrintFooter>
                </>
            )}
        </PrintPageWrapper>
    );
};

export default StudentMarks;

// --- CLEAN & PRINT-FRIENDLY STYLED COMPONENTS ---

const PrintPageWrapper = styled(Container)`
    padding-top: 20px;
    padding-bottom: 40px;

    .print-only {
        display: none;
    }

    @media print {
        /* Hide all navigation, appbar, sidebar, and non-printable UI elements */
        body, html, #root {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        .MuiDrawer-root,
        .MuiAppBar-root,
        .no-print,
        header,
        nav {
            display: none !important;
        }

        .print-only {
            display: block !important;
        }

        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;

        /* Strip card shadows for crisp printing */
        .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
        }
    }
`;

const PrintHeader = styled(Box)`
    text-align: center;
    margin-bottom: 20px;
`;

const PrintFooter = styled(Box)``;

const HeaderBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    border-left: 4px solid #1a1a1a;
    padding-left: 16px;
    flex-wrap: wrap;
    gap: 15px;
`;

const TypographyHeader = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        letter-spacing: 1.5px;
        color: #1a1a1a;
        font-weight: 500;
        font-size: 1.6rem;
    }
`;

const TypographySubtitle = styled(Typography)`
    && {
        font-family: 'serif';
        font-style: italic;
        color: #64748b;
        margin-top: 2px;
        font-size: 0.9rem;
    }
`;

const ActionGroup = styled(Box)`
    display: flex;
    gap: 10px;
`;

const PrimaryButton = styled(Button)`
    && {
        background-color: #1a1a1a;
        color: white;
        font-family: 'Georgia', serif;
        border-radius: 2px;
        padding: 8px 18px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.8rem;
        box-shadow: 2px 2px 0px #64748b;
        transition: all 0.2s ease;
        &:hover {
            background-color: #333333;
            box-shadow: 4px 4px 0px #64748b;
        }
    }
`;

const SecondaryButton = styled(Button)`
    && {
        background-color: #ffffff;
        color: #1a1a1a;
        border: 1px solid #1a1a1a;
        font-family: 'Georgia', serif;
        border-radius: 2px;
        padding: 8px 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.8rem;
        box-shadow: 2px 2px 0px #e2e8f0;
        transition: all 0.2s ease;
        &:hover {
            background-color: #f8fafc;
            box-shadow: 4px 4px 0px #e2e8f0;
        }
    }
`;

const DossierPaper = styled(Paper)`
    && {
        padding: 20px 24px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        margin-bottom: 25px;
    }
`;

const InfoBlock = styled(Box)``;

const InfoLabel = styled(Typography)`
    && {
        font-family: serif;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #64748b;
        font-weight: 700;
        margin-bottom: 2px;
    }
`;

const InfoValue = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        font-size: 1rem;
        color: #0f172a;
        font-weight: bold;
    }
`;

const MetricCard = styled(Paper)`
    && {
        padding: 20px 16px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        text-align: center;
        transition: all 0.2s ease;
    }
`;

const MetricIconBox = styled(Box)`
    margin-bottom: 6px;
`;

const MetricLabel = styled(Typography)`
    && {
        font-family: serif;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #64748b;
        font-weight: 700;
    }
`;

const MetricValue = styled(Typography)`
    && {
        font-family: 'Georgia', serif;
        font-size: 1.5rem;
        color: #0f172a;
        margin-top: 2px;
    }
`;

const SpanMax = styled.span`
    font-size: 0.9rem;
    color: #64748b;
    font-family: serif;
`;

const CleanTablePaper = styled(Paper)`
    && {
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        background-color: white;
        overflow-x: auto;
    }
`;

const ChartPaper = styled(Paper)`
    && {
        padding: 25px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
    }
`;

const EmptyStateCard = styled(Paper)`
    && {
        padding: 50px 20px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const SubjectBanner = styled(Box)`
    padding: 12px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 2px;
    text-align: left;
`;

const LoaderBox = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 350px;
`;
