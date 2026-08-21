import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { BASEURL } from '../../utils/apiConfig';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { authSuccess } from '../../redux/userRelated/userSlice';

/**
 * PlatformFeeGate
 *
 * Full-screen payment gate shown to students who haven't paid the
 * one-time ₹99 platform activation fee. Integrates with Razorpay
 * Checkout and calls the backend to verify payment.
 *
 * Props:
 *   children — the <StudentDashboard /> to render once fee is paid
 */
const PlatformFeeGate = ({ children }) => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const studentId = currentUser?._id;

    const [loading, setLoading] = useState(true);
    const [feePaid, setFeePaid] = useState(false);
    const [feeAmount, setFeeAmount] = useState(99);
    const [paying, setPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState('');

    // ── Check platform fee status on mount ────────────────────
    const checkFeeStatus = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASEURL}/PlatformFeeStatus/${studentId}`);
            if (res.data.success) {
                setFeePaid(res.data.platformFeePaid);
                setFeeAmount(res.data.feeAmount || 99);
            }
        } catch (err) {
            console.error('Failed to check platform fee status:', err);
            // On error, allow through (don't block student if API is down)
            setFeePaid(true);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            checkFeeStatus();
        }
    }, [studentId, checkFeeStatus]);

    // ── Handle Razorpay payment ───────────────────────────────
    const handlePayment = async () => {
        setPaying(true);
        setError('');

        try {
            // Step 1: Create order
            const orderRes = await axios.post(`${BASEURL}/CreatePlatformFeeOrder`, {
                studentId,
            });

            if (!orderRes.data.success) {
                // Already paid check
                if (orderRes.data.alreadyPaid) {
                    setFeePaid(true);
                    setPaying(false);
                    return;
                }
                throw new Error(orderRes.data.message || 'Failed to create order');
            }

            const { order, key } = orderRes.data;

            // Step 2: Open Razorpay Checkout
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: 'ShikshaNetra',
                description: 'One-time Platform Activation Fee',
                order_id: order.id,
                handler: async function (response) {
                    // Step 3: Verify payment
                    try {
                        const verifyRes = await axios.post(`${BASEURL}/VerifyPlatformFeePayment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            studentId,
                        });

                        if (verifyRes.data.success) {
                            setPaymentSuccess(true);

                            // Update the local user state so the gate doesn't show again on refresh
                            const updatedUser = { ...currentUser, platformFeePaid: true };
                            dispatch(authSuccess(updatedUser));

                            // Brief delay to show success animation, then reveal dashboard
                            setTimeout(() => {
                                setPaymentSuccess(false);
                                setFeePaid(true);
                            }, 2000);
                        } else {
                            setError('Payment verification failed. Please contact support.');
                        }
                    } catch (verifyErr) {
                        setError('Payment verification failed. Please contact support.');
                        console.error('Verify error:', verifyErr);
                    }
                    setPaying(false);
                },
                modal: {
                    ondismiss: function () {
                        setPaying(false);
                    },
                },
                prefill: {
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    contact: currentUser?.phone || '',
                },
                theme: {
                    color: '#1a1a1a',
                },
                notes: {
                    type: 'platform_fee',
                    studentId: studentId,
                },
            };

            // Ensure Razorpay script is loaded
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please refresh the page.');
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (failResponse) {
                setError(failResponse.error?.description || 'Payment failed. Please try again.');
                setPaying(false);
            });
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment failed');
            setPaying(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────
    if (loading) {
        return (
            <GateContainer>
                <CircularProgress sx={{ color: '#1a1a1a' }} />
                <Typography sx={{ mt: 2, fontFamily: 'serif', color: '#7d6b5d', fontStyle: 'italic' }}>
                    Verifying account status…
                </Typography>
            </GateContainer>
        );
    }

    // ── Fee already paid — render dashboard ───────────────────
    if (feePaid && !paymentSuccess) {
        return children;
    }

    // ── Payment success animation ─────────────────────────────
    if (paymentSuccess) {
        return (
            <GateContainer>
                <SuccessIconWrapper>
                    <VerifiedIcon sx={{ fontSize: 80, color: '#2e7d32' }} />
                </SuccessIconWrapper>
                <GateTitle style={{ color: '#2e7d32' }}>Payment Successful</GateTitle>
                <GateSubtitle>
                    Your platform access has been activated. Redirecting to your dashboard…
                </GateSubtitle>
            </GateContainer>
        );
    }

    // ── Payment gate UI ───────────────────────────────────────
    return (
        <GateContainer>
            <GateCard>
                {/* Header accent */}
                <CardAccent />

                {/* Lock icon */}
                <LockIconWrapper>
                    <LockOutlinedIcon sx={{ fontSize: 48, color: '#ffffff' }} />
                </LockIconWrapper>

                {/* Content */}
                <Box sx={{ px: 5, pb: 5, pt: 3 }}>
                    <GateTitle>Platform Activation Required</GateTitle>
                    <GateSubtitle>
                        A one-time activation fee is required to access the ShikshaNetra 
                        student portal. This enables your complete academic dashboard, 
                        attendance tracking, and fee management.
                    </GateSubtitle>

                    {/* Fee amount display */}
                    <FeeAmountBox>
                        <FeeLabel>One-Time Activation Fee</FeeLabel>
                        <FeeAmount>₹{feeAmount}</FeeAmount>
                        <FeeNote>Secure payment via Razorpay</FeeNote>
                    </FeeAmountBox>

                    {/* Feature list */}
                    <FeatureList>
                        <FeatureItem>✦ Complete Academic Dashboard</FeatureItem>
                        <FeatureItem>✦ Attendance & Examination Records</FeatureItem>
                        <FeatureItem>✦ Fee Ledger & Transaction History</FeatureItem>
                        <FeatureItem>✦ Subject Performance Analytics</FeatureItem>
                    </FeatureList>

                    {/* Pay button */}
                    <PayButton
                        onClick={handlePayment}
                        disabled={paying}
                        fullWidth
                        variant="contained"
                        disableElevation
                    >
                        {paying ? (
                            <CircularProgress size={22} sx={{ color: '#ffffff' }} />
                        ) : (
                            `Pay ₹${feeAmount} & Activate`
                        )}
                    </PayButton>

                    <SecurityNote>
                        🔒 256-bit SSL encrypted • Powered by Razorpay
                    </SecurityNote>
                </Box>
            </GateCard>

            {/* Error snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" variant="filled">
                    {error}
                </Alert>
            </Snackbar>
        </GateContainer>
    );
};

export default PlatformFeeGate;

// ═══════════════════════════════════════════════════════════════
// STYLED COMPONENTS — Classic editorial design matching the app
// ═══════════════════════════════════════════════════════════════

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
`;

const GateContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9f7f2;
    padding: 20px;
`;

const GateCard = styled(Box)`
    max-width: 480px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e0dcd0;
    box-shadow: 8px 8px 0px #e0dcd0;
    position: relative;
    animation: ${fadeIn} 0.6s ease-out;
    overflow: hidden;
`;

const CardAccent = styled(Box)`
    height: 6px;
    background: linear-gradient(90deg, #1a1a1a 0%, #7d6b5d 50%, #1a1a1a 100%);
`;

const LockIconWrapper = styled(Box)`
    width: 80px;
    height: 80px;
    background-color: #1a1a1a;
    border: 3px solid #e0dcd0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -40px auto 0 auto;
    position: relative;
    z-index: 1;
`;

const SuccessIconWrapper = styled(Box)`
    animation: ${scaleIn} 0.5s ease-out;
    margin-bottom: 20px;
`;

const GateTitle = styled.h2`
    font-family: 'Georgia', serif;
    font-size: 1.6rem;
    color: #1a1a1a;
    text-align: center;
    margin: 24px 0 8px 0;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const GateSubtitle = styled.p`
    font-family: serif;
    font-size: 0.9rem;
    color: #7d6b5d;
    text-align: center;
    line-height: 1.6;
    margin: 0 0 24px 0;
    font-style: italic;
`;

const FeeAmountBox = styled(Box)`
    background: #fdfcf8;
    border: 1px solid #e0dcd0;
    padding: 24px;
    text-align: center;
    margin-bottom: 24px;
`;

const FeeLabel = styled.p`
    font-family: serif;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #7d6b5d;
    margin: 0 0 8px 0;
`;

const FeeAmount = styled.p`
    font-family: 'Georgia', serif;
    font-size: 3rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
`;

const FeeNote = styled.p`
    font-family: serif;
    font-size: 0.75rem;
    color: #999;
    margin: 8px 0 0 0;
    font-style: italic;
`;

const FeatureList = styled.div`
    margin-bottom: 28px;
    padding: 0 8px;
`;

const FeatureItem = styled.p`
    font-family: serif;
    font-size: 0.85rem;
    color: #555;
    margin: 8px 0;
    padding-left: 8px;
    letter-spacing: 0.3px;
`;

const PayButton = styled(Button)`
    && {
        background-color: #1a1a1a;
        color: #ffffff;
        font-family: 'Georgia', serif;
        font-size: 0.95rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 14px 0;
        border-radius: 0;
        transition: all 0.3s ease;

        &:hover {
            background-color: #333;
            box-shadow: 4px 4px 0px #7d6b5d;
            transform: translate(-2px, -2px);
        }

        &:disabled {
            background-color: #ccc;
            color: #888;
        }
    }
`;

const SecurityNote = styled.p`
    font-family: serif;
    font-size: 0.7rem;
    color: #bbb;
    text-align: center;
    margin: 16px 0 0 0;
    letter-spacing: 0.5px;
`;
