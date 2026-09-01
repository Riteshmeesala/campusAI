import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import {
  Payment, Download, CreditCard
} from '@mui/icons-material';
import {
  getSharedFeeReceipts, recordSharedFeePayment, subscribeToDataSync
} from '../../services/dataSync';

const INITIAL_FEE_STRUCTURE = [
  { item: 'Annual Tuition Fee (Academic Year 2026-2027)', totalAmount: 115000, paidAmount: 115000, dueAmount: 0, dueDate: '31 Jul 2026', status: 'Paid' },
  { item: 'Special Labs & High-Performance Computing Fee', totalAmount: 15000, paidAmount: 15000, dueAmount: 0, dueDate: '31 Jul 2026', status: 'Paid' },
  { item: 'University Examination & Accreditation Fee', totalAmount: 5000, paidAmount: 5000, dueAmount: 0, dueDate: '15 Aug 2026', status: 'Paid' },
  { item: 'Campus Transport Bus Fee (Route 14)', totalAmount: 32000, paidAmount: 16000, dueAmount: 16000, dueDate: '30 Sep 2026', status: 'Partially Paid' },
  { item: 'Library Security Caution Deposit (Refundable)', totalAmount: 3000, paidAmount: 3000, dueAmount: 0, dueDate: 'Paid at Admission', status: 'Paid' },
];

export default function StudentFeeDuesPage() {
  const [feeStructure, setFeeStructure] = useState(INITIAL_FEE_STRUCTURE);
  const [receiptsList, setReceiptsList] = useState(getSharedFeeReceipts());
  const [payModal, setPayModal] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    const unsub = subscribeToDataSync(() => {
      setReceiptsList(getSharedFeeReceipts());
    });
    return unsub;
  }, []);

  const totalFee = feeStructure.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = feeStructure.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalDue = feeStructure.reduce((acc, f) => acc + f.dueAmount, 0);

  const handleConfirmPay = () => {
    const newReceipt = {
      receiptNo: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: 'Ritesh Meesala',
      rollNo: '23CS042',
      date: new Date().toISOString().split('T')[0],
      description: 'Campus Transport Final Installment Clearance',
      amount: '₹16,000.00',
      amountNum: 16000,
      mode: 'Online / Razorpay',
      status: 'Settled & Verified'
    };
    const updatedReceipts = recordSharedFeePayment(newReceipt);
    setReceiptsList(updatedReceipts);
    setFeeStructure(prev => prev.map(f => f.item.includes('Transport') ? { ...f, paidAmount: 32000, dueAmount: 0, status: 'Paid' } : f));
    setPaySuccess(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment sx={{ color: '#2563eb' }} /> Tuition Fees & Dues Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            View academic fee breakdown, installment dues, official receipts, and make secure digital fee payments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disabled={totalDue === 0}
          onClick={() => { setPayModal(true); setPaySuccess(false); }}
          startIcon={<CreditCard />}
          sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
        >
          Pay Pending Dues (₹{totalDue.toLocaleString('en-IN')})
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>TOTAL ANNUAL ACADEMIC FEE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>₹{totalFee.toLocaleString('en-IN')}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Includes Tuition, Labs & Bus</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>TOTAL PAID TO DATE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>₹{totalPaid.toLocaleString('en-IN')}</Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>91.5% Fee Cleared</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>OUTSTANDING BALANCE DUE</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: totalDue > 0 ? '#dc2626' : '#16a34a', mt: 0.5 }}>
              ₹{totalDue.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Transport Installment 2 Due 30 Sep</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Fee Breakdown Table */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
          Detailed Fee Component Breakdown (2026-2027)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fee Head & Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Paid Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Due Balance</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeStructure.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.item}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{row.totalAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>₹{row.paidAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: row.dueAmount > 0 ? '#dc2626' : '#64748b' }}>
                    ₹{row.dueAmount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{row.dueDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={row.status === 'Paid' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Receipts History */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
          Official Payment Receipts & Transaction Records
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Receipt No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Amount Paid</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Payment Mode</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receiptsList.map((rcp) => (
                <TableRow key={rcp.receiptNo} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{rcp.receiptNo}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{rcp.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{rcp.description}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16a34a' }}>{rcp.amount}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{rcp.mode}</TableCell>
                  <TableCell>
                    <Chip label={rcp.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Download />} variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pay Modal */}
      <Dialog open={payModal} onClose={() => setPayModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Campus IQ Payment Gateway</DialogTitle>
        <DialogContent dividers>
          {paySuccess ? (
            <Alert severity="success">
              Payment of ₹16,000.00 successful! Receipt generated and recorded across campus accounting systems.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                You are paying the outstanding balance for <strong>Campus Transport Bus Fee</strong>.
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>PAYMENT AMOUNT</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb' }}>₹16,000.00</Typography>
              </Paper>
              <TextField label="Card / UPI ID" placeholder="user@okhdfcbank" fullWidth size="small" />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayModal(false)} sx={{ textTransform: 'none' }}>Close</Button>
          {!paySuccess && (
            <Button variant="contained" onClick={handleConfirmPay} sx={{ textTransform: 'none', bgcolor: '#16a34a' }}>
              Confirm & Pay ₹16,000
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
