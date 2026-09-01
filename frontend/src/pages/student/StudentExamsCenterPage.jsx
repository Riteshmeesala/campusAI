import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  NotificationsActive, EventNote, Assessment, Download, Print,
  Grade, AutoAwesome
} from '@mui/icons-material';

const EXAM_NOTIFICATIONS = [
  { id: 1, title: 'B.Tech III Year II Semester Regular SEE Examination Timetable Released', date: '01 Sep 2026', type: 'SEE Exam', isNew: true, deadline: '15 Sep 2026' },
  { id: 2, title: 'Hall Tickets Available for Download - CIE-2 Mid Examinations', date: '28 Aug 2026', type: 'Hall Ticket', isNew: true, deadline: '05 Sep 2026' },
  { id: 3, title: 'Notification for Recounting and Revaluation of B.Tech III Year I Sem Results', date: '20 Aug 2026', type: 'Re-evaluation', isNew: false, deadline: '10 Sep 2026' },
  { id: 4, title: 'Payment of Examination Fee for Supply / Improvement Candidates', date: '15 Aug 2026', type: 'Exam Fee', isNew: false, deadline: '30 Aug 2026' },
];

const EXAM_ROUTINE = [
  { date: '18 Sep 2026', day: 'Friday', time: '10:00 AM - 01:00 PM', subject: 'Cloud Computing & Distributed Systems', code: 'CS601PC', room: 'Block-A / Hall 301' },
  { date: '21 Sep 2026', day: 'Monday', time: '10:00 AM - 01:00 PM', subject: 'Machine Learning & Neural Nets', code: 'CS602PC', room: 'Block-A / Hall 301' },
  { date: '23 Sep 2026', day: 'Wednesday', time: '10:00 AM - 01:00 PM', subject: 'Information Security & Cryptography', code: 'CS603PC', room: 'Block-A / Hall 302' },
  { date: '25 Sep 2026', day: 'Friday', time: '10:00 AM - 01:00 PM', subject: 'Compiler Design', code: 'CS604PC', room: 'Block-A / Hall 302' },
  { date: '28 Sep 2026', day: 'Monday', time: '10:00 AM - 01:00 PM', subject: 'Open Elective - Renewable Energy', code: 'OE601', room: 'Block-B / Hall 204' },
];

const SEMESTER_RESULTS = [
  { code: 'CS601PC', name: 'Cloud Computing & Distributed Systems', credits: 4, internal: 28, external: 62, total: 90, grade: 'O', points: 10, status: 'PASS' },
  { code: 'CS602PC', name: 'Machine Learning & Neural Nets', credits: 4, internal: 27, external: 58, total: 85, grade: 'A+', points: 9, status: 'PASS' },
  { code: 'CS603PC', name: 'Information Security & Cryptography', credits: 3, internal: 26, external: 55, total: 81, grade: 'A+', points: 9, status: 'PASS' },
  { code: 'CS604PC', name: 'Compiler Design', credits: 3, internal: 25, external: 54, total: 79, grade: 'A', points: 8, status: 'PASS' },
  { code: 'CS605PC', name: 'Full Stack Web Dev Lab', credits: 2, internal: 29, external: 68, total: 97, grade: 'O', points: 10, status: 'PASS' },
  { code: 'CS606PC', name: 'AI & Deep Learning Lab', credits: 2, internal: 28, external: 66, total: 94, grade: 'O', points: 10, status: 'PASS' },
];

