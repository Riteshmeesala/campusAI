import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, LinearProgress, ToggleButton,
  ToggleButtonGroup, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  CalendarMonth, CheckCircle, Cancel, Warning, Refresh,
  HowToReg, Close, Visibility
} from '@mui/icons-material';
import { attendanceAPI, courseAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS, getAttColor } from '../../theme/theme';
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
      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Faculty / Admin: Mark Attendance Panel ───────────────────────────────────
function FacultyMarkPanel({ currentUserId, isAdmin }) {
  const [courses,    setCourses]    = useState([]);
  const [students,   setStudents]   = useState([]);
  const [courseId,   setCourseId]   = useState('');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [statuses,   setStatuses]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [loadingStu, setLoadingStu] = useState(false);
  const [histOpen,   setHistOpen]   = useState(false);

  // Load courses: faculty sees their own courses, admin sees all
  useEffect(() => {
    const fetch = isAdmin ? courseAPI.getAll() : courseAPI.getMyCourses();
    fetch
      .then(r => {
        const list = r.data?.data || [];
        setCourses(list);
        // Auto-select first course if only one
        if (list.length === 1) setCourseId(String(list[0].id));
      })
      .catch(() => {
        // Fallback: load all courses if /my fails
        courseAPI.getAll()
          .then(r => setCourses(r.data?.data || []))
          .catch(() => toast.error('Could not load courses'));
      });
  }, [isAdmin]);

  // Load students when course selected
  useEffect(() => {
    if (!courseId) { setStudents([]); setStatuses({}); return; }
    setLoadingStu(true);
    userAPI.getStudents()
      .then(r => {
        const list = r.data?.data || [];
        setStudents(list);
        const init = {};
        list.forEach(s => { init[s.id] = 'PRESENT'; });
        setStatuses(init);
      })
      .catch(() => toast.error('Could not load students'))
      .finally(() => setLoadingStu(false));
  }, [courseId]);

  // Also load existing attendance for this course+date when both are set
  useEffect(() => {
    if (!courseId || !date) return;
    attendanceAPI.getByDateAndCourse(courseId, date)
      .then(r => {
        const existing = r.data?.data || [];
        if (existing.length > 0) {
          const map = {};
          existing.forEach(a => { map[a.student?.id] = a.status; });
          setStatuses(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {}); // Silent — no existing records is fine
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
    if (!students.length) { toast.warning('No students found'); return; }
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

  const presentCount = Object.values(statuses).filter(v => v === 'PRESENT' || v === 'LATE').length;
  const absentCount  = Object.values(statuses).filter(v => v === 'ABSENT').length;

  return (
    <>
      <Card elevation={0} sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <HowToReg sx={{ color: COLORS.primary }} />
            <Typography variant="h6" fontWeight={700}>Mark Attendance</Typography>
            {courseId && (
              <Tooltip title="View today's attendance history">
                <IconButton size="small" onClick={() => setHistOpen(true)}
                  sx={{ ml: 'auto', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Course selector */}
            <Grid item xs={12} sm={5}>
              <TextField select fullWidth size="small" label="Select Course *"
                value={courseId} onChange={e => setCourseId(e.target.value)}
                helperText={courses.length === 0 ? 'No courses found — contact admin' : `${courses.length} course(s) available`}>
                <MenuItem value="">— Select Course —</MenuItem>
                {courses.map(c => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600} fontSize={13}>{c.courseCode}</Typography>
                      <Typography color="text.secondary" fontSize={12}>— {c.courseName}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Date picker */}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Date" type="date"
                value={date} onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Submit */}
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" onClick={handleSubmit}
                disabled={saving || !courseId || students.length === 0}
                sx={{ height: 40, borderRadius: 2, bgcolor: COLORS.primary }}>
                {saving
                  ? <CircularProgress size={18} color="inherit" />
                  : 'Save Attendance'}
              </Button>
            </Grid>
          </Grid>

          {/* Selected course info */}
          {selectedCourse && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
              📚 <strong>{selectedCourse.courseCode}</strong> — {selectedCourse.courseName}
              {selectedCourse.faculty && ` | Faculty: ${selectedCourse.faculty.name}`}
              {selectedCourse.creditHours && ` | ${selectedCourse.creditHours} credits`}
            </Alert>
          )}

          {/* Student list */}
          {courseId && (
            <>
              {/* Quick action bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Chip label={`✅ Present: ${presentCount}`} size="small"
                  sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />
                <Chip label={`❌ Absent: ${absentCount}`} size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => markAll('PRESENT')}
                    sx={{ fontSize: 11, borderRadius: 2, color: '#15803d', borderColor: '#15803d' }}>
                    Mark All Present
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => markAll('ABSENT')}
                    sx={{ fontSize: 11, borderRadius: 2, color: '#dc2626', borderColor: '#dc2626' }}>
                    Mark All Absent
                  </Button>
                </Box>
              </Box>

              {loadingStu ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={28} /></Box>
              ) : students.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>No students found in the system.</Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 420, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Enrollment No.</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', minWidth: 240 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((s, i) => {
                        const status = statuses[s.id] || 'PRESENT';
                        return (
                          <TableRow key={s.id} hover
                            sx={{
                              bgcolor: status === 'ABSENT' ? '#fff7f7'
                                     : status === 'LATE'   ? '#fffbeb'
                                     : 'inherit',
                            }}>
                            <TableCell sx={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{s.department}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>
                              {s.enrollmentNumber || '—'}
                            </TableCell>
                            <TableCell>
                              <ToggleButtonGroup
                                size="small" exclusive
                                value={status}
                                onChange={(_, v) => handleStatus(s.id, v)}>
                                <ToggleButton value="PRESENT"
                                  sx={{ fontSize: 11, px: 1.5, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 } }}>
                                  ✅ Present
                                </ToggleButton>
                                <ToggleButton value="LATE"
                                  sx={{ fontSize: 11, px: 1.5, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#fef9c3', color: '#92400e', fontWeight: 700 } }}>
                                  ⏰ Late
                                </ToggleButton>
                                <ToggleButton value="ABSENT"
                                  sx={{ fontSize: 11, px: 1.5, textTransform: 'none',
                                    '&.Mui-selected': { bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 } }}>
                                  ❌ Absent
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