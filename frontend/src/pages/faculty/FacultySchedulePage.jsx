import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip,
  IconButton, CircularProgress, Alert
} from '@mui/material';
import { Add, Delete, CalendarMonth } from '@mui/icons-material';
import { scheduleAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';

const METHODS = ['Lecture', 'Tutorial', 'Lab', 'Seminar', 'Workshop', 'Online'];
const PERIODS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export default function FacultySchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [form, setForm] = useState({
    courseId: '', date: new Date().toISOString().split('T')[0],
    topicCovered: '', subTopics: '', chapterNumber: '',
    durationHours: 1.0, teachingMethod: 'Lecture', classPeriod: '1st', remarks: ''
  });

  useEffect(() => {
    Promise.allSettled([scheduleAPI.getMySchedules(), courseAPI.getAll()])
      .then(([sch, crs]) => {
        if (sch.status === 'fulfilled') setSchedules(sch.value.data.data || []);
        if (crs.status === 'fulfilled') setCourses(crs.value.data.data || []);
        setLoading(false);
      });
  }, []);

  const refresh = () => scheduleAPI.getMySchedules().then(r => setSchedules(r.data.data || []));

  const handleSave = async () => {
    if (!form.courseId || !form.topicCovered || !form.date) {
      setError('Course, Date, and Topic are required.'); return;
    }
    setSaving(true); setError('');
    try {
      await scheduleAPI.addSchedule(form);
      setSuccess('Schedule added successfully!');
      setOpen(false);
      await refresh();
      setForm({ courseId:'', date: new Date().toISOString().split('T')[0], topicCovered:'',
                subTopics:'', chapterNumber:'', durationHours:1.0, teachingMethod:'Lecture',
                classPeriod:'1st', remarks:'' });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save schedule');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    await scheduleAPI.deleteSchedule(id);
    await refresh();
  };

  // Group by date
  const byDate = {};
  schedules.forEach(s => {
    const d = s.scheduleDate || 'Unknown';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(s);
  });

  return (
    <Box>
      <PageHeader
        title="Teaching Schedule"
        subtitle="Log daily class topics, chapters covered, and teaching methods"
        breadcrumbs={['Home', 'Faculty', 'Schedule']}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}
            sx={{ bgcolor: COLORS.secondary }}>
            Add Today's Class
          </Button>
        }
      />

      {error   && <Alert severity="error"   sx={{ mb:2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb:2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? <CircularProgress /> : (
        schedules.length === 0 ? (
          <Card><CardContent sx={{ textAlign:'center', py:6 }}>
            <CalendarMonth sx={{ fontSize:60, color: COLORS.textMuted, mb:2 }} />
            <Typography variant="h6" color="textSecondary">No schedule entries yet</Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>Add your first class topic to get started</Typography>
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: COLORS.secondary }}>Add Schedule</Button>
          </CardContent></Card>
        ) : (
          Object.entries(byDate).sort((a,b) => b[0].localeCompare(a[0])).map(([date, entries]) => (
            <Card key={date} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color={COLORS.primary} mb={1.5}>
                  📅 {date}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                        {['Course', 'Period', 'Topic', 'Sub-topics', 'Chapter', 'Method', 'Duration', ''].map(h => (
                          <TableCell key={h} sx={{ fontWeight:700, fontSize:11 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((e, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize:11 }}>
                            <Chip label={e.course?.courseCode} size="small" sx={{ bgcolor: COLORS.bgBase }} />
                          </TableCell>
                          <TableCell sx={{ fontSize:11 }}>{e.classPeriod || '-'}</TableCell>
                          <TableCell sx={{ fontSize:12, fontWeight:600 }}>{e.topicCovered}</TableCell>
                          <TableCell sx={{ fontSize:11 }}>{e.subTopics || '-'}</TableCell>
                          <TableCell sx={{ fontSize:11 }}>{e.chapterNumber || '-'}</TableCell>
                          <TableCell sx={{ fontSize:11 }}>
                            <Chip label={e.teachingMethod || 'Lecture'} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell sx={{ fontSize:11 }}>{e.durationHours}h</TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))
        )
      )}

      {/* Add Schedule Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Class Schedule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Course" size="small"
                value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date" type="date" size="small"
                value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Topic Covered *" size="small"
                value={form.topicCovered} onChange={e => setForm(p => ({ ...p, topicCovered: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Sub-topics / Details" size="small" multiline rows={2}
                value={form.subTopics} onChange={e => setForm(p => ({ ...p, subTopics: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Chapter No." size="small"
                value={form.chapterNumber} onChange={e => setForm(p => ({ ...p, chapterNumber: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Teaching Method" size="small"
                value={form.teachingMethod} onChange={e => setForm(p => ({ ...p, teachingMethod: e.target.value }))}>
                {METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Period" size="small"
                value={form.classPeriod} onChange={e => setForm(p => ({ ...p, classPeriod: e.target.value }))}>
                {PERIODS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Duration (hours)" type="number" size="small"
                value={form.durationHours} inputProps={{ step: 0.5, min: 0.5 }}
                onChange={e => setForm(p => ({ ...p, durationHours: parseFloat(e.target.value) }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Remarks (optional)" size="small"
                value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: COLORS.secondary }}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
