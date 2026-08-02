import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, CircularProgress, Divider } from '@mui/material';
import styled from 'styled-components';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import StudentTransactionHistory from './StudentTransactionHistory';
import axios from 'axios';
import { BASEURL } from '../../utils/apiConfig';

const StudentFees = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading: reduxLoading } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    if (reduxLoading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;

    const student = userDetails || {};
    const fees = student.fees || { totalAmount: 0, paidAmount: 0, balanceAmount: 0 };

    const loadRazorpay = async () => {
        setLoading(true);

        try {
            // 1. Create a Route-enabled Order with auto-transfer splits
            const { data } = await axios.post(`${BASEURL}/CreateFeeOrder`, {
                studentId: student._id,
                amount: student.fees.balanceAmount
            });

            if (!data.success) {
                alert(data.message || "Could not create fee order.");
                return;
            }

            // 2. Configure Razorpay Checkout using the Master SaaS key
            const options = {
                key: data.key,  // Master SaaS public key returned by backend
                amount: data.order.amount,
                currency: data.order.currency || "INR",
                name: "Scholar Portal",
                description: "Academic Fee Settlement",
                order_id: data.order.id, // Contains embedded split/transfer rules
                handler: async (response) => {
                    try {
                        // 3. Send payment details to backend for signature verification
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            studentID: student._id,
                            amount: student.fees.balanceAmount
                        };

                        const res = await axios.post(`${BASEURL}/verifyPayment`, verifyData);

                        if (res.status === 200) {
                            alert("Transaction Verified. Funds routed directly to school. Ledger Updated.");
                            window.location.reload();
                        }
                    } catch (err) {
                        alert("Payment verification failed. Please contact the Admin.");
                    }
                },
                prefill: {
                    name: student.name,
                    email: student.email,
                    contact: student.phone || ""
                },
                theme: { color: "#1a1a1a" }
            };

            // 4. Open the Razorpay Modal
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Razorpay Error:", error);
            const msg = error.response?.data?.message || "Could not connect to the payment gateway.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#f9f7f2', minHeight: '90vh' }}>
            <Typography variant="h5" sx={{ fontFamily: 'Georgia', fontWeight: 'bold', mb: 3 }}>
                FINANCIAL LEDGER
            </Typography>

            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} md={4}>
                    <StatCard elevation={0} borderColor="#1a1a1a">
                        <Label>Total Course Fee</Label>
                        <Amount>₹{fees.totalAmount}</Amount>
                    </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard elevation={0} borderColor="#2e7d32">
                        <Label>Amount Settled</Label>
                        <Amount color="#2e7d32">₹{fees.paidAmount}</Amount>
                    </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard elevation={0} borderColor="#d32f2f">
                        <Label>Outstanding Dues</Label>
                        <Amount color="#d32f2f">₹{fees.balanceAmount}</Amount>
                    </StatCard>
                </Grid>
            </Grid>

            {/* Online Payment Action - Commented out per request */}
            {/*
            {fees.balanceAmount > 0 && (
                <PaymentActionBox elevation={0}>
                    <Typography variant="body1" sx={{ fontFamily: 'serif', mb: 2 }}>
                        You have an outstanding balance. You can settle the full amount or pay an installment below.
                    </Typography>
                    <Primary3DButton onClick={loadRazorpay} disabled={loading}>
                        Authorize Online Payment
                    </Primary3DButton>
                </PaymentActionBox>
            )}
            */}

            <Divider sx={{ my: 4, borderColor: '#1a1a1a' }} />

            {/* Transaction History Component */}
            <StudentTransactionHistory student={student} />
        </Box>
    );
};

export default StudentFees;

// --- STYLED COMPONENTS ---
const StatCard = styled(Paper)`
    && {
        padding: 25px;
        border: 1px solid #e0dcd0;
        border-top: 5px solid ${props => props.borderColor};
        border-radius: 0;
        text-align: center;
    }
`;

const Label = styled.p` font-family: serif; font-size: 0.8rem; text-transform: uppercase; color: #7d6b5d; margin: 0; `;
const Amount = styled.p` font-family: 'Georgia', serif; font-size: 1.8rem; font-weight: bold; color: ${props => props.color || '#1a1a1a'}; margin: 10px 0 0 0; `;

const PaymentActionBox = styled(Paper)`
    && {
        margin-top: 30px;
        padding: 30px;
        background-color: #ffffff;
        border: 1px dashed #1a1a1a;
        border-radius: 0;
        text-align: center;
    }
`;

const Primary3DButton = styled.button`
    background-color: #1a1a1a; color: white; padding: 12px 30px; border: none;
    font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 1px;
    box-shadow: 4px 4px 0px #7d6b5d; cursor: pointer;
    &:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #7d6b5d; }
`;