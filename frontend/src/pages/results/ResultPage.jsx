import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Typography, Chip, Button, Tab, Tabs,
  CircularProgress, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Alert, Divider
} from '@mui/material';
import { Publish, Refresh, Close, BarChart, School } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip as CTooltip, Legend
} from 'chart.js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS, getPerfColor, getPerfBg } from '../../theme/theme';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, CTooltip, Legend);

// ── Grade / color helpers ─────────────────────────────────────────────────────
function calcGrade(pct) {
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}
const gradeClr = (g) => {
  if (!g) return '#64748b';
  if (g === 'O')  return '#059669';
  if (g === 'A+') return '#0284c7';
  if (g === 'A')  return '#7c3aed';
  if (g === 'B+') return '#d97706';
  if (g === 'B')  return '#ea580c';
  return '#dc2626';
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISH DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function PublishDialog({ open, onClose, onDone, type }) {
  const isSem   = type === 'SEM';
  const [exams,    setExams]   = useState([]);
  const [students, setStudents]= useState([]);
  const [examId,   setExamId]  = useState('');
  const [marks,    setMarks]   = useState({});   // { [studentId]: string }
  const [remarks,  setRemarks] = useState('');
  const [loading,  setLoading] = useState(false);
  const [saving,   setSaving]  = useState(false);

  // Load exams + students when dialog opens
  useEffect(() => {
    if (!open) return;
    setExamId(''); setMarks({}); setRemarks('');
    setLoading(true);
    Promise.all([api.get('/exams'), api.get('/users/students')])
      .then(([er, sr]) => {
        setExams(er.data?.data || []);
        setStudents(sr.data?.data || []);
      })
      .catch(() => toast.error('Could not load exams/students'))
      .finally(() => setLoading(false));
  }, [open]);

  const selExam = exams.find(e => String(e.id) === String(examId));

  const handlePublish = async () => {
    if (!examId) { toast.warning('Select an exam first'); return; }
    const studentMarks = {};
    let count = 0;
    for (const s of students) {
      const raw = marks[s.id];
      if (raw === undefined || raw === '') continue;
      const num = parseFloat(raw);
      if (isNaN(num) || num < 0) { toast.warning(`Invalid marks for ${s.name}`); return; }
      if (selExam && num > selExam.totalMarks) {
        toast.warning(`${s.name}: marks (${num}) exceed max (${selExam.totalMarks})`); return;
      }
      studentMarks[s.id] = num;
      count++;
    }
    if (count === 0) { toast.warning('Enter marks for at least one student'); return; }

    setSaving(true);
    try {
      const endpoint = isSem ? '/results/publish/sem' : '/results/publish/mid';
      await api.post(endpoint, {
        examId:       Number(examId),
        studentMarks: studentMarks,
        remarks:      remarks.trim() || null,
      });
      toast.success(`✅ ${isSem ? 'Semester' : 'Mid-semester'} results published for ${count} student(s)!`);
      onDone();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to publish';
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>

      {/* Title */}
      <DialogTitle sx={{
        fontWeight: 800, fontSize: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #f1f5f9', pb: 1.5,
      }}>
        {isSem ? '📖 Publish Semester Results (Admin)' : '📝 Publish Mid-Semester Results'}
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isSem && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
            ⚠️ Semester results are <strong>Admin only</strong> — these are final end-term marks saved permanently to student records.
          </Alert>
        )}
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>
          📧 Students receive an <strong>email notification</strong> automatically when you publish.
        </Alert>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : (
          <>
            {/* Exam selector */}
            <TextField
              select fullWidth size="small" label="Select Exam *"
              value={examId} onChange={e => setExamId(e.target.value)} sx={{ mb: 2.5 }}>
              <MenuItem value="">— Choose exam —</MenuItem>
              {exams.map(e => (
                <MenuItem key={e.id} value={String(e.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                    <span><strong>{e.examName}</strong> — {e.course?.courseName}</span>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip label={e.examType || 'EXAM'} size="small" sx={{ fontSize: 10, height: 18 }} />
                      <Chip label={`Max: ${e.totalMarks}`} size="small"
                        sx={{ fontSize: 10, height: 18, bgcolor: '#f1f5f9' }} />
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Marks table */}
            {examId && (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                  Max marks: <strong style={{ color: '#1e293b' }}>{selExam?.totalMarks || 100}</strong>
                  &nbsp;|&nbsp; Pass at: <strong style={{ color: '#059669' }}>{selExam?.passingMarks || 40}</strong>
                </Typography>
                <TableContainer sx={{ maxHeight: 350, border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', width: 40 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Enrollment</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', width: 130 }}>
                          Marks / {selExam?.totalMarks || 100}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', width: 70 }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', width: 80 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: '#94a3b8' }}>
                            No students found
                          </TableCell>
                        </TableRow>
                      ) : students.map((s, i) => {
                        const raw  = marks[s.id];
                        const num  = (raw !== undefined && raw !== '') ? parseFloat(raw) : null;
                        const tot  = selExam?.totalMarks || 100;
                        const pss  = selExam?.passingMarks || 40;
                        const pct  = (num !== null && !isNaN(num)) ? (num / tot) * 100 : null;
                        const gr   = pct !== null ? calcGrade(pct) : null;
                        const pass = num !== null && num >= pss;
                        const err  = num !== null && (num < 0 || num > tot);
                        return (
                          <TableRow key={s.id} hover>
                            <TableCell sx={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                                {s.enrollmentNumber || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" type="number" placeholder="—"
                                value={marks[s.id] ?? ''}
                                error={err}
                                onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                                inputProps={{ min: 0, max: tot, step: 0.5 }}
                                sx={{ width: 110, '& input': { py: 0.5, px: 1, fontSize: 13 } }}
                              />
                            </TableCell>
                            <TableCell>
                              {gr ? (
                                <Chip label={gr} size="small"
                                  sx={{ bgcolor: gradeClr(gr) + '22', color: gradeClr(gr),
                                        fontWeight: 800, fontSize: 12, minWidth: 36 }} />
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              {pct !== null ? (
                                <Chip
                                  label={pass ? '✅ Pass' : '❌ Fail'} size="small"
                                  sx={{
                                    bgcolor: pass ? '#dcfce7' : '#fee2e2',
                                    color:   pass ? '#15803d' : '#dc2626',
                                    fontSize: 10, fontWeight: 700,
                                  }}
                                />
                              ) : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Remarks */}
            <TextField
              fullWidth multiline rows={2} size="small"
              label="Remarks (optional)" value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Mid-term marks entered. Re-test for failures on 20th March." />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" disabled={saving || loading || !examId}
          onClick={handlePublish}
          startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <Publish />}
          sx={{
            borderRadius: 2, px: 3,
            bgcolor:   isSem ? COLORS.primary    : COLORS.secondary,
            '&:hover': { bgcolor: isSem ? '#0d1657' : '#1e3a8a' },
          }}>
          {saving ? 'Publishing…' : 'Publish & Notify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResultPage() {
  const { user }   = useAuth();
  const isAdmin    = user?.role === 'ADMIN';
  const isFaculty  = user?.role === 'FACULTY';
  const isStudent  = user?.role === 'STUDENT';
  const isStaff    = isAdmin || isFaculty;

  const [tab,      setTab]     = useState(0);
  const [results,  setResults] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [midOpen,  setMidOpen] = useState(false);
  const [semOpen,  setSemOpen] = useState(false);

  // Derived lists
  const midResults = results.filter(r => r.resultType !== 'SEM');
  const semResults = results.filter(r => r.resultType === 'SEM');
  const shown      = tab === 0 ? results : tab === 1 ? midResults : semResults;

  const loadResults = useCallback(() => {
    setLoading(true);
    // Students  → /results/my   (their own marks)
    // Staff     → /results/all  (all students' marks)
    const url = isStudent ? '/results/my' : '/results/all';
    api.get(url)
      .then(r => setResults(r.data?.data || []))
      .catch(err => {
        console.error('Results load failed:', err.response?.status, err.response?.data);
        toast.error('Failed to load results — check backend is running');
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [isStudent]);

  useEffect(() => { loadResults(); }, [loadResults]);

  // Computed stats
  const avgPct  = shown.length
    ? shown.reduce((s, r) => s + parseFloat(r.percentage || 0), 0) / shown.length : 0;
  const passedResults = results.filter(r => r.pass);
  const cgpa    = passedResults.length
    ? passedResults.reduce((s, r) => s + parseFloat(r.gradePoints || 0), 0) / passedResults.length : 0;

  const barData = {
    labels:   shown.map(r => r.exam?.course?.courseCode || r.exam?.examName || '—'),
    datasets: [{
      label: 'Score %',
      data:  shown.map(r => Math.round(parseFloat(r.percentage || 0))),
      backgroundColor: shown.map(r => getPerfColor(parseFloat(r.percentage || 0)) + 'cc'),
      borderRadius: 6,
    }],
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Results"
        subtitle={isStudent ? 'Your mid-semester & semester marks' : 'Publish and manage exam results'}
        breadcrumbs={['Home', 'Results']}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isStaff && (
              <Button variant="contained" startIcon={<Publish />}
                onClick={() => setMidOpen(true)}
                sx={{ borderRadius: 2, fontSize: 12, bgcolor: COLORS.secondary }}>
                Publish Mid Results
              </Button>
            )}
            {isAdmin && (
              <Button variant="contained" startIcon={<Publish />}
                onClick={() => setSemOpen(true)}
                sx={{ borderRadius: 2, fontSize: 12, bgcolor: COLORS.primary }}>
                Publish Sem Results
              </Button>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={loadResults} size="small"
                sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* Student summary strip */}
      {isStudent && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'CGPA',          val: `${cgpa.toFixed(2)}/10`, color: getPerfColor(cgpa * 10) },
            { label: 'Avg Score',     val: `${avgPct.toFixed(1)}%`, color: getPerfColor(avgPct) },
            { label: 'Total Results', val: results.length,          color: COLORS.primary },
            { label: 'Passed',        val: results.filter(r => r.pass).length, color: '#059669' },
            { label: 'Failed',        val: results.filter(r => !r.pass).length,
              color: results.filter(r => !r.pass).length > 0 ? '#dc2626' : '#94a3b8' },
          ].map((c, i) => (
            <Card key={i} elevation={0}
              sx={{ flex: '1 1 110px', minWidth: 100, border: '1px solid #e2e8f0', borderRadius: 3, textAlign: 'center' }}>
              <Box sx={{ p: '12px 10px' }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: c.color, lineHeight: 1.1 }}>
                  {c.val}
                </Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Main card */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>

        {/* Tabs — standard MUI Tabs + Tab components */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, borderBottom: '1px solid #f1f5f9',
            '& .MuiTab-root': { fontWeight: 600, fontSize: 13, minHeight: 48, textTransform: 'none' },
          }}>
          <Tab label={`All Results (${results.length})`} />
          <Tab label={`📝 Mid-Sem (${midResults.length})`} />
          <Tab label={`📖 Semester (${semResults.length})`} />
        </Tabs>

        {/* Loading */}
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>

        /* Empty state */
        ) : shown.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 52, color: '#cbd5e1', mb: 1 }} />
            <Typography color="text.secondary" mb={2} fontSize={14}>
              {tab === 1
                ? 'No mid-semester results yet.'
                : tab === 2
                ? 'No semester results yet.'
                : 'No results published yet.'}
            </Typography>
            {isStaff && tab !== 2 && (
              <Button variant="outlined" startIcon={<Publish />} onClick={() => setMidOpen(true)}>
                Publish Mid Results Now
              </Button>
            )}
            {isAdmin && tab === 2 && (
              <Button variant="outlined" startIcon={<Publish />} onClick={() => setSemOpen(true)}>
                Publish Semester Results Now
              </Button>
            )}
          </Box>

        ) : (
          <>
            {/* Bar chart — only for students with 2+ results */}
            {isStudent && shown.length >= 2 && (
              <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BarChart fontSize="small" /> Score Distribution
                </Typography>
                <Box sx={{ height: 130 }}>
                  <Bar data={barData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                      x: { grid: { display: false },               ticks: { font: { size: 10 } } },
                    },
                  }} />
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Results table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {isStaff && <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>}
                    <TableCell sx={{ fontWeight: 700 }}>Subject / Exam</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shown.map(r => {
                    const pct = Math.round(parseFloat(r.percentage || 0));
                    return (
                      <TableRow key={r.id} hover>
                        {isStaff && (
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {r.student?.name || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {r.student?.enrollmentNumber || '—'}
                            </Typography>
                          </TableCell>
                        )}

                        {/* Subject */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {r.exam?.course?.courseName || r.exam?.examName || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            {r.exam?.course?.courseCode} · {r.exam?.examName}
                          </Typography>
                        </TableCell>

                        {/* Type badge */}
                        <TableCell>
                          <Chip
                            label={r.resultType === 'SEM' ? '📖 Semester' : '📝 Mid-Sem'}
                            size="small"
                            sx={{
                              bgcolor: r.resultType === 'SEM' ? '#dbeafe' : '#dcfce7',
                              color:   r.resultType === 'SEM' ? '#1d4ed8' : '#15803d',
                              fontWeight: 700, fontSize: 10,
                            }}
                          />
                        </TableCell>

                        {/* Marks */}
                        <TableCell>
                          <Typography fontWeight={700}>
                            {r.marksObtained}
                            <Typography component="span" variant="caption" color="text.secondary">
                              &nbsp;/ {r.exam?.totalMarks ?? '—'}
                            </Typography>
                          </Typography>
                        </TableCell>

                        {/* Grade */}
                        <TableCell>
                          <Chip label={r.grade || '—'} size="small"
                            sx={{
                              bgcolor: gradeClr(r.grade) + '22',
                              color:   gradeClr(r.grade),
                              fontWeight: 800, fontSize: 13, minWidth: 38,
                            }}
                          />
                        </TableCell>

                        {/* Pass/Fail */}
                        <TableCell>
                          <Chip
                            label={r.pass ? '✅ Pass' : '❌ Fail'} size="small"
                            sx={{
                              bgcolor: r.pass ? '#dcfce7' : '#fee2e2',
                              color:   r.pass ? '#15803d' : '#dc2626',
                              fontWeight: 700, fontSize: 11,
                            }}
                          />
                        </TableCell>

                        {/* Progress bar */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <LinearProgress variant="determinate" value={pct}
                              sx={{
                                flex: 1, height: 7, borderRadius: 4,
                                bgcolor: getPerfColor(pct) + '22',
                                '& .MuiLinearProgress-bar': { bgcolor: getPerfColor(pct), borderRadius: 4 },
                              }}
                            />
                            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 32, color: getPerfColor(pct) }}>
                              {pct}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table footer */}
            <Box sx={{ p: 2, bgcolor: '#fafbfc', borderTop: '1px solid #f1f5f9',
              display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                {shown.length} result(s)
              </Typography>
              {shown.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Average: <strong style={{ color: getPerfColor(avgPct) }}>{avgPct.toFixed(1)}%</strong>
                </Typography>
              )}
              {isStudent && results.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  CGPA: <strong style={{ color: getPerfColor(cgpa * 10) }}>{cgpa.toFixed(2)} / 10</strong>
                </Typography>
              )}
            </Box>
          </>
        )}
      </Card>

      {/* Dialogs */}
      <PublishDialog open={midOpen} onClose={() => setMidOpen(false)} onDone={loadResults} type="MID" />
      <PublishDialog open={semOpen} onClose={() => setSemOpen(false)} onDone={loadResults} type="SEM" />
    </Box>
  );
}