export default function StudentExamsCenterPage({ initialTab = 0 }) {
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [revalOpen, setRevalOpen] = useState(false);
  const [selectedSubjectReval, setSelectedSubjectReval] = useState('');
  const [revalSuccess, setRevalSuccess] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#2563eb' }} /> Examination Hub & Results
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Access official exam circulars, routine datesheets, hall tickets, and semester marks memo.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
        >
          Download Hall Ticket
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            bgcolor: '#ffffff',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, py: 2, minHeight: 48 },
            '& .Mui-selected': { color: '#2563eb' },
            '& .MuiTabs-indicator': { bgcolor: '#2563eb', height: 3 }
          }}
        >
          <Tab icon={<NotificationsActive fontSize="small" />} iconPosition="start" label="Exam Notifications" />
          <Tab icon={<EventNote fontSize="small" />} iconPosition="start" label="Exam Routine & Datesheet" />
          <Tab icon={<Grade fontSize="small" />} iconPosition="start" label="Exam Results & Grade Cards" />
        </Tabs>
      </Paper>

      {/* Tab 0: Exam Notifications */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Official Examination Bulletins
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {EXAM_NOTIFICATIONS.map((notif) => (
                  <Card
                    key={notif.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#93c5fd', bgcolor: '#f8fafc' }
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={notif.type} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                          {notif.isNew && <Chip label="NEW" size="small" color="error" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Published: {notif.date}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', my: 0.5 }}>
                        {notif.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                          Last Date: {notif.deadline}
                        </Typography>
                        <Button size="small" startIcon={<Download />} variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                          Download Circular PDF
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Examination Instructions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  • Students must carry their Physical College ID Card & Hall Ticket.
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  • Entry permitted up to 15 minutes after start time; no electronic smartwatches/phones allowed.
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  • For revaluation requests, apply within 10 days of results announcement.
                </Typography>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2.5, border: '1px solid #bfdbfe' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesome fontSize="small" /> AI Exam Readiness
                </Typography>
                <Typography variant="caption" sx={{ color: '#3b82f6', mt: 0.5, display: 'block' }}>
                  Based on your CIE scores, your predicted SEE SGPA is <strong>9.14</strong>. Review Compiler Design Unit 4 for maximum improvement!
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Exam Routine */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                End-Semester Theory Examinations Timetable (SEE 2026)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Batch: 2023-2027 • B.Tech III Year II Sem (Computer Science & Engineering)
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<Download />} size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Download Timetable
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date & Day</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Course Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Examination Hall</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {EXAM_ROUTINE.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {r.date}
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>{r.day}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{r.time}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e40af' }}>{r.subject}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{r.code}</TableCell>
                    <TableCell>
                      <Chip label={r.room} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Exam Results */}
      {tabIndex === 2 && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>CURRENT SEMESTER SGPA</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563eb', mt: 0.5 }}>9.18</Typography>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>Top 5% in Department</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>CUMULATIVE CGPA</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>8.94</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Total Earned Credits: 124 / 160</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>RESULT STATUS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>PASSED</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Zero Active Backlogs</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Results Table */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Semester Marks & Grade Memo
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Controller of Examinations Verified • Digital Copy
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" color="secondary" size="small" onClick={() => setRevalOpen(true)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                  Apply for Re-evaluation
                </Button>
                <Button variant="contained" startIcon={<Print />} size="small" sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}>
                  Print Grade Card
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Course Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Course Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Credits</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Internal (30)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>External (70)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Total (100)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SEMESTER_RESULTS.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.code}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{row.name}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.credits}</TableCell>
                      <TableCell>{row.internal}</TableCell>
                      <TableCell>{row.external}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.total}</TableCell>
                      <TableCell>
                        <Chip label={row.grade} color={row.grade === 'O' ? 'success' : 'primary'} size="small" sx={{ fontWeight: 800 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status} color="success" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Revaluation Modal */}
      <Dialog open={revalOpen} onClose={() => setRevalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Apply for Re-evaluation / Recounting</DialogTitle>
        <DialogContent dividers>
          {revalSuccess ? (
            <Alert severity="success">Your revaluation request has been submitted. Tracking Ref: #REV-2026-8891</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                Select the subject for recount/revaluation. Fee is ₹500 per subject.
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                label="Select Subject"
                value={selectedSubjectReval}
                onChange={(e) => setSelectedSubjectReval(e.target.value)}
              >
                {SEMESTER_RESULTS.map((r) => (
                  <MenuItem key={r.code} value={r.code}>
                    {r.code} - {r.name} (Grade: {r.grade})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setRevalOpen(false); setRevalSuccess(false); }} sx={{ textTransform: 'none' }}>Close</Button>
          {!revalSuccess && (
            <Button
              variant="contained"
              onClick={() => setRevalSuccess(true)}
              disabled={!selectedSubjectReval}
              sx={{ textTransform: 'none', bgcolor: '#2563eb' }}
            >
              Pay & Submit Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
