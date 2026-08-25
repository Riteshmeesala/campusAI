import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, LinearProgress, ToggleButton,
  ToggleButtonGroup, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, Avatar
} from '@mui/material';
import {
  CalendarMonth, CheckCircle, Cancel, Warning, Refresh,
  HowToReg, Close, Visibility, Search, FilterAlt, Schedule,
  School, Group, Room, AccessTime
} from '@mui/icons-material';
import { attendanceAPI, courseAPI, userAPI, timetableAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS, getAttColor } from '../../theme/theme';
import { anim, shimmerBg } from '../../theme/animations';
import { toast } from 'react-toastify';

// ── Build per-course attendance summary ──────────────────────────────────────
function buildSummary(records) {
  if (!records.length) return null;
  const byCourse = {};
  records.forEach(r => {
    const cid  = r.course?.id || 'UNK';
    const code = r.course?.courseCode || 'UNK';
    const name = r.course?.courseName || code;
    if (!byCourse[cid]) byCourse[cid] = { subjectCode: code, subjectName: name, present: 0, total: 0 };
    byCourse[cid].total++;
    if (r.status === 'PRESENT' || r.status === 'LATE') byCourse[cid].present++;
  });
  const subjects = Object.values(byCourse).map(s => ({
    ...s,
    percentage: s.total > 0 ? (s.present / s.total) * 100 : 0,
    classesNeededFor75: Math.max(0, Math.ceil((0.75 * s.total - s.present) / 0.25)),
  }));
  const tp = subjects.reduce((s, x) => s + x.present, 0);
  const tt = subjects.reduce((s, x) => s + x.total,   0);
  return {
    overallPercentage: tt > 0 ? (tp / tt) * 100 : 0,
    totalPresent: tp, totalClasses: tt,
    subjectBreakdown: subjects,
  };
}

// ── View Attendance History Dialog ───────────────────────────────────────────
function AttendanceHistoryDialog({ open, onClose, courseId, date }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !courseId || !date) return;
    setLoading(true);
    attendanceAPI.getByDateAndCourse(courseId, date)
      .then(r => setRecords(r.data?.data || []))
      .catch(() => toast.error('Could not load attendance history'))
      .finally(() => setLoading(false));
  }, [open, courseId, date]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Attendance — {date}
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress /></Box>
        ) : records.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>No records for this date.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Enrollment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.student?.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.student?.enrollmentNumber}</TableCell>
                  <TableCell>
                    <Chip label={r.status} size="small"
                      sx={{
                        bgcolor: r.status === 'PRESENT' ? '#dcfce7' : r.status === 'LATE' ? '#fef9c3' : '#fee2e2',
                        color:   r.status === 'PRESENT' ? '#15803d' : r.status === 'LATE' ? '#92400e' : '#dc2626',
                        fontWeight: 700, fontSize: 11,
                      }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Faculty / Admin: Mark Attendance Panel ───────────────────────────────────
const ALL_DEPTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical Engineering', 'Civil Engineering', 'Mathematics',
  'Physics', 'Humanities', 'General'
];

const ALL_SECTIONS = ['Section A', 'Section B', 'Section C', 'Batch 1', 'Batch 2'];
const ALL_SEMS = [1, 2, 3, 4, 5, 6, 7, 8];

