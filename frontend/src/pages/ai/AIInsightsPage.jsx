import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, LinearProgress,
  CircularProgress, Alert, Button, Divider, TextField, MenuItem
} from '@mui/material';
import {
  Psychology, TrendingUp, Warning, CheckCircle, Refresh,
  School, AssignmentTurnedIn, EmojiObjects
} from '@mui/icons-material';
import { aiAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function AIInsightsPage() {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(false);
  const [students,   setStudents]   = useState([]);
  const [selStudent, setSelStudent] = useState('');

  // Faculty/Admin: load student list
  useEffect(() => {
    if (isFacultyOrAdmin) {
      userAPI.getStudents()
        .then(r => setStudents(r.data.data || []))
        .catch(() => {});
    }
  }, [isFacultyOrAdmin]);

  // Student: auto-load own insights
  useEffect(() => {
    if (!isFacultyOrAdmin) loadInsights(null);
  }, [isFacultyOrAdmin]);

  const loadInsights = (studentId) => {
    setLoading(true);
    setError(false);
    setData(null);

    const req = studentId
      ? aiAPI.getStudentPerformance(studentId)
      : aiAPI.getMyPerformance();

    req.then(r => {
        const raw = r.data?.data || {};
        const pct = parseFloat(raw?.overallPercentage || 0);
        const att = parseFloat(raw?.attendancePercentage || 0);

        setData({
          studentName:           raw?.studentName || user?.name || 'Student',
          averageMarksPercentage: pct,
          cgpa:                  (pct / 10).toFixed(2),
          overallAttendance:     att,
          performanceCategory:   raw?.performanceCategory || 'MODERATE',
          riskLevel:             pct < 50 ? 'HIGH' : pct < 75 ? 'MEDIUM' : 'LOW',
          predictedSgpa:         (pct / 10).toFixed(1),
          alerts:                raw?.priorityAction ? [raw.priorityAction] : [],
          suggestions:           raw?.suggestions || [],
          subjectPerformances:   (raw?.coursePerformances || []).map(cp => ({
            subjectCode:          cp.courseCode,
            subjectName:          cp.courseName,
            marksPercentage:      parseFloat(cp.percentage || 0),
            grade:                cp.grade || 'N/A',
            attendancePercentage: parseFloat(cp.attendancePercent || 0),
          })),
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error('Could not load AI analysis');
        setError(true);
        setLoading(false);
      });
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelStudent(id);
    if (id) loadInsights(id);
    else { setData(null); }
  };

  const getRiskColor = (r) =>
    r === 'HIGH' ? COLORS.critical : r === 'MEDIUM' ? COLORS.moderate : COLORS.excellent;

  const getCatColor = (c) => {
    const m = { EXCELLENT: COLORS.excellent, GOOD: COLORS.excellent,
                MODERATE: COLORS.moderate, POOR: COLORS.critical, CRITICAL: COLORS.critical };
    return m[c] || COLORS.moderate;
  };

  return (
    <Box>
      <PageHeader
        title="AI Insights"
        subtitle="AI-powered academic performance analysis"
        breadcrumbs={['Home', 'AI Insights']}
        action={
          data && (
            <Button startIcon={<Refresh fontSize="small"/>}
              onClick={() => loadInsights(selStudent || null)}
              variant="outlined" sx={{ borderRadius: 2 }}>
              Refresh
            </Button>
          )
        }
      />

      {/* Faculty / Admin — student selector */}
      {isFacultyOrAdmin && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color={COLORS.primary}>
              🎓 Select a Student to View Their AI Performance Insights
            </Typography>
            <TextField select fullWidth size="small" label="Select Student"
              value={selStudent} onChange={handleStudentSelect}>
              <MenuItem value="">— Select Student —</MenuItem>
              {students.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}&nbsp;
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({s.enrollmentNumber || s.username})
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
            {!selStudent && (
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Select a student above to load their AI-generated performance analysis.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mt:8, gap:2 }}>
          <CircularProgress size={48} sx={{ color: COLORS.primary }}/>
          <Typography color="text.secondary">Analyzing performance data...</Typography>
        </Box>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert severity="error" sx={{ borderRadius:2 }}
          action={<Button onClick={() => loadInsights(selStudent||null)} size="small">Retry</Button>}>
          Could not load AI analysis. Make sure the backend is running on port 8080.
        </Alert>
      )}

      {/* No selection yet (faculty/admin) */}
      {isFacultyOrAdmin && !selStudent && !loading && (
        <Card sx={{ textAlign:'center', py:6 }}>
          <CardContent>
            <Psychology sx={{ fontSize:64, color: COLORS.primary, opacity:0.4, mb:2 }}/>
            <Typography variant="h6" color="text.secondary">Select a student to view insights</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Choose from the dropdown above to analyze any student's performance.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Data */}
      {data && !loading && (
        <>
          {/* Alerts */}
          {data.alerts?.map((a, i) => (
            <Alert key={i} severity="warning" icon={<Warning/>} sx={{ mb:2, borderRadius:2 }}>{a}</Alert>
          ))}

          {/* Top stats */}
          <Grid container spacing={2.5} sx={{ mb:3 }}>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<TrendingUp/>} label="Avg Marks %" value={`${data.averageMarksPercentage?.toFixed(1)}%`}
                color={getCatColor(data.performanceCategory)}/>
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<School/>} label="CGPA (Estimated)" value={data.cgpa}
                color={getCatColor(data.performanceCategory)}/>
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<AssignmentTurnedIn/>} label="Overall Attendance" value={`${data.overallAttendance?.toFixed(1)}%`}
                color={data.overallAttendance >= 75 ? COLORS.excellent : COLORS.critical}/>
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<Psychology/>} label="Risk Level" value={data.riskLevel}
                color={getRiskColor(data.riskLevel)}/>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Subject Breakdown */}
            {data.subjectPerformances?.length > 0 && (
              <Grid item xs={12} md={7}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>📚 Subject Performance</Typography>
                    <Divider sx={{ mb:2 }}/>
                    {data.subjectPerformances.map((s, i) => (
                      <Box key={i} sx={{ mb:2 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{s.subjectCode}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.subjectName}</Typography>
                          </Box>
                          <Box sx={{ textAlign:'right' }}>
                            <Chip label={s.grade} size="small"
                              sx={{ bgcolor: s.marksPercentage >= 75 ? COLORS.greenBg : s.marksPercentage >= 50 ? COLORS.moderateBg : COLORS.criticalBg,
                                    color: s.marksPercentage >= 75 ? COLORS.excellent : s.marksPercentage >= 50 ? COLORS.moderate : COLORS.critical,
                                    fontWeight:700, fontSize:11 }}/>
                          </Box>
                        </Box>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <LinearProgress variant="determinate"
                            value={Math.min(s.marksPercentage, 100)}
                            sx={{ flexGrow:1, height:8, borderRadius:4,
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: s.marksPercentage >= 75 ? COLORS.excellent :
                                             s.marksPercentage >= 50 ? COLORS.moderate : COLORS.critical }}}/>
                          <Typography variant="caption" fontWeight={700} sx={{ minWidth:40 }}>
                            {s.marksPercentage?.toFixed(1)}%
                          </Typography>
                        </Box>
                        {s.attendancePercentage > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Attendance: {s.attendancePercentage?.toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Suggestions */}
            <Grid item xs={12} md={data.subjectPerformances?.length > 0 ? 5 : 12}>
              <Card sx={{ height:'100%' }}>
                <CardContent>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
                    <EmojiObjects sx={{ color: COLORS.moderate }}/>
                    <Typography variant="h6" fontWeight={700}>AI Suggestions</Typography>
                  </Box>
                  <Divider sx={{ mb:2 }}/>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
                    <Chip label={data.performanceCategory} size="small"
                      sx={{ bgcolor: getCatColor(data.performanceCategory) + '20',
                            color: getCatColor(data.performanceCategory), fontWeight:700 }}/>
                    <Chip label={`Risk: ${data.riskLevel}`} size="small"
                      sx={{ bgcolor: getRiskColor(data.riskLevel) + '20',
                            color: getRiskColor(data.riskLevel), fontWeight:700 }}/>
                  </Box>
                  {data.suggestions?.length === 0 ? (
                    <Box sx={{ textAlign:'center', py:3 }}>
                      <CheckCircle sx={{ fontSize:40, color: COLORS.excellent, mb:1 }}/>
                      <Typography color={COLORS.excellent} fontWeight={600}>
                        Excellent performance! Keep it up.
                      </Typography>
                    </Box>
                  ) : (
                    data.suggestions.map((s, i) => (
                      <Box key={i} sx={{ display:'flex', gap:1.5, mb:1.5,
                            p:1.5, bgcolor: COLORS.bgBase, borderRadius:2 }}>
                        <Typography sx={{ fontSize:16 }}>
                          {i === 0 ? '🎯' : i === 1 ? '📖' : i === 2 ? '⚠️' : '💡'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{s}</Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}