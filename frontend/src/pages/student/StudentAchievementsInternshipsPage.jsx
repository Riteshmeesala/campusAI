import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import {
  EmojiEvents, BusinessCenter, Add, Download, CheckCircle,
  WorkspacePremium, UploadFile, Visibility, Star
} from '@mui/icons-material';

const ACHIEVEMENTS_DATA = [
  { id: 1, title: '1st Prize - National Smart India Hackathon (SIH 2025)', category: 'National Hackathon', date: 'Dec 2025', org: 'Ministry of Education & AICTE', certificateUrl: '#', status: 'Approved' },
  { id: 2, title: 'Published Research Paper on Distributed Consensus in IEEE Xplore', category: 'Research Publication', date: 'Nov 2025', org: 'IEEE ICCCNT Conference', certificateUrl: '#', status: 'Approved' },
  { id: 3, title: 'AWS Certified Solutions Architect - Associate', category: 'Global Certification', date: 'Jul 2025', org: 'Amazon Web Services', certificateUrl: '#', status: 'Approved' },
  { id: 4, title: 'Winner - Inter-College Algorithmic Coding Championship', category: 'Coding Contest', date: 'Mar 2026', org: 'ACM Student Chapter', certificateUrl: '#', status: 'Pending Verification' },
];

const INTERNSHIPS_DATA = [
  { id: 1, company: 'Google Cloud Labs', role: 'Software Engineer Intern (Cloud & AI)', duration: 'Jan 2026 - Jun 2026 (6 Months)', stipend: '₹65,000 / month', mode: 'Hybrid (Bengaluru)', nocStatus: 'Approved & Issued', mentorStatus: 'Approved', evaluationGrade: 'A+' },
  { id: 2, company: 'Infosys Springboard', role: 'AI & Machine Learning Virtual Intern', duration: 'Jun 2025 - Aug 2025 (2 Months)', stipend: 'Certificate + Mentorship', mode: 'Remote', nocStatus: 'Approved', mentorStatus: 'Completed', evaluationGrade: 'O' },
];

export default function StudentAchievementsInternshipsPage({ initialTab = 0 }) {
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('achievement'); // achievement or internship
  const [successMsg, setSuccessMsg] = useState('');

  // Forms
  const [achForm, setAchForm] = useState({ title: '', category: 'Hackathon', org: '', date: '' });
  const [intForm, setIntForm] = useState({ company: '', role: '', duration: '', stipend: '', mode: 'Remote' });

  const handleOpenAdd = (type) => {
    setModalType(type);
    setOpenModal(true);
    setSuccessMsg('');
  };

  const handleSave = () => {
    setSuccessMsg('Details submitted successfully for Dean / Faculty verification!');
    setTimeout(() => {
      setOpenModal(false);
      setSuccessMsg('');
    }, 1500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents sx={{ color: '#2563eb' }} /> Student Achievements & Internships
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Submit extra-curricular achievements, national awards, and register corporate internships for NOC approval.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenAdd(tabIndex === 0 ? 'achievement' : 'internship')}
          sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
        >
          {tabIndex === 0 ? 'Add New Achievement' : 'Register Internship / NOC'}
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
          <Tab icon={<EmojiEvents fontSize="small" />} iconPosition="start" label="Student Achievements & Honors" />
          <Tab icon={<BusinessCenter fontSize="small" />} iconPosition="start" label="Student Internships & NOC" />
        </Tabs>
      </Paper>

      {/* Tab 0: Student Achievements */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {ACHIEVEMENTS_DATA.map((ach) => (
            <Grid item xs={12} md={6} key={ach.id}>
              <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip label={ach.category} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip
                      label={ach.status}
                      size="small"
                      color={ach.status === 'Approved' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    {ach.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 0.5 }}>
                    Issuing Organization: <strong>{ach.org}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Awarded On: {ach.date}
                  </Typography>

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle sx={{ fontSize: 16 }} /> Verified by IQAC
                    </Typography>
                    <Button size="small" startIcon={<Download />} variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      View Certificate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 1: Student Internships */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Registered Academic & Industrial Internships
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Track Training & Placement Cell NOC issuance and credit evaluations
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Company / Organization</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Role / Profile</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Stipend</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>NOC Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Evaluation</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {INTERNSHIPS_DATA.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{item.company}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2563eb' }}>{item.role}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{item.duration}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>{item.stipend}</TableCell>
                    <TableCell>
                      <Chip label={item.nocStatus} color="success" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={`Grade ${item.evaluationGrade}`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Download />} variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Download NOC
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {modalType === 'achievement' ? 'Submit New Student Achievement' : 'Register Internship & Request NOC'}
        </DialogTitle>
        <DialogContent dividers>
          {successMsg ? (
            <Alert severity="success">{successMsg}</Alert>
          ) : modalType === 'achievement' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Achievement / Award Title"
                fullWidth
                size="small"
                value={achForm.title}
                onChange={(e) => setAchForm(p => ({ ...p, title: e.target.value }))}
              />
              <TextField
                select
                label="Category"
                fullWidth
                size="small"
                value={achForm.category}
                onChange={(e) => setAchForm(p => ({ ...p, category: e.target.value }))}
              >
                <MenuItem value="Hackathon">Hackathon / Coding Contest</MenuItem>
                <MenuItem value="Research Publication">Research Publication</MenuItem>
                <MenuItem value="Certification">Professional Certification</MenuItem>
                <MenuItem value="Sports & Culturals">Sports & Culturals</MenuItem>
              </TextField>
              <TextField
                label="Organizing Body / Institution"
                fullWidth
                size="small"
                value={achForm.org}
                onChange={(e) => setAchForm(p => ({ ...p, org: e.target.value }))}
              />
              <Button variant="outlined" component="label" startIcon={<UploadFile />} sx={{ textTransform: 'none' }}>
                Upload Certificate Proof (PDF/JPG)
                <input type="file" hidden />
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Company Name"
                fullWidth
                size="small"
                value={intForm.company}
                onChange={(e) => setIntForm(p => ({ ...p, company: e.target.value }))}
              />
              <TextField
                label="Designation / Role"
                fullWidth
                size="small"
                value={intForm.role}
                onChange={(e) => setIntForm(p => ({ ...p, role: e.target.value }))}
              />
              <TextField
                label="Duration (e.g. 3 Months, Jan-Apr)"
                fullWidth
                size="small"
                value={intForm.duration}
                onChange={(e) => setIntForm(p => ({ ...p, duration: e.target.value }))}
              />
              <TextField
                label="Monthly Stipend (₹)"
                fullWidth
                size="small"
                value={intForm.stipend}
                onChange={(e) => setIntForm(p => ({ ...p, stipend: e.target.value }))}
              />
              <Button variant="outlined" component="label" startIcon={<UploadFile />} sx={{ textTransform: 'none' }}>
                Upload Offer Letter (PDF)
                <input type="file" hidden />
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          {!successMsg && (
            <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none', bgcolor: '#2563eb' }}>
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
