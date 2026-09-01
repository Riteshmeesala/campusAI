import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import {
  Assignment, Add, CheckCircle, Schedule, Send,
  Visibility, Delete, Download
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function AssignTaskPage() {
  const [open, setOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'CS401', deadline: '', type: 'Coding Task', targetSection: 'Section A & B' });

  const handleAssign = () => {
    toast.success(`Task "${taskForm.title || 'Practical Assignment'}" assigned to ${taskForm.targetSection}.`);
    setOpen(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Assign Daily Tasks & Lab Problem Statements"
        subtitle="Create, allocate and track student daily homework, laboratory programming tasks, and mini-assignments"
        breadcrumbs={['Home', 'Faculty', 'Assign Task']}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
          >
            Assign New Task
          </Button>
        }
      />

      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Active Student Tasks & Practice Statements
            </Typography>
            <Chip label="4 Active Tasks" color="primary" size="small" sx={{ fontWeight: 700 }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Task Title', 'Subject', 'Target Class', 'Assigned Date', 'Deadline', 'Submissions', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { title: 'Task 04: Implement Producer-Consumer Solution using POSIX Semaphores', sub: 'CS401', target: 'Section A', date: '25 Feb 2024', due: '02 Mar 2024', subs: '58 / 64 Submitted', status: 'ACTIVE' },
                  { title: 'Task 03: PyTorch Custom Dataset Loader & CNN Image Classifier', sub: 'CS403', target: 'Section B', date: '20 Feb 2024', due: '28 Feb 2024', subs: '62 / 62 Submitted', status: 'GRADED' },
                  { title: 'Task 05: React Context API State Management with JWT Auth Flow', sub: 'CS405', target: 'Batch 1 & 2', date: '18 Feb 2024', due: '26 Feb 2024', subs: '59 / 60 Submitted', status: 'GRADED' },
                  { title: 'Task 06: Deadlock Bankers Algorithm Implementation in C++', sub: 'CS401', target: 'Section A', date: '28 Feb 2024', due: '05 Mar 2024', subs: '24 / 64 Submitted', status: 'ACTIVE' },
                ].map((t, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0f172a">{t.title}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: 12 }}>{t.sub}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{t.target}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{t.date}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>{t.due}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{t.subs}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        sx={{
                          bgcolor: t.status === 'ACTIVE' ? '#eff6ff' : '#dcfce7',
                          color: t.status === 'ACTIVE' ? '#1d4ed8' : '#166534',
                          fontWeight: 700,
                          fontSize: 10
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ fontSize: 11, textTransform: 'none', py: 0.2 }} onClick={() => toast.info(`Reviewing submissions for ${t.title}`)}>
                        Review Submissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Student Task</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Task Title / Problem Statement" placeholder="e.g. Memory Page Replacement Simulation in C" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
            <TextField select fullWidth label="Subject" value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })}>
              <MenuItem value="CS401">CS401: Operating Systems & Architecture</MenuItem>
              <MenuItem value="CS403">CS403: Artificial Intelligence & Neural Networks</MenuItem>
              <MenuItem value="CS405">CS405: Full Stack Web Applications Lab</MenuItem>
            </TextField>
            <TextField select fullWidth label="Target Section" value={taskForm.targetSection} onChange={e => setTaskForm({ ...taskForm, targetSection: e.target.value })}>
              <MenuItem value="Section A">Section A (64 Students)</MenuItem>
              <MenuItem value="Section B">Section B (62 Students)</MenuItem>
              <MenuItem value="Section A & B">Section A & B (All 126 Students)</MenuItem>
            </TextField>
            <TextField fullWidth label="Submission Deadline" placeholder="YYYY-MM-DD" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="Instructions, Test Cases & Submission Format" placeholder="Write code in C++ / Java and attach GitHub repository link or source code zip." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Publish & Broadcast Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