function FacultyMarkPanel({ currentUserId, isAdmin }) {
  const { user } = useAuth();
  const [courses,        setCourses]        = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [students,       setStudents]       = useState([]);
  const [courseId,       setCourseId]       = useState('');
  const [date,           setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter,     setDeptFilter]     = useState('ALL');
  const [sectionFilter,  setSectionFilter]  = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [studentSearch,  setStudentSearch]  = useState('');
  const [statuses,       setStatuses]       = useState({});
  const [saving,         setSaving]         = useState(false);
  const [loadingStu,     setLoadingStu]     = useState(false);
  const [histOpen,       setHistOpen]       = useState(false);

  // Load courses and timetable slots
  useEffect(() => {
    const fetchCourses = isAdmin ? courseAPI.getAll() : courseAPI.getMyCourses();
    Promise.allSettled([
      fetchCourses,
      timetableAPI.getMy(),
    ]).then(([crsRes, ttRes]) => {
      if (crsRes.status === 'fulfilled') {
        const list = crsRes.value.data?.data || [];
        setCourses(list);
        if (list.length === 1) {
          setCourseId(String(list[0].id));
          if (list[0].department) setDeptFilter(list[0].department);
        }
      }
      if (ttRes.status === 'fulfilled') {
        setTimetableSlots(ttRes.value.data?.data || []);
      }
    });
  }, [isAdmin]);

  // When course changes, auto-detect target department
  const handleCourseChange = (newCid) => {
    setCourseId(newCid);
    const c = courses.find(item => String(item.id) === String(newCid));
    if (c && c.department) {
      setDeptFilter(c.department);
    }
  };

  // Quick fill from timetable slot
  const handleTimetableSlotSelect = (slotId) => {
    if (!slotId) return;
    const slot = timetableSlots.find(s => String(s.id) === String(slotId));
    if (slot) {
      if (slot.course?.id) setCourseId(String(slot.course.id));
      if (slot.course?.department) setDeptFilter(slot.course.department);
      if (slot.sectionName) {
        // match section
        const matchedSec = ALL_SECTIONS.find(s => s.toLowerCase() === slot.sectionName.toLowerCase());
        setSectionFilter(matchedSec || slot.sectionName);
      }
      toast.info(`⚡ Applied Timetable Slot: ${slot.course?.courseCode} (${slot.sectionName || 'Class'})`);
    }
  };

  // Fetch students with active filters
  const loadStudents = useCallback(() => {
    if (!courseId) { setStudents([]); setStatuses({}); return; }
    setLoadingStu(true);
    const params = {};
    if (deptFilter && deptFilter !== 'ALL') params.department = deptFilter;
    if (semesterFilter && semesterFilter !== 'ALL') params.semester = semesterFilter;
    if (sectionFilter && sectionFilter !== 'ALL') params.section = sectionFilter;

    userAPI.getStudents(params)
      .then(r => {
        const list = r.data?.data || [];
        setStudents(list);
        const init = {};
        list.forEach(s => { init[s.id] = 'PRESENT'; });
        setStatuses(init);
      })
      .catch(() => toast.error('Could not load students for selected section'))
      .finally(() => setLoadingStu(false));
  }, [courseId, deptFilter, semesterFilter, sectionFilter]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Also load existing attendance for this course+date when both are set
  useEffect(() => {
    if (!courseId || !date) return;
    attendanceAPI.getByDateAndCourse(courseId, date)
      .then(r => {
        const existing = r.data?.data || [];
        if (existing.length > 0) {
          const map = {};
          existing.forEach(a => { if (a.student?.id) map[a.student.id] = a.status; });
          setStatuses(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {}); // Silent
  }, [courseId, date]);

  const selectedCourse = courses.find(c => String(c.id) === String(courseId));

  const handleStatus = (studentId, value) => {
    if (!value) return;
    setStatuses(p => ({ ...p, [studentId]: value }));
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setStatuses(all);
  };

  const handleSubmit = async () => {
    if (!courseId) { toast.warning('Please select a course first'); return; }
    if (!students.length) { toast.warning('No students in this section / department'); return; }
    setSaving(true);
    try {
      const records = {};
      Object.entries(statuses).forEach(([id, status]) => { records[Number(id)] = status; });
      const res = await attendanceAPI.markAttendance({
        courseId: Number(courseId),
        attendanceDate: date,
        records,
      });
      toast.success(`✅ Attendance saved for ${res.data?.data?.length || students.length} students!`);
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save attendance';
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Filter students by live search query
  const displayedStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.enrollmentNumber || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  const presentCount = Object.values(statuses).filter(v => v === 'PRESENT' || v === 'LATE').length;
  const absentCount  = Object.values(statuses).filter(v => v === 'ABSENT').length;
  const isCrossDept  = selectedCourse && user?.department && selectedCourse.department && selectedCourse.department !== user.department;

  return (
    <>
      <Card elevation={0} sx={{ mb: 3, border: `1px solid ${COLORS.border}`, borderRadius: 0.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 0.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <HowToReg sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.textPrimary, fontSize: '0.95rem' }}>
                  Roll Call & Section Attendance Console
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Record session attendance across departments, assigned cohorts, and class sections
                </Typography>
              </Box>
            </Box>
            {courseId && (
              <Tooltip title="View historical registry for this date">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility sx={{ fontSize: 16 }} />}
                  onClick={() => setHistOpen(true)}
                  sx={{ borderRadius: 0.5, fontSize: '0.75rem', borderColor: COLORS.borderDark }}
                >
                  Registry Log
                </Button>
              </Tooltip>
            )}
          </Box>

          {/* Department & Faculty Department Scope Badges */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<School sx={{ fontSize: '13px !important', color: COLORS.textSecond }} />}
              label={`Faculty Parent Dept: ${user?.department || 'Academic Affairs'}`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: COLORS.textSecond, fontWeight: 600, fontSize: '0.72rem', border: `1px solid ${COLORS.border}` }}
            />
            {selectedCourse && (
              <Chip
                icon={<Group sx={{ fontSize: '13px !important', color: isCrossDept ? '#b45309' : '#047857' }} />}
                label={isCrossDept ? `Cross-Departmental: Teaching to ${selectedCourse.department}` : `Target Branch: ${selectedCourse.department || 'Same Dept'}`}
                size="small"
                sx={{
                  bgcolor: isCrossDept ? '#fffbeb' : '#f0fdf4',
                  color: isCrossDept ? '#92400e' : '#166534',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  border: isCrossDept ? '1px solid #fde68a' : '1px solid #bbf7d0',
                }}
              />
            )}
          </Box>

          {/* Primary Controls Row: Course, Date, Timetable Preset */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {/* Quick Fill from Timetable */}
            {timetableSlots.length > 0 && (
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Preset: Scheduled Class Slot"
                  defaultValue=""
                  onChange={e => handleTimetableSlotSelect(e.target.value)}
                >
                  <MenuItem value="">— Select from Timetable —</MenuItem>
                  {timetableSlots.map(s => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.dayOfWeek?.slice(0,3)} • {s.periodName}: {s.course?.courseCode} ({s.sectionName || 'All'})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Course selector */}
            <Grid item xs={12} sm={timetableSlots.length > 0 ? 4 : 6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Course / Subject *"
                value={courseId}
                onChange={e => handleCourseChange(e.target.value)}
                helperText={courses.length === 0 ? 'No assigned courses found' : `${courses.length} courses loaded`}
              >
                <MenuItem value="">— Select Course —</MenuItem>
                {courses.map(c => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.courseCode} — {c.courseName} ({c.department})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Date picker */}
            <Grid item xs={12} sm={timetableSlots.length > 0 ? 4 : 6}>
              <TextField
                fullWidth
                size="small"
                label="Session Date *"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Secondary Filter Row: Department, Semester, Section, Search */}
          <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: '#f8fafc', borderRadius: 0.5, border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
              <FilterAlt sx={{ fontSize: 15, color: COLORS.textMuted }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: COLORS.textSecond, letterSpacing: '0.04em' }}>
                COHORT & SECTION FILTERS
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Departments</MenuItem>
                  {ALL_DEPTS.map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Section"
                  value={sectionFilter}
                  onChange={e => setSectionFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Sections</MenuItem>
                  {ALL_SECTIONS.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Semester"
                  value={semesterFilter}
                  onChange={e => setSemesterFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Semesters</MenuItem>
                  {ALL_SEMS.map(sem => (
                    <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter by name or roll number..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ fontSize: 16, color: COLORS.textMuted, mr: 0.75 }} />
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Student list & Actions */}
          {courseId && (
            <>
              {/* Status Action & Statistics Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Enrolled: ${displayedStudents.length}`}
                    size="small"
                    sx={{ bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, fontWeight: 600 }}
                  />
                  <Chip
                    label={`Present: ${presentCount}`}
                    size="small"
                    sx={{ bgcolor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Absent: ${absentCount}`}
                    size="small"
                    sx={{ bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => markAll('PRESENT')}
                    sx={{ fontSize: '0.75rem', borderRadius: 0.5, color: '#166534', borderColor: '#bbf7d0', textTransform: 'none', fontWeight: 600 }}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => markAll('ABSENT')}
                    sx={{ fontSize: '0.75rem', borderRadius: 0.5, color: '#991b1b', borderColor: '#fecaca', textTransform: 'none', fontWeight: 600 }}
                  >
                    Mark All Absent
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || !courseId || displayedStudents.length === 0}
                    sx={{
                      backgroundColor: COLORS.primary,
                      borderRadius: 0.5,
                      px: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Commit Attendance'}
                  </Button>
                </Box>
              </Box>

              {loadingStu ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                </Box>
              ) : displayedStudents.length === 0 ? (
                <Card sx={{ borderRadius: 0.5, textAlign: 'center', py: 5, bgcolor: '#f8fafc', border: `1px solid ${COLORS.border}` }}>
                  <Typography variant="body2" fontWeight={600} color="textSecondary">
                    No enrolled student records found matching the active cohort parameters.
                  </Typography>
                </Card>
              ) : (
                <TableContainer sx={{ maxHeight: 460, border: `1px solid ${COLORS.border}`, borderRadius: 0.5 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell width={50}>#</TableCell>
                        <TableCell>Student Name & Branch</TableCell>
                        <TableCell>Roll / Enrollment</TableCell>
                        <TableCell>Section & Term</TableCell>
                        <TableCell align="right" sx={{ minWidth: 240 }}>Attendance Record</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedStudents.map((s, i) => {
                        const status = statuses[s.id] || 'PRESENT';
                        return (
                          <TableRow
                            key={s.id}
                            hover
                            sx={{
                              bgcolor: status === 'ABSENT' ? '#fff7ed'
                                     : status === 'LATE'   ? '#fffbeb'
                                     : '#ffffff',
                            }}
                          >
                            <TableCell sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                              {i + 1}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#f1f5f9', color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                                  {s.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: '0.8125rem' }}>
                                    {s.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.7rem' }}>
                                    {s.department || 'General'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                              {s.enrollmentNumber || '—'}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Chip
                                  label={s.section || (sectionFilter !== 'ALL' ? sectionFilter : 'Sec A')}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                {s.semester && (
                                  <Chip
                                    label={`Sem ${s.semester}`}
                                    size="small"
                                    sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={status}
                                onChange={(_, v) => handleStatus(s.id, v)}
                              >
                                <ToggleButton
                                  value="PRESENT"
                                  sx={{
                                    fontSize: '0.72rem', px: 1.25, py: 0.3, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700, borderColor: '#bbf7d0' },
                                  }}
                                >
                                  Present
                                </ToggleButton>
                                <ToggleButton
                                  value="LATE"
                                  sx={{
                                    fontSize: '0.72rem', px: 1.25, py: 0.3, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#fffbeb', color: '#92400e', fontWeight: 700, borderColor: '#fde68a' },
                                  }}
                                >
                                  Late
                                </ToggleButton>
                                <ToggleButton
                                  value="ABSENT"
                                  sx={{
                                    fontSize: '0.72rem', px: 1.25, py: 0.3, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#fef2f2', color: '#991b1b', fontWeight: 700, borderColor: '#fecaca' },
                                  }}
                                >
                                  Absent
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AttendanceHistoryDialog
        open={histOpen}
        onClose={() => setHistOpen(false)}
        courseId={courseId}
        date={date}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AttendancePage() {
  const { user }        = useAuth();
  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN';
  const isAdmin          = user?.role === 'ADMIN';

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    attendanceAPI.getMyAttendance()
      .then(r => {
        const records = r.data?.data || [];
        setSummary(buildSummary(records));
      })
      .catch(err => {
        console.error('Attendance load error:', err.response?.status);
        toast.error('Failed to load attendance records');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const overall  = summary?.overallPercentage || 0;
  const attColor = getAttColor(overall);
  const subjects = summary?.subjectBreakdown || [];
  const critical = subjects.filter(s => s.percentage < 60);

  return (
    <Box>
      <PageHeader
        title="Attendance"
        subtitle={isFacultyOrAdmin
          ? 'Mark and manage student attendance'
          : 'Track your attendance across all courses'}
        breadcrumbs={['Home', 'Attendance']}
        action={
          <Button startIcon={<Refresh fontSize="small" />} onClick={load}
            variant="outlined" sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
        }
      />

      {/* Faculty / Admin: Mark section */}
      {isFacultyOrAdmin && (
        <FacultyMarkPanel currentUserId={user?.id} isAdmin={isAdmin} />
      )}

      {/* Student view */}
      {!isFacultyOrAdmin && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress size={40} />
            </Box>
          ) : !summary ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No attendance records yet. Records will appear once your faculty marks attendance.
            </Alert>
          ) : (
            <>
              {/* Stats */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <StatCard icon={<CalendarMonth />} label="Overall Attendance"
                    value={`${overall.toFixed(1)}%`} color={attColor} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <StatCard icon={<CheckCircle />} label="Present"
                    value={summary.totalPresent} color={COLORS.excellent} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <StatCard icon={<Cancel />} label="Absent"
                    value={summary.totalClasses - summary.totalPresent} color={COLORS.critical} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <StatCard icon={<Warning />} label="Total Classes"
                    value={summary.totalClasses} color={COLORS.secondary} />
                </Grid>
              </Grid>

              {overall < 75 && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  ⚠️ Your overall attendance is <strong>{overall.toFixed(1)}%</strong> — below the 75% minimum required to sit exams!
                </Alert>
              )}
              {critical.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {critical.length} course(s) critically low (&lt;60%). Attend every remaining class.
                </Alert>
              )}

              {/* Per-course table */}
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    📊 Course-wise Attendance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {subjects.length === 0 ? (
                    <Typography color="text.secondary">No courses found.</Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            {['Course', 'Present / Total', 'Attendance %', '75% Status', 'Action Needed'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subjects.map((s, i) => {
                            const color = getAttColor(s.percentage);
                            return (
                              <TableRow key={i} hover>
                                <TableCell>
                                  <Typography fontWeight={600} fontSize={13}>{s.subjectCode}</Typography>
                                  <Typography variant="caption" color="text.secondary">{s.subjectName}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight={700}>{s.present}</Typography>
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    &nbsp;/ {s.total}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress variant="determinate"
                                      value={Math.min(s.percentage, 100)}
                                      sx={{ width: 80, height: 8, borderRadius: 4,
                                        bgcolor: color + '20',
                                        '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                                    <Typography fontWeight={700} fontSize={13} color={color}>
                                      {s.percentage.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={s.percentage >= 75 ? '✅ Safe'
                                         : s.percentage >= 60 ? '⚠️ Warning'
                                         : '🔴 Critical'}
                                    size="small"
                                    sx={{
                                      bgcolor: s.percentage >= 75 ? '#dcfce7'
                                             : s.percentage >= 60 ? '#fef9c3' : '#fee2e2',
                                      color,
                                      fontWeight: 700, fontSize: 11,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {s.classesNeededFor75 > 0 ? (
                                    <Typography fontSize={12} color={COLORS.critical} fontWeight={600}>
                                      Attend {s.classesNeededFor75} more class(es)
                                    </Typography>
                                  ) : (
                                    <Typography fontSize={12} color={COLORS.excellent}>
                                      On track ✓
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Faculty / Admin: summary note */}
      {isFacultyOrAdmin && (
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, mt: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              💡 Select a <strong>course</strong> and <strong>date</strong> above to mark attendance.
              Existing records for that date will be pre-loaded automatically.
              To view a student's full attendance history, go to <strong>Students → View Profile</strong>.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}