import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, LinearProgress, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  Assignment, Add, Download, CheckCircle, Schedule, CloudUpload,
  Visibility, Edit, Delete, Grade, FactCheck, AttachFile
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';
import { broadcastDataChange, DATA_SYNC_EVENTS } from '../../services/dataSync';

export default function AssignmentsPage() {
  const [open, setOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedAsg, setSelectedAsg] = useState(null);

  const [form, setForm] = useState({
    title: '',
    course: 'CS401',
    unit: 'Unit 2: Concurrency & Synchronization',
    maxMarks: '20',
    dueDate: '2024-03-20',
    dueTime: '23:59',
    description: '',
    co: 'CO2'
  });

  const [assignments, setAssignments] = useState([
    { id: 'ASG-CS401-01', title: 'Implementation of Classical Synchronization Primitives in C/POSIX', course: 'CS401 (OS)', unit: 'Unit 2', maxMarks: 20, due: '15 Feb 2024', submitted: '62 / 64', graded: '62 / 64', status: 'EVALUATED' },
    { id: 'ASG-CS401-02', title: 'Virtual Memory Page Replacement Simulation & Benchmarking', course: 'CS401 (OS)', unit: 'Unit 3', maxMarks: 20, due: '05 Mar 2024', submitted: '58 / 64', graded: '42 / 58', status: 'IN EVALUATION' },
    { id: 'ASG-CS403-01', title: 'A* Search Algorithm and Alpha-Beta Pruning Implementation', course: 'CS403 (AI)', unit: 'Unit 1', maxMarks: 25, due: '18 Mar 2024', submitted: '24 / 62', graded: '0 / 24', status: 'ACTIVE SUBMISSIONS' },
  ]);

  const handleCreateAssignment = () => {
    if (!form.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }
    const newEntry = {
      id: `ASG-${form.course}-0${assignments.length + 1}`,
      title: form.title,
      course: `${form.course} (Core)`,
      unit: form.unit,
      maxMarks: parseInt(form.maxMarks, 10),
      due: form.dueDate,
      submitted: '0 / 64',
      graded: '0 / 0',
      status: 'ACTIVE SUBMISSIONS'
    };
    const updatedList = [newEntry, ...assignments];
    setAssignments(updatedList);
    localStorage.setItem('campusiq_assignments_data', JSON.stringify(updatedList));
    broadcastDataChange(DATA_SYNC_EVENTS.ASSIGNMENT_CREATED, { assignment: newEntry, allAssignments: updatedList });

    toast.success(`Assignment "${form.title}" published and synchronized to Student Gradebook & Portals!`);
    setOpen(false);
    setForm({ title: '', course: 'CS401', unit: 'Unit 2: Concurrency & Synchronization', maxMarks: '20', dueDate: '2024-03-20', dueTime: '23:59', description: '', co: 'CO2' });
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Assignments & Homework Portal"
        subtitle="Create course assignments, set rubric weightages, evaluate student submissions, and release marks"
        breadcrumbs={['Home', 'Academic Management', 'Assignment', 'Create Assignment']}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => toast.success('Exporting Master Assignment Evaluation Sheet (.XLSX)')}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Export Marks Sheet
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
            >
              Create Assignment
            </Button>
          </Stack>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Course Assignments', val: `${assignments.length} Tasks`, sub: 'Even Semester 2023-24', color: '#2563eb' },
          { label: 'Total Submissions Received', val: '144 Submissions', sub: '92% Submission Rate', color: '#16a34a' },
          { label: 'Pending Evaluations', val: '16 Papers', sub: 'Action Required', color: COLORS.secondary },
          { label: 'Average Class Score', val: '17.4 / 20', sub: 'Grade: A (87%)', color: '#059669' },
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

      {/* Assignments Ledger */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle1" fontWeight={700}>Active & Evaluated Course Assignments</Typography>
            <Chip label="Section A & B Combined" size="small" color="primary" sx={{ fontWeight: 600 }} />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Assignment ID', 'Assignment Title & Syllabus Unit', 'Course', 'Max Marks', 'Due Date', 'Submitted', 'Graded', 'Status', 'Actions'].map(h => (
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
                    <TableCell sx={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{asg.due}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{asg.submitted}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{asg.graded}</TableCell>
                    <TableCell>
                      <Chip
                        label={asg.status}
                        size="small"
                        sx={{
                          bgcolor: asg.status === 'EVALUATED' ? '#dcfce7' : asg.status === 'IN EVALUATION' ? '#fef3c7' : '#eff6ff',
                          color: asg.status === 'EVALUATED' ? '#166534' : asg.status === 'IN EVALUATION' ? '#92400e' : '#1d4ed8',
                          fontWeight: 700,
                          fontSize: 10
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => { setSelectedAsg(asg); setGradeModalOpen(true); }}
                          sx={{ fontSize: 10, textTransform: 'none', py: 0.2, bgcolor: COLORS.secondary }}
                        >
                          Evaluate ({asg.submitted.split('/')[0].trim()})
                        </Button>
                        <IconButton size="small" onClick={() => toast.success(`Downloading all submission files for ${asg.id} (.ZIP)`)}>
                          <Download fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Assignment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Course Assignment</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                  <MenuItem value="CS401">CS401: Operating Systems</MenuItem>
                  <MenuItem value="CS403">CS403: Artificial Intelligence</MenuItem>
                  <MenuItem value="CS407">CS407: Computer Networks</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Maximum Marks" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Assignment Title"
              placeholder="e.g. Synchronization Primitives in C/POSIX"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Syllabus Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <MenuItem value="Unit 1: Process Management">Unit 1: Process Management</MenuItem>
                  <MenuItem value="Unit 2: Concurrency & Synchronization">Unit 2: Concurrency & Synchronization</MenuItem>
                  <MenuItem value="Unit 3: Memory Management">Unit 3: Memory Management</MenuItem>
                  <MenuItem value="Unit 4: File Systems">Unit 4: File Systems</MenuItem>
                  <MenuItem value="Unit 5: Distributed Systems">Unit 5: Distributed Systems</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Course Outcome (CO)" value={form.co} onChange={e => setForm({ ...form, co: e.target.value })}>
                  <MenuItem value="CO1">CO1: Process Scheduling</MenuItem>
                  <MenuItem value="CO2">CO2: Concurrency Design</MenuItem>
                  <MenuItem value="CO3">CO3: Virtual Memory</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" type="date" label="Due Date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" type="time" label="Due Time" value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detailed Assignment Questions / Problem Statement"
              placeholder="Provide explicit problem instructions, constraints, and submission guidelines..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAssignment} sx={{ bgcolor: COLORS.secondary, fontWeight: 700 }}>
            Publish Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Evaluate Submissions Dialog */}
      <Dialog open={gradeModalOpen} onClose={() => setGradeModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Evaluate Submissions — {selectedAsg?.title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Course: <strong>{selectedAsg?.course}</strong> • Maximum Marks: <strong>{selectedAsg?.maxMarks} Marks</strong>
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Roll Number', 'Student Name', 'Submitted File', 'Submission Time', 'Marks Awarded', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { roll: '21CS001', name: 'Aarav Patel', file: '21CS001_OS_Assign2.pdf', time: '14 Feb 10:30 PM', score: '19 / 20' },
                  { roll: '21CS014', name: 'Bhavna Sharma', file: '21CS014_OS_Assign2.pdf', time: '15 Feb 08:15 PM', score: '18 / 20' },
                  { roll: '21CS028', name: 'Chirag Rao', file: '21CS028_OS_Assign2.pdf', time: '15 Feb 11:20 PM', score: '17 / 20' },
                ].map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{s.roll}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                    <TableCell>
                      <Button size="small" variant="text" startIcon={<AttachFile />} onClick={() => toast.success(`Viewing ${s.file}`)} sx={{ fontSize: 11, textTransform: 'none' }}>
                        {s.file}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{s.time}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#16a34a', fontSize: 12 }}>{s.score}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => toast.success(`Score for ${s.name} saved`)} sx={{ fontSize: 10, textTransform: 'none', py: 0.1 }}>
                        Update Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGradeModalOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => { toast.success('All graded assignment scores published to student gradebook!'); setGradeModalOpen(false); }} sx={{ bgcolor: COLORS.secondary }}>
            Publish All Marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
