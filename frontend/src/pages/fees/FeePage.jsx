/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button, Chip, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, TextField, Dialog, FormControl, InputLabel,
  DialogTitle, DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import { Payment, CheckCircle, PendingActions, Cancel, Refresh, Edit, Delete, Add } from '@mui/icons-material';
import { feeAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import StatCard from '../../components/shared/StatCard';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const statusColors = {
  PAID:      { color: COLORS.excellent, bg: COLORS.greenBg,   label: 'Paid ✓' },
  SUCCESS:   { color: COLORS.excellent, bg: COLORS.greenBg,   label: 'Paid ✓' },
  PENDING:   { color: COLORS.moderate,  bg: COLORS.moderateBg, label: 'Pending' },
  OVERDUE:   { color: COLORS.critical,  bg: COLORS.criticalBg, label: 'Overdue' },
  CANCELLED: { color: COLORS.critical,  bg: COLORS.criticalBg, label: 'Cancelled' },
  REFUNDED:  { color: COLORS.secondary, bg: '#dbeafe',         label: 'Refunded' },
};

export default function FeePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [fees,     setFees]     = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [payDialog, setPayDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payForm, setPayForm] = useState({ feeType: '', amount: '', feeId: null });
  const [editForm, setEditForm] = useState({ status: '', amount: '', dueDate: '', description: '' });
  const [addForm, setAddForm] = useState({ studentId: '', feeType: '', amount: '', dueDate: '', description: '', academicYear: '2025-26', semester: '4' });

  const load = () => {
    setLoading(true);
    const req = isAdmin ? feeAPI.getAllFees() : feeAPI.getMyFees();
    req
      .then(r => { setFees(r.data.data || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load fees'); setLoading(false); });
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      userAPI.getStudents().then(r => setStudents(r.data.data || [])).catch(() => {});
    }
  }, []);

  const openEdit = (fee) => {
    setSelectedFee(fee);
    setEditForm({
      status: fee.status,
      amount: fee.amount,
      dueDate: fee.dueDate ? dayjs(fee.dueDate).format('YYYY-MM-DD') : '',
      description: fee.description || '',
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await feeAPI.updateFee(selectedFee.id, editForm);
      toast.success('Fee updated successfully');
      setEditDialog(false);
      load();
    } catch { toast.error('Failed to update fee'); }
  };

  const handleDelete = async (fee) => {
    if (!window.confirm(`Delete fee "${fee.feeType}" for ${fee.student?.name}?`)) return;
    try {
      await feeAPI.deleteFee(fee.id);
      toast.success('Fee deleted');
      load();
    } catch { toast.error('Failed to delete fee'); }
  };

  const handleAddFee = async () => {
    if (!addForm.studentId || !addForm.feeType || !addForm.amount || !addForm.dueDate) {
      toast.warning('Fill all required fields'); return;
    }
    try {
      await feeAPI.createFee({ ...addForm, studentId: Number(addForm.studentId), amount: Number(addForm.amount) });
      toast.success('Fee created successfully');
      setAddDialog(false);
      setAddForm({ studentId: '', feeType: '', amount: '', dueDate: '', description: '', academicYear: '2025-26', semester: '4' });
      load();
    } catch { toast.error('Failed to create fee'); }
  };

  // ── RAZORPAY PAYMENT ──────────────────────────────────────────────────────
  // openRazorpay(fee): takes the fee object, creates Razorpay order, opens checkout
  const openRazorpay = async (fee) => {
    if (!fee?.id) { toast.warning('Invalid fee selected'); return; }
    try {
      // Step 1: Create order on backend
      const orderRes = await feeAPI.createPaymentOrder(fee.id);
      const order = orderRes.data?.data;
      if (!order?.orderId) throw new Error('Invalid order response from server');

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
        amount: order.amount,          // in paise (backend returns amount * 100)
        currency: order.currency || 'INR',
        name: 'CampusIQ+',
        description: fee.description || fee.feeType || 'Fee Payment',
        order_id: order.orderId,
        // Step 2: Verify payment on success
        handler: async (response) => {
          try {
            await feeAPI.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              feeId: fee.id,
            });
            toast.success('✅ Payment successful! Receipt sent to your email.');
            load();
          } catch {
            toast.error('Payment verification failed. Contact admin with your payment ID.');
          }
        },
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
        },
        theme: { color: '#0f2345' },
        modal: {
          ondismiss: () => { toast.info('Payment cancelled.'); },
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK not loaded. Add script to index.html — see README.');
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        toast.error('Payment failed: ' + (res.error?.description || 'Try again.'));
      });
      rzp.open();

    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not initiate payment. Check backend & Razorpay keys.');
      setPaying(false);
    }
  };

  const handlePay = async () => {
    const feeId = payForm.feeId;
    if (!feeId) { toast.warning('Select a fee to pay'); return; }
    // Find full fee object so openRazorpay can use its description/type
    const selectedFeeObj = fees.find(f => String(f.id) === String(feeId));
    if (!selectedFeeObj) { toast.warning('Fee not found'); return; }
    setPaying(true);
    setPayDialog(false);
    await openRazorpay(selectedFeeObj);
    setPaying(false);
  };

  const paid    = fees.filter(f => f.status === 'PAID' || f.status === 'SUCCESS');
  const pending = fees.filter(f => f.status === 'PENDING');
  const overdue = fees.filter(f => f.status === 'OVERDUE');
  const totalPaid    = paid.reduce((s, f) => s + Number(f.amount || 0), 0);
  const totalPending = [...pending, ...overdue].reduce((s, f) => s + Number(f.amount || 0), 0);

  return (
    <Box>
      <PageHeader
        title={isAdmin ? 'Fee Management (Admin)' : 'My Fees'}
        subtitle={isAdmin ? 'View, update, and manage all student fees' : 'View history and make payments'}
        breadcrumbs={['Home', 'Fees']}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAdmin && (
              <Button variant="contained" onClick={() => setAddDialog(true)} startIcon={<Add />}
                sx={{ borderRadius: 2, bgcolor: COLORS.excellent }}>
                Add Fee
              </Button>
            )}
            {!isAdmin && (
              <Button variant="contained" onClick={() => setPayDialog(true)} startIcon={<Payment />}
                sx={{ borderRadius: 2, bgcolor: COLORS.primary }}>
                Pay Fee
              </Button>
            )}
            <Button variant="outlined" onClick={load} startIcon={<Refresh />} sx={{ borderRadius: 2 }}>
              Refresh
            </Button>
          </Box>
        }
      />

      {!window.Razorpay && !isAdmin && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          ℹ️ Add Razorpay script to index.html for live payments.
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CheckCircle />} label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} color={COLORS.excellent} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PendingActions />} label="Pending / Overdue" value={`₹${totalPending.toLocaleString()}`} color={totalPending > 0 ? COLORS.critical : COLORS.textMuted} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<Payment />} label="Total Records" value={fees.length} color={COLORS.secondary} />
        </Grid>
      </Grid>

      {!isAdmin && pending.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          You have {pending.length} pending fee{pending.length > 1 ? 's' : ''} totaling ₹{totalPending.toLocaleString()}.
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {isAdmin ? 'All Student Fees' : 'Payment History'}
            </Typography>
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={32} /></Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {isAdmin && <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>}
                    <TableCell sx={{ fontWeight: 700 }}>Fee Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paid On</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fees.length > 0 ? fees.map(fee => {
                    const s = statusColors[fee.status] || statusColors.PENDING;
                    return (
                      <TableRow key={fee.id} hover>
                        {isAdmin && (
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{fee.student?.name || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">{fee.student?.enrollmentNumber || ''}</Typography>
                          </TableCell>
                        )}
                        <TableCell>{fee.feeType || fee.feeName}</TableCell>
                        <TableCell>
                          <Typography fontWeight={700}>₹{Number(fee.amount || 0).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={fee.dueDate && dayjs(fee.dueDate).isBefore(dayjs()) && fee.status === 'PENDING' ? COLORS.critical : 'text.secondary'}>
                            {fee.dueDate ? dayjs(fee.dueDate).format('DD MMM YYYY') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {fee.paidDate ? dayjs(fee.paidDate).format('DD MMM YYYY') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={s.label} size="small"
                            sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.72rem' }} />
                        </TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Edit fee">
                                <IconButton size="small" onClick={() => openEdit(fee)} sx={{ color: COLORS.primary }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete fee">
                                <IconButton size="small" onClick={() => handleDelete(fee)} sx={{ color: COLORS.critical }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            fee.status === 'PENDING' && (
                              <Button size="small" variant="contained"
                                sx={{ bgcolor: COLORS.primary, borderRadius: 1.5, fontSize: '0.72rem', py: 0.4 }}
                                onClick={() => { setPayForm({ feeType: fee.feeType, amount: fee.amount, feeId: fee.id }); setPayDialog(true); }}>
                                Pay
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No fee records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Admin: Edit Fee Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>✏️ Edit Fee — {selectedFee?.student?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={editForm.status} label="Status" onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Amount (₹)" size="small" type="number"
              value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} />
            <TextField label="Due Date" size="small" type="date" InputLabelProps={{ shrink: true }}
              value={editForm.dueDate} onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))} />
            <TextField label="Description (optional)" size="small" multiline rows={2}
              value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" sx={{ borderRadius: 2, bgcolor: COLORS.primary }}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Admin: Add Fee Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>➕ Add New Fee</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Student *</InputLabel>
              <Select value={addForm.studentId} label="Student *"
                onChange={e => setAddForm(p => ({ ...p, studentId: e.target.value }))}>
                {students.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name} ({s.enrollmentNumber})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Fee Type *" size="small" value={addForm.feeType}
              onChange={e => setAddForm(p => ({ ...p, feeType: e.target.value }))}
              placeholder="e.g., Tuition Fee, Lab Fee" />
            <TextField label="Amount (₹) *" size="small" type="number" value={addForm.amount}
              onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))} />
            <TextField label="Due Date *" size="small" type="date" InputLabelProps={{ shrink: true }}
              value={addForm.dueDate} onChange={e => setAddForm(p => ({ ...p, dueDate: e.target.value }))} />
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <TextField label="Academic Year" size="small" fullWidth value={addForm.academicYear}
                  onChange={e => setAddForm(p => ({ ...p, academicYear: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Semester" size="small" type="number" fullWidth value={addForm.semester}
                  onChange={e => setAddForm(p => ({ ...p, semester: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Description" size="small" multiline rows={2} value={addForm.description}
              onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setAddDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleAddFee} variant="contained" sx={{ borderRadius: 2, bgcolor: COLORS.excellent }}>Add Fee</Button>
        </DialogActions>
      </Dialog>

      {/* Student: Pay Dialog */}
      <Dialog open={payDialog} onClose={() => { if (!paying) setPayDialog(false); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>💳 Confirm Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Fee Type</Typography>
            <Typography fontWeight={700}>{payForm.feeType || '—'}</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Amount</Typography>
            <Typography fontWeight={700} fontSize="1.3rem" color={COLORS.primary}>₹{Number(payForm.amount || 0).toLocaleString()}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            You will be redirected to Razorpay secure payment gateway.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setPayDialog(false)} disabled={paying} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handlePay} variant="contained" disabled={paying}
            sx={{ borderRadius: 2, bgcolor: COLORS.primary, minWidth: 120 }}>
            {paying ? <CircularProgress size={20} color="inherit" /> : `Pay ₹${Number(payForm.amount || 0).toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}