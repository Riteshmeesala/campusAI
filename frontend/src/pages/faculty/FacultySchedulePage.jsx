import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip,
  IconButton, CircularProgress, Alert, Tooltip, InputAdornment, Divider
} from '@mui/material';
import {
  Add, Delete, CalendarMonth, School, AccessTime, Book,
  Class, Search, ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { scheduleAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS } from '../../theme/theme';
import { anim } from '../../theme/animations';

const METHODS = ['Lecture', 'Tutorial', 'Lab', 'Seminar', 'Workshop', 'Online Class'];
const PERIODS = ['1st Period', '2nd Period', '3rd Period', '4th Period', '5th Period', '6th Period', '7th Period'];

export default function FacultySchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [searchTopic, setSearchTopic] = useState('');

  const [form, setForm] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    topicCovered: '',
    subTopics: '',
    chapterNumber: '',
    durationHours: 1.0,
    teachingMethod: 'Lecture',
    classPeriod: '1st Period',
    remarks: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sch, crs] = await Promise.allSettled([
        scheduleAPI.getMySchedules(),
        courseAPI.getAll()
      ]);
      if (sch.status === 'fulfilled') setSchedules(sch.value.data.data || []);
      if (crs.status === 'fulfilled') {
        const cList = crs.value.data.data || [];
        setCourses(cList);
        if (cList.length > 0 && !form.courseId) {
          setForm(prev => ({ ...prev, courseId: cList[0].id }));
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = async () => {
    const res = await scheduleAPI.getMySchedules();
    setSchedules(res.data.data || []);
  };

  const handleSave = async () => {
    if (!form.courseId || !form.topicCovered || !form.date) {
      setError('Course, Date, and Topic covered are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await scheduleAPI.addSchedule(form);
      setSuccess('Class topic logged successfully!');
      setOpen(false);
      await refresh();
      setForm({
        courseId: courses[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        topicCovered: '',
        subTopics: '',
        chapterNumber: '',
        durationHours: 1.0,
        teachingMethod: 'Lecture',
        classPeriod: '1st Period',
        remarks: ''
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule topic log?')) return;
    try {
      await scheduleAPI.deleteSchedule(id);
      setSuccess('Log removed');
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete entry');
    }
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter(s => {
    const matchesCourse = filterCourse === 'ALL' || (s.course && String(s.course.id) === String(filterCourse));
    const matchesSearch =
      (s.topicCovered || '').toLowerCase().includes(searchTopic.toLowerCase()) ||
      (s.subTopics || '').toLowerCase().includes(searchTopic.toLowerCase()) ||
      (s.course?.courseCode || '').toLowerCase().includes(searchTopic.toLowerCase()) ||
      (s.scheduleDate || '').includes(searchTopic);
    return matchesCourse && matchesSearch;
  });

  const totalHoursTaught = schedules.reduce((sum, s) => sum + (s.durationHours || 1), 0);

  // Group by date
  const byDate = {};
  filteredSchedules.forEach(s => {
    const d = s.scheduleDate || 'Unknown';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(s);
  });

  const sortedDates = Object.keys(byDate).sort().reverse();

  return (
    <Box>
      <PageHeader
        title="Curriculum & Topic Tracking"
        subtitle="Log daily class topics, chapters covered, practical sessions, and teaching hours"
        breadcrumbs={['Home', 'Faculty', 'Topic Log']}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              background: COLORS.gradBlue,
              borderRadius: 3,
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            Log Class Topic
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Top Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {[
          { icon: <Book />, label: 'Topics Logged', value: schedules.length, color: COLORS.primary },
          { icon: <AccessTime />, label: 'Teaching Hours Logged', value: `${totalHoursTaught.toFixed(1)} hrs`, color: COLORS.secondary },
          { icon: <School />, label: 'Subjects Covered', value: new Set(schedules.map(s => s.course?.id)).size, color: COLORS.excellent },
          { icon: <Class />, label: 'Practical Labs', value: schedules.filter(s => (s.teachingMethod || '').toLowerCase().includes('lab')).length, color: COLORS.accent },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...stat} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, ...anim.fadeInUp(0.1) }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by topic, chapter, subtopics, or date (YYYY-MM-DD)..."
                value={searchTopic}
                onChange={e => setSearchTopic(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Filter by Subject"
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
              >
                <MenuItem value="ALL">All Subjects</MenuItem>
                {courses.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.courseCode} — {c.courseName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Topic Logs Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} sx={{ color: COLORS.primary }} />
        </Box>
      ) : sortedDates.length === 0 ? (
        <Card sx={{ borderRadius: 3.5, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CalendarMonth sx={{ fontSize: 64, color: COLORS.textMuted, opacity: 0.4, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="textSecondary" gutterBottom>
              No Topic Logs Found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTopic || filterCourse !== 'ALL' ? 'No matching logs for this filter.' : 'Start logging your classroom lectures & practical topics!'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ background: COLORS.gradBlue, borderRadius: 2.5 }}
            >
              Log First Topic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sortedDates.map((date, dIdx) => (
            <Card key={date} sx={{ borderRadius: 3.5, ...anim.fadeInUp(0.1 + (dIdx % 5) * 0.05) }}>
              <Box
                sx={{
                  p: 2,
                  px: 2.5,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarMonth sx={{ color: COLORS.secondary, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: COLORS.textPrimary }}>
                    {date}
                  </Typography>
                  <Chip
                    label={`${byDate[date].length} Sessions`}
                    size="small"
                    sx={{ bgcolor: `${COLORS.secondary}15`, color: COLORS.secondary, fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
                  onClick={() => navigate('/student/attendance')}
                  sx={{ textTransform: 'none', color: COLORS.primary, fontSize: '0.78rem' }}
                >
                  Verify Attendance
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                    <TableRow>
                      {['Period', 'Subject', 'Topic & Subtopics Covered', 'Chapter', 'Duration', 'Method', 'Remarks', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.8rem', color: COLORS.textSecondary, py: 1.5 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byDate[date].map(s => (
                      <TableRow key={s.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: COLORS.primary }}>
                          {s.classPeriod || '1st Period'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.course?.courseCode || 'GEN'}
                            size="small"
                            sx={{
                              bgcolor: `${COLORS.secondary}15`,
                              color: COLORS.secondary,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.textPrimary }}>
                            {s.topicCovered}
                          </Typography>
                          {s.subTopics && (
                            <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mt: 0.25 }}>
                              🔖 {s.subTopics}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                          {s.chapterNumber ? `Ch. ${s.chapterNumber}` : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {s.durationHours || 1.0} hr
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.teachingMethod || 'Lecture'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: COLORS.textMuted, maxWidth: 180 }}>
                          {s.remarks || '—'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Delete entry">
                            <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: '#ef4444' }}>
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </Box>
      )}

      {/* Log Topic Dialog */}
      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
          📖 Log Class Topic Covered
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
            Record the topic taught, duration, chapter number, and pedagogical method.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Subject / Course *"
                value={form.courseId}
                onChange={e => setForm({ ...form, courseId: e.target.value })}
                disabled={saving}
              >
                {courses.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.courseCode} — {c.courseName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date *"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Topic Covered *"
                placeholder="e.g. B-Trees and Multiway Search Trees"
                value={form.topicCovered}
                onChange={e => setForm({ ...form, topicCovered: e.target.value })}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtopics / Key Concepts"
                placeholder="e.g. Node splitting, balanced insertions, deletion edge cases"
                value={form.subTopics}
                onChange={e => setForm({ ...form, subTopics: e.target.value })}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Chapter / Unit"
                placeholder="e.g. 4.2"
                value={form.chapterNumber}
                onChange={e => setForm({ ...form, chapterNumber: e.target.value })}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Duration (Hours)"
                value={form.durationHours}
                onChange={e => setForm({ ...form, durationHours: parseFloat(e.target.value) || 1.0 })}
                inputProps={{ step: 0.5, min: 0.5, max: 8 }}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Period"
                value={form.classPeriod}
                onChange={e => setForm({ ...form, classPeriod: e.target.value })}
                disabled={saving}
              >
                {PERIODS.map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Teaching Method"
                value={form.teachingMethod}
                onChange={e => setForm({ ...form, teachingMethod: e.target.value })}
                disabled={saving}
              >
                {METHODS.map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks / Homework"
                placeholder="e.g. Assignment 2 given due next Monday"
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                disabled={saving}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={saving} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ background: COLORS.gradBlue, borderRadius: 2.5, px: 3 }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Log Topic'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
