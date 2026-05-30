import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import SubjectIcon from "../../assets/subjects.svg";
import AssignmentIcon from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const student = userDetails || {};
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const numberOfSubjects = subjectsList ? subjectsList.length : 0;
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const fees = student.fees || { totalAmount: 0, paidAmount: 0, balanceAmount: 0 };



    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <WelcomeHeader>
                <TypographyClassic variant="h4">Student Dashboard</TypographyClassic>
                <TypographySubtitle>Academic progress and attendance summary for <b>{currentUser.name}</b> </TypographySubtitle>
            </WelcomeHeader>

            <Grid container spacing={4}>
                {/* Metric Card: Subjects */}
                <Grid item xs={12} md={3}>
                    <Classic3DCard>
                        <IconBox>
                            <img src={SubjectIcon} alt="Subjects" style={{ width: '50px' }} />
                        </IconBox>
                        <MetricTitle>Total Subjects</MetricTitle>
                        <MetricData start={0} end={numberOfSubjects} duration={2.5} />
                    </Classic3DCard>
                </Grid>

                {/* Metric Card: Pending Fees */}
                <Grid item xs={12} md={3}>
                    <Classic3DCard>
                        <IconBox>
                            <img src={AssignmentIcon} alt="Assignments" style={{ width: '50px' }} />
                        </IconBox>
                        <MetricTitle>Pending fees</MetricTitle>
                        <MetricData start={0} end={fees.balanceAmount} duration={4} />
                    </Classic3DCard>
                </Grid>

                {/* Metric Card: Attendance Chart */}
                <Grid item xs={12} md={6}>
                    <ChartPaper elevation={0}>
                        <SectionTitle>Institutional Presence</SectionTitle>
                        <ChartFlexBox>
                            {loading ? (
                                <CircularProgress color="inherit" />
                            ) : subjectAttendance && subjectAttendance.length > 0 ? (
                                <>
                                    {/* Centered Chart Wrapper */}
                                    <Box sx={{
                                        width: '180px',
                                        height: '160px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden' // Prevents chart bleeding
                                    }}>
                                        <CustomPieChart data={chartData} />
                                    </Box>

                                    {/* Refined Typography for Percentage */}
                                    <Box sx={{ borderLeft: '1px solid #e0dcd0', pl: 4, py: 1 }}>
                                        <Label>Overall Attendance</Label>
                                        <ValueText>{overallAttendancePercentage.toFixed(1)}%</ValueText>
                                        <Typography variant="caption" sx={{ fontFamily: 'serif', color: '#7d6b5d', fontStyle: 'italic' }}>
                                            {overallAttendancePercentage >= 75 ? "Status: Eligible" : "Status: Risk Alert"}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ fontFamily: 'serif', fontStyle: 'italic', color: '#7d6b5d' }}>
                                    The attendance ledger is currently empty.
                                </Typography>
                            )}
                        </ChartFlexBox>
                    </ChartPaper>
                </Grid>

                {/* Notice Section */}
                <Grid item xs={12}>
                    <NoticePaper elevation={0}>
                        <SectionTitle>Bulletin Board</SectionTitle>
                        <SeeNotice />
                    </NoticePaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentHomePage;

// --- CLASSIC STYLED COMPONENTS ---

const WelcomeHeader = styled(Box)`
    margin-bottom: 40px;
    border-left: 4px solid #1a1a1a;
    padding-left: 20px;
`;

const TypographyClassic = styled.h2`
    font-family: 'Georgia', serif;
    font-size: 2.2rem;
    color: #1a1a1a;
    margin: 0;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const TypographySubtitle = styled.p`
    font-family: 'serif';
    font-style: italic;
    color: #7d6b5d;
    margin: 5px 0 0 0;
`;

const Classic3DCard = styled(Paper)`
    && {
        padding: 30px;
        display: flex;
        flex-direction: column;
        height: 240px;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 0;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        box-shadow: 6px 6px 0px #e0dcd0; /* Tactical Classic Shadow */
        transition: all 0.3s ease;

        &:hover {
            transform: translate(-3px, -3px);
            box-shadow: 10px 10px 0px #7d6b5d;
            border-color: #1a1a1a;
        }
    }
`;

const ChartPaper = styled(Paper)`
    && {
        padding: 25px;
        height: 240px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
        box-shadow: 6px 6px 0px #e0dcd0;
        display: flex;
        flex-direction: column;
    }
`;

const ChartFlexBox = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: calc(100% - 60px);
    padding: 0 10px;
`;

const IconBox = styled(Box)`
    margin-bottom: 20px;
    filter: grayscale(1) opacity(0.7); /* Desaturated editorial look */
`;

const MetricTitle = styled.p`
    font-family: serif;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-size: 0.75rem;
    color: #7d6b5d;
    font-weight: 700;
    margin: 0;
`;

const MetricData = styled(CountUp)`
    font-family: 'Georgia', serif;
    font-size: 2.8rem;
    font-weight: 400;
    color: #1a1a1a;
`;

const SectionTitle = styled.h3`
    font-family: 'Georgia', serif;
    font-size: 1.2rem;
    margin-bottom: 20px;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
`;

const NoticePaper = styled(Paper)`
    && {
        padding: 40px;
        background-color: #ffffff;
        border: 1px solid #e0dcd0;
        border-radius: 0;
        box-shadow: 6px 6px 0px #e0dcd0;
    }
`;

const Label = styled.p`
    font-family: serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #7d6b5d;
    margin: 0;
    letter-spacing: 1px;
`;

const ValueText = styled.p`
    font-family: 'Georgia', serif;
    font-size: 2.2rem;
    color: #1a1a1a;
    margin: 0;
`;
