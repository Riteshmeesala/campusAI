import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, Divider, Grid, FormControl,
  InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Publish, CheckCircle, School } from '@mui/icons-material';
import { examAPI, resultAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

/**
 * ✅ NEW: Publish Results Page
 *
 * Faculty  → can publish MID (mid-term) results only
 * Admin    → can publish MID or SEM (semester-end) results
 *
 * On publish → every student gets:
 *   - In-app notification (real-time)
 *   - Email with their marks and grade
 */
export default function PublishResultPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [exams,     setExams]     = useState([]);
  const [students,  setStudents]  = useState([]);
  const [examId,    setExamId]    = useState('');
  const [examType,  setExamType]  = useState('MID');
  const [marks,     setMarks]     = useState({});   // { studentId: marks }
  const [saving,    setSaving]    = useState(false);
  const [remarks,   setRemarks]   = useState('');
  const [published, setPublished] = useState([]);   // last published results
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Load exams and students
  useEffect(() => {
    examAPI.getAllExams()
      .then(r => setExams(r.data.data || []))
      .catch(() => toast.error('Failed to load exams'));
    userAPI.getStudents()
      .then(r => {
        const list = r.data.data || [];
        setStudents(list);
        // init all marks to empty
        const initMarks = {};
        list.forEach(s => { initMarks[s.id] = ''; });
        setMarks(initMarks);
      })
      .catch(() => toast.error('Failed to load students'));
  }, []);

  const selectedExam = exams.find(e => e.id === examId);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handlePublish = async () => {
    if (!examId) { toast.warning('Select an exam first'); return; }

    // Validate marks
    const studentMarks = {};
    for (const s of students) {
      const m = marks[s.id];
      if (m === '' || m === undefined) continue; // skip blank
      const num = parseFloat(m);
      if (isNaN(num) || num < 0) { toast.error(`Invalid marks for ${s.name}`); return; }
      if (selectedExam && num > selectedExam.totalMarks) {
        toast.error(`Marks for ${s.name} exceed total (${selectedExam.totalMarks})`); return;
      }
      studentMarks[s.id] = num;
    }
    if (Object.keys(studentMarks).length === 0) {
      toast.warning('Enter marks for at least one student'); return;
    }

    setConfirmOpen(false);
    setSaving(true);
    try {
      const res = await resultAPI.publishResults({
        examId,
        examType,
        studentMarks,
        remarks,
      });
      const results = res.data.data || [];
      setPublished(results);
      toast.success(`✅ ${results.length} result(s) published! Students notified via email + app.`);
      // Reset marks
      const initMarks = {};
      students.forEach(s => { initMarks[s.id] = ''; });
      setMarks(initMarks);
      setRemarks('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to publish results');
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.values(marks).filter(v => v !== '').length;

  return (
    <Box>
      <PageHeader
        title="Publish Results"
        subtitle={isAdmin
          ? "Admin: Publish Mid-Term or Semester-End results — students get notified instantly"
          : "Faculty: Publish Mid-Term results — students receive email + in-app notification"}
        breadcrumbs={['Home', 'Results', 'Publish']}
      />

      {/* Info alert */}
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        {isAdmin
          ? "📋 As Admin, you can publish both Mid-Term (MID) and Semester-End (SEM) results."
          : "📋 As Faculty, you can publish Mid-Term (MID) results. Semester results require Admin."}
        {" Once published, each student receives an in-app notification + email automatically."}
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>Step 1 — Select Exam & Type</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Exam *</InputLabel>
                <Select value={examId} label="Select Exam *"
                  onChange={e => setExamId(e.target.value)}>
                  <MenuItem value="">— Select Exam —</MenuItem>
                  {exams.map(e => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.examName} — {e.course?.courseCode} (Total: {e.totalMarks})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Result Type *</InputLabel>
                <Select value={examType} label="Result Type *"
                  onChange={e => setExamType(e.target.value)}>
                  <MenuItem value="MID">📋 Mid-Term (MID)</MenuItem>
                  {isAdmin && <MenuItem value="SEM">🎓 Semester-End (SEM)</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Remarks (optional)"
                value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="e.g., Keep it up!" />
            </Grid>
          </Grid>

          {selectedExam && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0f9ff', borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Exam:</strong> {selectedExam.examName} &nbsp;|&nbsp;
                <strong>Course:</strong> {selectedExam.course?.courseName} &nbsp;|&nbsp;
                <strong>Total Marks:</strong> {selectedExam.totalMarks} &nbsp;|&nbsp;
                <strong>Passing Marks:</strong> {selectedExam.passingMarks}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>
              Step 2 — Enter Marks
            </Typography>
            <Chip
              label={`${filledCount}/${students.length} filled`}
              size="small"
              sx={{ bgcolor: filledCount > 0 ? '#dcfce7' : '#f1f5f9', color: filledCount > 0 ? '#166534' : '#64748b', fontWeight: 700 }}
            />
          </Box>
          <Divider />
          <TableContainer sx={{ maxHeight: 450, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Enrollment No.</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 160 }}>
                    Marks {selectedExam ? `(out of ${selectedExam.totalMarks})` : ''}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Grade Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(s => {
                  const m = parseFloat(marks[s.id]);
                  const total = selectedExam?.totalMarks || 100;
                  const pct = !isNaN(m) ? (m / total) * 100 : null;
                  const grade = pct !== null ? getGrade(pct) : '—';
                  const pass  = selectedExam && !isNaN(m) ? m >= selectedExam.passingMarks : null;
                  return (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {s.enrollmentNumber || s.username}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={marks[s.id] || ''}
                          onChange={e => handleMarkChange(s.id, e.target.value)}
                          inputProps={{ min: 0, max: selectedExam?.totalMarks || 100, step: 0.5 }}
                          sx={{ width: 120 }}
                          placeholder="Enter marks"
                        />
                      </TableCell>
                      <TableCell>
                        {pct !== null ? (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={grade} size="small"
                              sx={{ bgcolor: getGradeBg(grade), color: getGradeColor(grade), fontWeight: 700, fontSize: 12 }} />
                            <Chip label={pass ? 'PASS' : 'FAIL'} size="small"
                              sx={{ bgcolor: pass ? '#dcfce7' : '#fee2e2', color: pass ? '#166534' : '#dc2626', fontWeight: 700, fontSize: 11 }} />
                            <Typography variant="caption" color="text.secondary">{pct.toFixed(1)}%</Typography>
                          </Box>
                        ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Publish Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Publish />}
          disabled={saving || filledCount === 0 || !examId}
          onClick={() => setConfirmOpen(true)}
          sx={{ borderRadius: 2, bgcolor: COLORS.primary, px: 4 }}
        >
          {saving ? 'Publishing...' : `Publish ${filledCount} Result(s)`}
        </Button>
      </Box>

      {/* Published summary */}
      {published.length > 0 && (
        <Card sx={{ mt: 3, border: `2px solid ${COLORS.excellent}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CheckCircle sx={{ color: COLORS.excellent }} />
              <Typography variant="h6" fontWeight={700} color={COLORS.excellent}>
                ✅ Results Published Successfully!
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {published.length} students notified via in-app + email.
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {published.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.student?.name}</TableCell>
                      <TableCell>{r.marksObtained}/{r.exam?.totalMarks}</TableCell>
                      <TableCell><Chip label={r.grade} size="small" sx={{ fontWeight: 700 }} /></TableCell>
                      <TableCell>
                        <Chip label={r.pass ? 'PASS' : 'FAIL'} size="small"
                          sx={{ bgcolor: r.pass ? '#dcfce7' : '#fee2e2', color: r.pass ? '#166534' : '#dc2626', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Publish</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            You are about to publish <strong>{filledCount} result(s)</strong> for
            &nbsp;<strong>{selectedExam?.examName}</strong> as <strong>{examType}</strong> results.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
            Each student will receive an in-app notification + email with their marks.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handlePublish} variant="contained"
            sx={{ bgcolor: COLORS.primary, borderRadius: 2 }}>
            Yes, Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Grade helpers
function getGrade(pct) {
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}
function getGradeColor(g) {
  if (['O','A+','A'].includes(g)) return '#166534';
  if (['B+','B'].includes(g)) return '#1d4ed8';
  if (g === 'C') return '#92400e';
  return '#dc2626';
}
function getGradeBg(g) {
  if (['O','A+','A'].includes(g)) return '#dcfce7';
  if (['B+','B'].includes(g)) return '#dbeafe';
  if (g === 'C') return '#fef9c3';
  return '#fee2e2';
}
