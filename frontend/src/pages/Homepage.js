import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Box, Button, Typography, Container, Paper, TextField, Snackbar, Alert, Fab } from '@mui/material';
import styled from 'styled-components';
import logo from '../assets/logo.png';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
import { BASEURL } from '../utils/apiConfig';
import Hero from '../components/Hero';

const Homepage = () => {
    const [contactData, setContactData] = useState({
        schoolName: '',
        contactPerson: '',
        phone: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleContactChange = (e) => {
        setContactData({ ...contactData, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                schoolName: contactData.schoolName,
                contactPerson: contactData.contactPerson,
                phone: contactData.phone,
                email: contactData.email,
                message: contactData.message
            };
            await axios.post(`${BASEURL}/DemoRequest`, payload);
            setSnackbar({ open: true, message: 'Message sent successfully! We will contact you soon.', severity: 'success' });
            setContactData({ schoolName: '', contactPerson: '', phone: '', email: '', message: '' });
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send message', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const scrollToDemo = () => {
        document.getElementById('demo-preview').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <FullPageWrapper>
            {/* HERO */}
            <Hero onWatchDemo={scrollToDemo} />

            {/* TRUST STRIP */}
            <TrustSection>
                <Container maxWidth="lg">
                    <TrustText>Trusted by Schools Across Maharashtra&nbsp;&nbsp;•&nbsp;&nbsp;Used by 500+ Students</TrustText>
                </Container>
            </TrustSection>

            {/* WHY CHOOSE US */}
            <FeatureSection id="features">
                <Container maxWidth="lg">
                    <SectionHeaderBox>
                        <SectionTitle>Why Choose Us?</SectionTitle>
                        <TypographySubtitle>A system built to make your life easier, not more complicated.</TypographySubtitle>
                        <HorizontalDivider style={{ margin: '20px auto 0 auto' }} />
                    </SectionHeaderBox>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard>
                                <IconCircle><AccessTimeIcon /></IconCircle>
                                <CardTitle>Save 5+ Hours Daily</CardTitle>
                                <CardText>Automate fee reminders, attendance, and notices so your staff can focus on what matters.</CardText>
                            </FeatureCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard>
                                <IconCircle><ArticleIcon /></IconCircle>
                                <CardTitle>Reduce Manual Paperwork</CardTitle>
                                <CardText>Move everything to the cloud. Access student records, staff details, and documents instantly.</CardText>
                            </FeatureCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard>
                                <IconCircle><AssessmentIcon /></IconCircle>
                                <CardTitle>Instant Report Generation</CardTitle>
                                <CardText>Generate academic reports, fee defaulter lists, and ID cards with a single click.</CardText>
                            </FeatureCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard>
                                <IconCircle><SentimentSatisfiedAltIcon /></IconCircle>
                                <CardTitle>Easy for Non-Tech Staff</CardTitle>
                                <CardText>Designed with absolute simplicity. If you can use WhatsApp, you can use our system.</CardText>
                            </FeatureCard>
                        </Grid>
                    </Grid>
                </Container>
            </FeatureSection>

            {/* DEMO PREVIEW */}
            <DemoPreviewSection id="demo-preview">
                <Container maxWidth="lg">
                    <SectionHeaderBox>
                        <SectionTitle>See How It Works</SectionTitle>
                        <TypographySubtitle>Take a look inside the modern dashboard built for school admins</TypographySubtitle>
                        <HorizontalDivider style={{ margin: '20px auto 0 auto' }} />
                    </SectionHeaderBox>
                    <MockupContainer>
                        <MockupHeader>
                            <MockupDot style={{ backgroundColor: '#ff5f56' }} />
                            <MockupDot style={{ backgroundColor: '#ffbd2e' }} />
                            <MockupDot style={{ backgroundColor: '#27c93f' }} />
                        </MockupHeader>
                        <MockupBody>
                            <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <PlayCircleOutlineIcon sx={{ fontSize: { xs: '3.5rem', md: '5rem' }, color: '#1a1a1a', opacity: 0.8 }} />
                                <Typography variant="h5" sx={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', textAlign: 'center', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                                    Dashboard Overview Preview
                                </Typography>
                                <Typography sx={{ color: '#666', fontFamily: 'serif', textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}>
                                    (A video or high-quality screenshot goes here)
                                </Typography>
                            </Box>
                        </MockupBody>
                    </MockupContainer>
                </Container>
            </DemoPreviewSection>

            {/* TESTIMONIAL */}
            <TestimonialSection>
                <Container maxWidth="md">
                    <TestimonialQuote>
                        "This system completely transformed how we operate. It saved our staff hours of manual data entry and made fee collection entirely stress-free."
                    </TestimonialQuote>
                    <TestimonialAuthor>— Principal, Leading School in Pune</TestimonialAuthor>
                </Container>
            </TestimonialSection>

            {/* PRICING */}
            <PricingSection id="pricing">
                <Container maxWidth="lg">
                    <SectionHeaderBox>
                        <SectionTitle>Simple, Transparent Pricing</SectionTitle>
                        <TypographySubtitle>Select a plan tailored to your institution's scale</TypographySubtitle>
                        <UrgencyBanner>🚀 Get Free Setup for First 10 Schools! Register today.</UrgencyBanner>
                        <HorizontalDivider style={{ margin: '30px auto 0 auto' }} />
                    </SectionHeaderBox>
                    <Grid container spacing={3} justifyContent="center">
                        {[
                            {
                                tier: "Foundation", tag: "Best for small schools", price: "₹4,999", period: "per month",
                                features: ["Up to 200 Students", "Attendance Registry", "Basic Notice Board", "Email Support"],
                                buttonText: "Request Demo", highlight: false
                            },
                            {
                                tier: "Professional", tag: "Most popular", price: "₹9,999", period: "per month",
                                features: ["Up to 1000 Students", "Financial Ledger", "Grievance Record", "Priority Support"],
                                buttonText: "Request Demo", highlight: true
                            },
                            {
                                tier: "Enterprise", tag: "For large institutions", price: "Custom", period: "Annual Billing",
                                features: ["Unlimited Students", "AI Documents Generator", "Custom Domain", "Dedicated Manager"],
                                buttonText: "Contact Us", highlight: false
                            }
                        ].map((plan, index) => (
                            <Grid item xs={12} sm={10} md={4} key={index}>
                                <PriceCard isHighlighted={plan.highlight}>
                                    {plan.highlight && <Ribbon>Most Selected</Ribbon>}
                                    <PlanTag isHighlighted={plan.highlight}>{plan.tag}</PlanTag>
                                    <TierName>{plan.tier}</TierName>
                                    <PriceDisplay>
                                        <Currency>{plan.price}</Currency>
                                        <Period> {plan.price !== 'Custom' ? `/ ${plan.period}` : ''}</Period>
                                    </PriceDisplay>
                                    <FeatureList>
                                        {plan.features.map((f, i) => (
                                            <FeatureItem key={i}>
                                                <CheckCircleOutlineIcon sx={{ fontSize: '1rem', mr: 1, color: plan.highlight ? '#1a1a1a' : '#7d6b5d' }} />
                                                {f}
                                            </FeatureItem>
                                        ))}
                                    </FeatureList>
                                    <PricingButton
                                        variant={plan.highlight ? "contained" : "outlined"}
                                        fullWidth
                                        isHighlighted={plan.highlight}
                                        component={Link}
                                        to="/request-demo"
                                    >
                                        {plan.buttonText}
                                    </PricingButton>
                                </PriceCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </PricingSection>

            {/* CONTACT */}
            <ContactSection id="contact">
                <Container maxWidth="md">
                    <ContactPaper>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={5}>
                                <Box sx={{ p: { xs: 0, md: 2 } }}>
                                    <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', mb: 2, textTransform: 'uppercase', fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                                        Let's Talk
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'serif', color: '#666', mb: 4, lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        Prefer to speak directly? Send us a message and our team will get back to you within 24 hours to discuss how we can help your school.
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Email Us</Typography>
                                        <Typography sx={{ color: '#7d6b5d', fontFamily: 'serif', fontSize: { xs: '0.85rem', md: '1rem' } }}>officialporas@gmail.com</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Location</Typography>
                                        <Typography sx={{ color: '#7d6b5d', fontFamily: 'serif', fontSize: { xs: '0.85rem', md: '1rem' } }}>Pune, Maharashtra</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <form onSubmit={handleContactSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <StyledTextField fullWidth label="School Name" name="schoolName" value={contactData.schoolName} onChange={handleContactChange} required />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <StyledTextField fullWidth label="Contact Person" name="contactPerson" value={contactData.contactPerson} onChange={handleContactChange} required />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <StyledTextField fullWidth label="Phone Number" name="phone" value={contactData.phone} onChange={handleContactChange} required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledTextField fullWidth label="Email Address" name="email" type="email" value={contactData.email} onChange={handleContactChange} required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledTextField fullWidth label="Message (Optional)" name="message" multiline rows={4} value={contactData.message} onChange={handleContactChange} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Primary3DButton type="submit" fullWidth disabled={loading}>
                                                {loading ? 'Sending...' : 'Send Message'}
                                            </Primary3DButton>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Grid>
                        </Grid>
                    </ContactPaper>
                </Container>
            </ContactSection>

            {/* FOOTER */}
            <FooterSection>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 5, md: 8 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <img src={logo} alt="Logo" style={{ height: '36px', filter: 'brightness(0) invert(1)', marginRight: '15px' }} />
                                <FooterBrandText style={{ margin: 0 }}>OM SAAS</FooterBrandText>
                            </Box>
                            <FooterDescription>
                                Developed by Omkar Deshmukh. A high-performance MERN solution for educational digital transformation in India.
                            </FooterDescription>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <FooterHeading>Links</FooterHeading>
                            <FooterLink to="/request-demo">Request Demo</FooterLink>
                            <FooterLink to="#pricing">Pricing Plans</FooterLink>
                            <FooterLink to="/choose">Login to Dashboard</FooterLink>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <FooterHeading>Corporate</FooterHeading>
                            <FooterInfoText>Inquiries: officialporas@gmail.com</FooterInfoText>
                            <FooterInfoText>Pune, Maharashtra</FooterInfoText>
                        </Grid>
                    </Grid>
                    <DividerLine />
                    <CopyrightText>© {new Date().getFullYear()} OmTech Solution's SaaS Platform. All Rights Reserved.</CopyrightText>
                </Container>
            </FooterSection>

            {/* STICKY CTA */}
            <StickyCTA component={Link} to="/request-demo" variant="extended">
                Request Demo
            </StickyCTA>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontFamily: 'Georgia, serif' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </FullPageWrapper>
    );
};

export default Homepage;

/* ─────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */

const FullPageWrapper = styled.div`
    background-color: #ffffff;
    width: 100%;
    position: relative;
    overflow-x: hidden;
`;

const TrustSection = styled.section`
    background-color: #1a1a1a;
    color: white;
    padding: 16px 0;
    text-align: center;
    border-bottom: 1px solid #333;
`;

const TrustText = styled.p`
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 0.85rem;
    margin: 0;
    opacity: 0.9;

    @media (max-width: 600px) {
        font-size: 0.72rem;
        letter-spacing: 1px;
        padding: 0 16px;
    }
`;

const FeatureSection = styled.section`
    padding: 100px 0;
    background-color: #ffffff;

    @media (max-width: 768px) {
        padding: 64px 0;
    }
    @media (max-width: 480px) {
        padding: 48px 0;
    }
`;

const FeatureCard = styled(Paper)`
    && {
        padding: 40px 28px;
        text-align: center;
        border-radius: 0;
        border: 1px solid #e0dcd0;
        box-shadow: 6px 6px 0px #e0dcd0;
        height: 100%;
        transition: all 0.3s ease;
        &:hover {
            transform: translateY(-8px);
            box-shadow: 8px 8px 0px #7d6b5d;
            border-color: #1a1a1a;
        }
        @media (max-width: 600px) {
            padding: 28px 20px;
        }
    }
`;

const DemoPreviewSection = styled.section`
    padding: 100px 0;
    background-color: #fdfcf8;
    border-top: 1px solid #e0dcd0;
    border-bottom: 1px solid #e0dcd0;

    @media (max-width: 768px) {
        padding: 64px 0;
    }
`;

const MockupContainer = styled.div`
    max-width: 1000px;
    margin: 0 auto;
    border: 1px solid #1a1a1a;
    border-radius: 8px 8px 0 0;
    background: #ffffff;
    box-shadow: 15px 15px 0px #e0dcd0;
    overflow: hidden;

    @media (max-width: 600px) {
        box-shadow: 6px 6px 0px #e0dcd0;
    }
`;

const MockupHeader = styled.div`
    background: #f4f1ea;
    padding: 12px 20px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #1a1a1a;
`;

const MockupDot = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
`;

const MockupBody = styled.div`
    min-height: 400px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 600px) {
        min-height: 240px;
    }
`;

const TestimonialSection = styled.section`
    padding: 100px 0;
    background-color: #1a1a1a;
    color: white;
    text-align: center;

    @media (max-width: 768px) {
        padding: 64px 0;
    }
`;

const TestimonialQuote = styled.h3`
    font-family: 'Georgia', serif;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.5;
    margin-bottom: 30px;
    font-style: italic;

    @media (max-width: 768px) {
        font-size: 1.4rem;
        padding: 0 8px;
    }
    @media (max-width: 480px) {
        font-size: 1.15rem;
    }
`;

const TestimonialAuthor = styled.p`
    font-family: 'serif';
    color: #a5d6a7;
    font-size: 1.1rem;
    letter-spacing: 1px;

    @media (max-width: 600px) {
        font-size: 0.9rem;
    }
`;

const PricingSection = styled.section`
    padding: 100px 0;
    background-color: #fdfcf8;
    border-top: 1px solid #e0dcd0;
    border-bottom: 1px solid #e0dcd0;

    @media (max-width: 768px) {
        padding: 64px 0;
    }
`;

const UrgencyBanner = styled.div`
    background-color: #fff3e0;
    color: #e65100;
    display: inline-block;
    padding: 10px 20px;
    border: 1px dashed #ffb74d;
    font-family: 'Georgia', serif;
    font-weight: bold;
    margin-top: 20px;
    letter-spacing: 1px;
    font-size: 0.9rem;

    @media (max-width: 480px) {
        font-size: 0.78rem;
        letter-spacing: 0;
        padding: 8px 12px;
    }
`;

const PriceCard = styled(Paper)`
    && {
        padding: 50px 30px;
        border-radius: 0;
        border: 2px solid ${props => props.isHighlighted ? '#1a1a1a' : '#e0dcd0'};
        background-color: white;
        box-shadow: ${props => props.isHighlighted ? '12px 12px 0px #7d6b5d' : '6px 6px 0px #e0dcd0'};
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: all 0.3s ease;
        &:hover { transform: translateY(-5px); }

        @media (max-width: 600px) {
            padding: 36px 24px;
        }
    }
`;

const PlanTag = styled.div`
    font-family: 'serif';
    font-style: italic;
    color: ${props => props.isHighlighted ? '#1a1a1a' : '#7d6b5d'};
    margin-bottom: 10px;
    font-weight: ${props => props.isHighlighted ? 'bold' : 'normal'};
`;

const TierName = styled.h3`
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    font-size: 1.8rem;
    letter-spacing: 1px;
    margin: 0 0 20px 0;

    @media (max-width: 480px) {
        font-size: 1.5rem;
    }
`;

const PriceDisplay = styled(Box)`
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
`;

const Currency = styled.span`
    font-family: 'Georgia', serif;
    font-size: 2.5rem;
    font-weight: bold;
    color: #1a1a1a;

    @media (max-width: 480px) {
        font-size: 2rem;
    }
`;

const Period = styled.span`
    font-family: serif;
    font-style: italic;
    color: #7d6b5d;
`;

const FeatureList = styled.div`
    flex-grow: 1;
    margin-bottom: 40px;
`;

const FeatureItem = styled.p`
    font-family: serif;
    font-size: 1rem;
    color: #444;
    margin: 15px 0;
    display: flex;
    align-items: center;

    @media (max-width: 480px) {
        font-size: 0.9rem;
    }
`;

const PricingButton = styled(Button)`
    && {
        background-color: ${props => props.isHighlighted ? '#1a1a1a' : 'transparent'};
        color: ${props => props.isHighlighted ? 'white' : '#1a1a1a'};
        border: 2px solid #1a1a1a;
        padding: 15px;
        border-radius: 0;
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 2px;
        &:hover {
            background-color: ${props => props.isHighlighted ? '#333' : '#f4f1ea'};
        }
    }
`;

const Ribbon = styled.div`
    position: absolute;
    top: -15px;
    right: 20px;
    background-color: #1a1a1a;
    color: white;
    padding: 8px 15px;
    font-family: 'Georgia', serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 3px 3px 0px #7d6b5d;
`;

const ContactSection = styled.section`
    padding: 100px 0;
    background-color: #ffffff;

    @media (max-width: 768px) {
        padding: 64px 0;
    }
`;

const ContactPaper = styled(Paper)`
    && {
        padding: 50px;
        border-radius: 0;
        border: 1px solid #1a1a1a;
        box-shadow: 12px 12px 0px #e0dcd0;
        background-color: #fdfcf8;

        @media (max-width: 768px) {
            padding: 32px 24px;
            box-shadow: 6px 6px 0px #e0dcd0;
        }
        @media (max-width: 480px) {
            padding: 24px 16px;
        }
    }
`;

const StyledTextField = styled(TextField)`
    & .MuiOutlinedInput-root {
        border-radius: 0;
        background-color: #ffffff;
        font-family: 'serif';
        fieldset { border-color: #e0dcd0; }
        &:hover fieldset { border-color: #1a1a1a; }
        &.Mui-focused fieldset { border-color: #1a1a1a; border-width: 2px; }
    }
    & .MuiInputLabel-root { font-family: 'Georgia', serif; }
`;

const FooterSection = styled.footer`
    background-color: #0d0d0d;
    color: white;
    padding: 80px 0 40px 0;

    @media (max-width: 768px) {
        padding: 56px 0 32px 0;
    }
`;

const StickyCTA = styled(Fab)`
    && {
        position: fixed;
        bottom: 28px;
        right: 28px;
        background-color: #1a1a1a;
        color: white;
        border: 2px solid white;
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: bold;
        box-shadow: 0px 10px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        &:hover {
            background-color: #333;
            transform: translateY(-3px);
        }

        @media (max-width: 480px) {
            bottom: 16px;
            right: 16px;
            font-size: 0.7rem;
            padding: 0 14px;
            height: 40px;
        }
    }
`;

const IconCircle = styled(Box)`
    width: 70px;
    height: 70px;
    background-color: #f4f1ea;
    color: #1a1a1a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px auto;
    border: 1px solid #e0dcd0;
    & > svg { font-size: 2rem; }

    @media (max-width: 600px) {
        width: 56px;
        height: 56px;
        margin-bottom: 16px;
        & > svg { font-size: 1.5rem; }
    }
`;

const FooterLink = styled(Link)`
    color: #7d6b5d;
    display: block;
    margin-bottom: 12px;
    text-decoration: none;
    font-family: serif;
    font-size: 0.9rem;
    &:hover { color: white; text-decoration: underline; }
`;

const FooterBrandText = styled.h2`
    font-family: 'Georgia', serif;
    letter-spacing: 3px;
    font-size: 1.1rem;
    color: white;
    text-transform: uppercase;

    @media (max-width: 480px) {
        font-size: 0.95rem;
    }
`;

const FooterDescription = styled.p`
    color: #888;
    font-size: 0.9rem;
    line-height: 1.6;
    font-family: serif;
`;

const DividerLine = styled.div`
    height: 1px;
    background-color: #333;
    margin: 60px 0 30px 0;

    @media (max-width: 768px) {
        margin: 40px 0 20px 0;
    }
`;

const CopyrightText = styled.p`
    text-align: center;
    color: #555;
    font-size: 0.8rem;
    letter-spacing: 1px;

    @media (max-width: 480px) {
        font-size: 0.72rem;
        letter-spacing: 0;
    }
`;

const SectionHeaderBox = styled(Box)`
    text-align: center;
    margin-bottom: 60px;

    @media (max-width: 768px) {
        margin-bottom: 40px;
    }
`;

const SectionTitle = styled.h2`
    font-family: 'Georgia', serif;
    font-size: 2.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;

    @media (max-width: 768px) {
        font-size: 1.8rem;
        letter-spacing: 1px;
    }
    @media (max-width: 480px) {
        font-size: 1.5rem;
    }
`;

const TypographySubtitle = styled.p`
    font-family: 'serif';
    font-size: 1.1rem;
    color: #666;
    margin-top: 10px;

    @media (max-width: 600px) {
        font-size: 0.95rem;
        padding: 0 8px;
    }
`;

const HorizontalDivider = styled.div`
    width: 80px;
    height: 4px;
    background-color: #1a1a1a;
`;

const Primary3DButton = styled(Button)`
    && {
        background-color: #1a1a1a;
        color: white;
        padding: 16px 32px;
        border-radius: 0;
        font-family: 'Georgia', serif;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: bold;
        box-shadow: 6px 6px 0px #7d6b5d;
        &:hover {
            background-color: #333;
            transform: translate(-2px, -2px);
            box-shadow: 8px 8px 0px #7d6b5d;
        }

        @media (max-width: 480px) {
            padding: 14px 20px;
            font-size: 0.78rem;
            letter-spacing: 1px;
        }
    }
`;

const FooterHeading = styled.h4`
    font-family: 'Georgia', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 25px;
    color: white;
    font-size: 0.85rem;

    @media (max-width: 480px) {
        font-size: 0.78rem;
        letter-spacing: 1px;
    }
`;

const FooterInfoText = styled.p`
    color: #7d6b5d;
    font-family: serif;
    margin-bottom: 10px;
    font-size: 0.9rem;

    @media (max-width: 480px) {
        font-size: 0.82rem;
    }
`;

const CardTitle = styled.h3`
    font-family: 'Georgia', serif;
    font-size: 1.2rem;
    margin-bottom: 15px;

    @media (max-width: 600px) {
        font-size: 1.05rem;
    }
`;

const CardText = styled.p`
    font-family: serif;
    color: #666;
    font-size: 1rem;
    line-height: 1.6;

    @media (max-width: 600px) {
        font-size: 0.9rem;
    }
`;