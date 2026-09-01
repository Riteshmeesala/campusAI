import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Divider
} from '@mui/material';
import {
  CloudUpload, Download
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function StudentProjectsPortal() {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [gitUrl, setGitUrl] = useState('https://github.com/campus-ai-team/autonomous-drone-navigation');
  const [thesisDoc, setThesisDoc] = useState('CSE_P01_Capstone_Final_Report_v2.pdf');

  const [projectData] = useState({
    batchId: 'CSE-P01',
    title: 'Autonomous Drone Navigation Using Deep Reinforcement Learning in GPS-Denied Environments',
    domain: 'Artificial Intelligence, Robotics & Computer Vision',
    guide: 'Dr. S. K. Sharma (Associate Professor & HOD)',
    team: [
      { roll: '21CS001', name: 'Aarav Patel (Team Lead)' },
      { roll: '21CS014', name: 'Bhavna Sharma' },
      { roll: '21CS028', name: 'Chirag Rao' },
      { roll: '21CS035', name: 'Divya Reddy' },
    ],
    phase1Score: '28 / 30',
    phase2Score: '27 / 30',
    vivaScore: '36 / 40',
    totalScore: '91 / 100 (Grade: O)',
    plagiarism: '6.4% Similarity (Turnitin Verified)',
    status: 'READY FOR FINAL VIVA VOCE'
  });

  const handleUpdateSubmission = () => {
    toast.success('Capstone Project Thesis & GitHub Repository updated successfully!');
    setSubmitModalOpen(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Capstone Project & Thesis Portal"
        subtitle="Track your major project milestone deliverables, review phase marks, plagiarism verification, and submit final documentation"
        breadcrumbs={['Home', 'Student', 'Academic Projects']}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => toast.success('Exporting Project Evaluation Rubric Ledger (.PDF)')}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Export Rubric Sheet
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setSubmitModalOpen(true)}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
            >
              Submit Final Thesis
            </Button>
          </Stack>
        }
      />

      {/* Project Overview Card */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 3, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Chip label={`Batch ID: ${projectData.batchId}`} color="primary" sx={{ fontWeight: 800, mb: 1 }} />
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={0.5}>
                {projectData.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Domain Specialization: <strong>{projectData.domain}</strong>
              </Typography>
            </Box>
            <Chip
              label={projectData.status}
              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 11, py: 1 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>INTERNAL PROJECT GUIDE</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">{projectData.guide}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>PLAGIARISM CHECK (TURNITIN)</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#16a34a">{projectData.plagiarism}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>AGGREGATE REVIEW GRADE</Typography>
                <Typography variant="subtitle2" fontWeight={800} color={COLORS.secondary}>{projectData.totalScore}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Review Phase Marks Breakdown */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, px: 2.5, bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle1" fontWeight={700}>Evaluation Phases & Rubric Grading Breakdown</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      {['Evaluation Milestone', 'Weightage', 'Marks Awarded', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { name: 'Phase 1 Review (Literature Survey & Architecture)', weight: '30%', score: projectData.phase1Score, status: 'COMPLETED' },
                      { name: 'Phase 2 Review (Implementation, Code & Testing)', weight: '30%', score: projectData.phase2Score, status: 'COMPLETED' },
                      { name: 'Final Viva Voce & External Demonstration', weight: '40%', score: projectData.vivaScore, status: 'PROVISIONAL' },
                    ].map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{row.name}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{row.weight}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#16a34a', fontSize: 12 }}>{row.score}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Project Team Members</Typography>
              <Stack spacing={1}>
                {projectData.team.map((t, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">{t.name}</Typography>
                    <Typography variant="caption" fontFamily="monospace" color="text.secondary">{t.roll}</Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Final Thesis Upload Modal */}
      <Dialog open={submitModalOpen} onClose={() => setSubmitModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit Final Capstone Project Deliverables</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="GitHub Source Code Repository Link"
              value={gitUrl}
              onChange={e => setGitUrl(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Thesis Document File Name (PDF)"
              value={thesisDoc}
              onChange={e => setThesisDoc(e.target.value)}
            />
            <Paper
              sx={{
                p: 3,
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                bgcolor: '#f8fafc',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: COLORS.secondary }
              }}
              onClick={() => toast.info('Selected new project thesis file (.PDF)')}
            >
              <CloudUpload sx={{ fontSize: 36, color: COLORS.secondary, mb: 0.5 }} />
              <Typography variant="subtitle2" fontWeight={700}>Upload Final Report PDF (with Plagiarism Certificate)</Typography>
              <Typography variant="caption" color="text.secondary">Max file size 50MB</Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSubmission} sx={{ bgcolor: COLORS.secondary, fontWeight: 700 }}>
            Submit Deliverables
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
