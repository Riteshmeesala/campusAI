import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, IconButton, Tooltip, Divider, Alert
} from '@mui/material';
import {
  Assignment, CloudUpload, CheckCircle, Schedule, Download,
  Visibility, AttachFile, Grade, Star, Feedback, Send
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';
import { broadcastDataChange, subscribeToDataSync, DATA_SYNC_EVENTS } from '../../services/dataSync';
import { useAuth } from '../../context/AuthContext';

export default function StudentAssignmentsPortal() {
  const { user } = useAuth();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [remarks, setRemarks] = useState('');

  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('campusiq_assignments_data');
    return saved ? JSON.parse(saved) : [
      { id: 'ASG-CS401-01', title: 'Implementation of Classical Synchronization Primitives in C/POSIX', course: 'CS401 (OS)', unit: 'Unit 2: Concurrency & Semaphores', maxMarks: 20, due: '15 Feb 2024', status: 'GRADED', score: '19 / 20', feedback: 'Excellent implementation of producer-consumer with bounded buffer. Good documentation.' },
      { id: 'ASG-CS401-02', title: 'Virtual Memory Page Replacement Simulation & Benchmarking', course: 'CS401 (OS)', unit: 'Unit 3: Memory Management', maxMarks: 20, due: '05 Mar 2024', status: 'SUBMITTED', score: 'Pending Evaluation', feedback: 'Under faculty review' },
      { id: 'ASG-CS403-01', title: 'A* Search Algorithm and Alpha-Beta Pruning Implementation', course: 'CS403 (AI)', unit: 'Unit 1: Informed Search', maxMarks: 25, due: '18 Mar 2024', status: 'PENDING SUBMISSION', score: 'Not Submitted', feedback: '-' },
    ];
  });

  useEffect(() => {
    const unsubscribe = subscribeToDataSync((event) => {
      if (event.type === DATA_SYNC_EVENTS.ASSIGNMENT_CREATED) {
        setAssignments(prev => [event.payload.assignment, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  const handleOpenSubmit = (asg) => {
    setSelectedAsg(asg);
    setSubmissionFile(null);
    setRemarks('');
    setSubmitModalOpen(true);
  };

  const handleUploadSubmission = () => {
    if (!submissionFile) {
      toast.error('Please attach your solution document (PDF/ZIP)');
      return;
    }
    const updated = assignments.map(a => a.id === selectedAsg.id ? {
      ...a, status: 'SUBMITTED', score: 'Under Evaluation', submittedFile: submissionFile.name, feedback: 'Solution received. Awaiting faculty evaluation.'
    } : a);
    setAssignments(updated);
    localStorage.setItem('campusiq_assignments_data', JSON.stringify(updated));
    toast.success(`Assignment "${selectedAsg.title}" submitted successfully!`);
    setSubmitModalOpen(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Assignments & Homework Portal"
        subtitle="View course assignments assigned by your faculty, submit homework solutions online, and view rubric grading feedback"
        breadcrumbs={['Home', 'Student', 'Assignments']}
        action={
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => toast.success('Exporting Semester Assignment Grade Report (PDF)')}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Export Gradebook (PDF)
          </Button>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Assigned Tasks', val: `${assignments.length} Tasks`, sub: 'Even Semester 2023-24', color: '#2563eb' },
          { label: 'Completed & Evaluated', val: '1 Task', sub: 'Average Score: 95%', color: '#16a34a' },
          { label: 'Submitted & In Review', val: '1 Task', sub: 'Awaiting Faculty Score', color: COLORS.secondary },
          { label: 'Pending Action', val: '1 Task', sub: 'Due in 14 Days', color: '#dc2626' },
        ].map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{k.label}</Typography>
                <Typography variant="h5" fontWeight={800} color={k.color} my={0.5}>{k.val}</Typography>
                <Typography variant="caption" color="text.secondary">{k.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Assignments Table */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle1" fontWeight={700}>Course Homework & Continuous Internal Assessment Tasks</Typography>
            <Chip label="Section A (CSE IV Year)" color="primary" size="small" sx={{ fontWeight: 600 }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Task ID', 'Assignment Title & Syllabus Topic', 'Course Code', 'Max Marks', 'Due Date', 'Status', 'Your Marks', 'Faculty Feedback', 'Action'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((asg, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{asg.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0f172a">{asg.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{asg.unit}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{asg.course}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{asg.maxMarks} M</TableCell>
                    <TableCell sx={{ fontSize: 12, color: asg.status === 'PENDING SUBMISSION' ? '#dc2626' : '#64748b', fontWeight: 700 }}>{asg.due}</TableCell>
                    <TableCell>
                      <Chip
                        label={asg.status}
                        size="small"
                        sx={{
                          bgcolor: asg.status === 'GRADED' ? '#dcfce7' : asg.status === 'SUBMITTED' ? '#eff6ff' : '#fee2e2',
                          color: asg.status === 'GRADED' ? '#166534' : asg.status === 'SUBMITTED' ? '#1d4ed8' : '#b91c1c',
                          fontWeight: 700,
                          fontSize: 10
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: asg.status === 'GRADED' ? '#16a34a' : 'text.secondary', fontSize: 12 }}>
                      {asg.score}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, maxWidth: 200, color: 'text.secondary' }}>
                      {asg.feedback}
                    </TableCell>
                    <TableCell>
                      {asg.status === 'PENDING SUBMISSION' ? (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CloudUpload />}
                          onClick={() => handleOpenSubmit(asg)}
                          sx={{ fontSize: 10, textTransform: 'none', py: 0.2, bgcolor: COLORS.secondary }}
                        >
                          Submit Solution
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => toast.info(`Viewing submitted response for ${asg.id}`)}
                          sx={{ fontSize: 10, textTransform: 'none', py: 0.2 }}
                        >
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upload Solution Dialog */}
      <Dialog open={submitModalOpen} onClose={() => setSubmitModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Submit Assignment — {selectedAsg?.title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ fontSize: 12 }}>
              Course: <strong>{selectedAsg?.course}</strong> • Maximum Marks: <strong>{selectedAsg?.maxMarks} Marks</strong> • Due Date: <strong>{selectedAsg?.due}</strong>
            </Alert>

            <Paper
              sx={{
                p: 3.5,
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                bgcolor: '#f8fafc',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: COLORS.secondary }
              }}
              onClick={() => setSubmissionFile({ name: `${user?.username || '21CS001'}_${selectedAsg?.id || 'Assignment'}_Solution.pdf`, size: '2.4 MB' })}
            >
              <CloudUpload sx={{ fontSize: 40, color: COLORS.secondary, mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {submissionFile ? `Attached: ${submissionFile.name}` : 'Click to Upload Solution File (PDF, ZIP, DOCX)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Upload up to 25MB. Ensure source code files are bundled inside ZIP.
              </Typography>
            </Paper>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Student Remarks / GitHub Repository URL"
              placeholder="e.g. Solution includes all POSIX mutex and semaphore test cases with output screenshots: https://github.com/student/os-lab"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadSubmission} sx={{ bgcolor: COLORS.secondary, fontWeight: 700 }}>
            Confirm & Turn In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
