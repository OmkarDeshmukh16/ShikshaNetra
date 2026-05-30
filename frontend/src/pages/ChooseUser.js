import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Grid, Box, Container, CircularProgress, Backdrop } from '@mui/material';
import { AccountCircle, School, Group, ArrowBack } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Adminlogin');
      }
    } else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Dipesh Awasthi";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Studentlogin');
      }
    } else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Teacherlogin');
      }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
          <BackLink to="/">
            <ArrowBack sx={{ fontSize: 18, mr: 1 }} /> Back to Home
          </BackLink>
        </Box>
        <HeaderSection>
          <ClassicTitle>Select Identity</ClassicTitle>
          <p>Please choose your portal to continue to the academic system.</p>
        </HeaderSection>
        
        <Grid container spacing={4} justifyContent="center">
          {[
            { role: "Admin", icon: <AccountCircle fontSize="inherit" />, desc: "Access administrative tools and manage system data." },
            { role: "Student", icon: <School fontSize="inherit" />, desc: "View your grades, assignments, and academic records." },
            { role: "Teacher", icon: <Group fontSize="inherit" />, desc: "Manage classes, track progress, and provide feedback." }
          ].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.role}>
              <Card3D onClick={() => navigateHandler(item.role)}>
                <IconWrapper>{item.icon}</IconWrapper>
                <CardTitle>{item.role}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
                <CardFooter>Enter Portal →</CardFooter>
              </Card3D>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Backdrop sx={{ color: '#fff', zIndex: 1000 }} open={loader}>
        <CircularProgress color="inherit" />
        <Box ml={2}>Authenticating...</Box>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

// --- STYLES ---

const StyledContainer = styled.div`
  background-color: #f4f1ea; /* Classic linen/paper color */
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 3rem 0;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  font-family: 'Georgia', serif;
  color: #2c2c2c;
  p { font-style: italic; color: #666; }
`;

const ClassicTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Card3D = styled.div`
  background: #ffffff;
  padding: 40px 30px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e0dcd0;
  
  /* The 3D Effect: Double Shadow for Depth */
  box-shadow: 
    0 10px 20px rgba(0,0,0,0.05), 
    0 6px 6px rgba(0,0,0,0.05);
  
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  top: 0;

  &:hover {
    /* Lift effect */
    top: -10px;
    box-shadow: 
      0 20px 40px rgba(0,0,0,0.1), 
      0 15px 12px rgba(0,0,0,0.08);
    border-color: #1a1a1a;
  }

  &:active {
    /* Press down effect */
    top: -2px;
    box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 50px;
  color: #1a1a1a;
  margin-bottom: 20px;
  transition: transform 0.3s ease;

  ${Card3D}:hover & {
    transform: scale(1.1);
  }
`;

const CardTitle = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 1.6rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-weight: 600;
`;

const CardDescription = styled.p`
  font-family: 'Times New Roman', serif;
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 25px;
  min-height: 60px;
`;

const CardFooter = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1a1a1a;
  font-weight: 700;
  border-top: 1px solid #eee;
  padding-top: 15px;
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
  transition: color 0.2s ease;
  &:hover {
    color: #1a1a1a;
  }
`;