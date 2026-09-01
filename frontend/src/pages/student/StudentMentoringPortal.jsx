import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Avatar
} from '@mui/material';
import {
  Send
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function StudentMentoringPortal() {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [topic, setTopic] = useState('Academic Remedial & Exam Preparation');
  const [note, setNote] = useState('');

  const handleRequestSession = () => {
    toast.success('Mentoring appointment request dispatched to your Faculty Mentor!');
    setRequestModalOpen(false);
    setNote('');
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Mentoring & Counselor Portal"
        subtitle="Connect with your assigned faculty mentor, schedule one-on-one advisory sessions, and review counseling remarks"
        breadcrumbs={['Home', 'Student', 'Mentoring']}
        action={
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setRequestModalOpen(true)}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
          >
            Request Mentor Meeting
          </Button>
        }
      />

      {/* Mentor Profile Dossier */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 3, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 84, height: 84, mx: 'auto', bgcolor: '#ea580c', fontSize: '2rem', fontWeight: 800, mb: 1 }}>
                SK
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a">Dr. S. K. Sharma</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Associate Professor & HOD</Typography>
              <Chip label="Your Assigned Faculty Mentor" color="primary" size="small" sx={{ mt: 1, fontWeight: 700, fontSize: 10 }} />
            </Grid>
            <Grid item xs={12} sm={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>CABIN LOCATION</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">Block A, 2nd Floor, Room 204</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>OFFICIAL EMAIL</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">sk.sharma@campusiq.edu</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>REGULAR MENTORING SLOTS</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">Every Friday • 03:00 PM - 04:30 PM</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MENTORING COHORT RATIO</Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">1 Mentor : 24 Students (NBA Audited)</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Counseling History & Action Items */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle1" fontWeight={700}>Your Mentoring Counseling Session History & Action Plan</Typography>
            <Chip label="Term: Even Semester 2023-24" size="small" color="primary" sx={{ fontWeight: 600 }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Session Date', 'Category', 'Mentor Counseling Remarks', 'Action Plan Assigned to You', 'Follow-up Status'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { date: '16 Feb 2024', cat: 'ACADEMIC REMEDIAL', remarks: 'Reviewed mid-term 1 preparation. Advised focusing on Unit 2 concurrency proofs in CS401. Special tutorial material shared.', action: 'Complete 2 practice problem sets before 25 Feb', status: 'IN PROGRESS' },
                  { date: '12 Jan 2024', cat: 'CAREER & PLACEMENT', remarks: 'Discussed Capstone Project scope and recommended targeting Scopus indexed conference publication for final viva distinction.', action: 'Submit literature survey draft', status: 'COMPLETED' },
                  { date: '08 Nov 2023', cat: 'SEMESTER ORIENTATION', remarks: 'Reviewed 3rd year credit roadmap, elective course choices, and summer internship prerequisites.', action: 'Register for NPTEL certification', status: 'COMPLETED' },
                ].map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{s.date}</TableCell>
                    <TableCell><Chip label={s.cat} size="small" variant="outlined" sx={{ fontSize: 9 }} /></TableCell>
                    <TableCell sx={{ fontSize: 12, maxWidth: 350 }}>{s.remarks}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, color: COLORS.secondary }}>{s.action}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        size="small"
                        sx={{
                          bgcolor: s.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                          color: s.status === 'COMPLETED' ? '#166534' : '#92400e',
                          fontWeight: 700,
                          fontSize: 10
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <Dialog open={requestModalOpen} onClose={() => setRequestModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Advisory Meeting</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth size="small" label="Discussion Topic" value={topic} onChange={e => setTopic(e.target.value)}>
              <MenuItem value="Academic Remedial & Exam Preparation">Academic Remedial & Exam Preparation</MenuItem>
              <MenuItem value="Career, Placement & Higher Studies">Career, Placement & Higher Studies</MenuItem>
              <MenuItem value="Attendance & Leave Verification">Attendance & Leave Verification</MenuItem>
              <MenuItem value="Personal / Mental Wellness Support">Personal / Mental Wellness Support</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Brief Note for Mentor"
              placeholder="Explain the specific guidance or query you would like to discuss..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRequestModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRequestSession} sx={{ bgcolor: COLORS.secondary, fontWeight: 700 }}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
