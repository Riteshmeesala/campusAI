import {
  ArrowForward,
  BarChart,
  CalendarMonth, Payment,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button, Card, CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title, Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import AttendanceBar from '../../components/shared/AttendanceBar';
import PageHeader from '../../components/shared/PageHeader';
import PerformanceBadge from '../../components/shared/PerformanceBadge';
import StatCard from '../../components/shared/StatCard';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, attendanceAPI, feeAPI, gpaAPI, notifAPI, resultAPI } from '../../services/api';
import { COLORS, getAttColor, getPerfColor } from '../../theme/theme';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.studentId || user?.id;

  const [attendance, setAttendance] = useState(null);
  const [results,    setResults]    = useState([]);
  const [fees,       setFees]       = useState([]);
  const [notifs,     setNotifs]     = useState([]);
  const [aiData,     setAiData]     = useState(null);
  const [gpa,        setGpa]        = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!studentId) return;
    Promise.allSettled([
      attendanceAPI.getMyAttendance(),
      resultAPI.getMyResults(),
      feeAPI.getMyFees(),
      gpaAPI.getMyGpa(),
      notifAPI.getUnread(),
      aiAPI.getMyPerformance(),
    ]).then(([att, res, fee, gpaRes, ntf, ai]) => {
      if (att.status === 'fulfilled') {
        const records = att.value.data.data || [];
        // Build summary from raw attendance records
        const byCourse = {};
        records.forEach(r => {
          const code = r.course?.courseCode || 'UNK';
          const name = r.course?.courseName || code;
          if (!byCourse[code]) byCourse[code] = { subjectCode: code, subjectName: name, present: 0, total: 0 };
          byCourse[code].total++;
          if (r.status === 'PRESENT' || r.status === 'LATE') byCourse[code].present++;
        });
        const subjects = Object.values(byCourse).map(s => ({ ...s, percentage: s.total ? (s.present/s.total)*100 : 0 }));
        const totalPresent = subjects.reduce((s,x) => s+x.present, 0);
        const totalClasses = subjects.reduce((s,x) => s+x.total, 0);
        setAttendance({ 
          overallPercentage: totalClasses > 0 ? (totalPresent/totalClasses)*100 : 0,
          totalPresent, totalClasses, subjectBreakdown: subjects
        });
      }
      if (res.status === 'fulfilled') setResults(res.value.data.data || []);
      if (fee.status === 'fulfilled') setFees(fee.value.data.data || []);
      if (ntf.status === 'fulfilled') notifAPI.getAll()
  .then(res => {
    const data = res?.data?.content || res?.content || res || [];
    setNotifs(Array.isArray(data) ? data : []);
  })
  .catch(() => setNotifs([]));
      if (gpaRes.status === 'fulfilled') setGpa(gpaRes.value.data.data);
      if (ai.status  === 'fulfilled') {
        const raw = ai.value.data.data;
        setAiData(raw ? {
          ...raw,
          averageMarksPercentage: parseFloat(raw.overallPercentage || 0),
          overallAttendance: parseFloat(raw.attendancePercentage || 0),
          performanceCategory: raw.performanceCategory,
        } : null);
      }
      setLoading(false);
    });
  }, [studentId, user]);

  const avgMarks = results.length
    ? (results.reduce((s, r) => s + (r.percentage ? parseFloat(r.percentage) : 0), 0) / results.length)
    : 0;

  const pendingFees = fees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE');

  // Bar chart — marks per subject
  const barData = {
    labels: results.slice(0, 8).map(r => r.exam?.course?.courseCode || r.exam?.examName || 'N/A'),
    datasets: [{
      label: 'Marks %',
      data: results.slice(0, 8).map(r => Math.round(parseFloat(r.percentage || 0))),
      backgroundColor: results.slice(0, 8).map(r => {
        const p = parseFloat(r.percentage || 0);
        return `${getPerfColor(p)}cc`;
      }),
      borderRadius: 8, borderSkipped: false,
    }]
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      y: { max: 100, min: 0, grid: { color: '#e2e8f010' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  // Radar chart — subject attendance
  const subj = attendance?.subjectBreakdown?.slice(0, 6) || [];
  const radarData = {
    labels: subj.map(s => s.subjectCode || s.subjectName),
    datasets: [{
      label: 'Attendance %',
      data: subj.map(s => s.percentage),
      backgroundColor: `${COLORS.secondary}25`,
      borderColor: COLORS.secondary, pointBackgroundColor: COLORS.secondary,
      borderWidth: 2, pointRadius: 4,
    }]
  };
  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 } } } },
    plugins: { legend: { display: false } }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ height: 80, bgcolor: '#fff', borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: 130 }}>
                <CardContent><CircularProgress size={24} /></CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || user?.username} 👋`}
        subtitle="Here's your academic overview for today"
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Critical alerts */}
      {notifs.filter(n => n.type === 'ATTENDANCE' || n.type === 'AI_ALERT').slice(0, 2).map(n => (
        <Alert
          key={n.id}
          severity={n.type === 'AI_ALERT' ? 'error' : 'warning'}
          sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.875rem' }}
          icon={<Warning fontSize="small" />}
        >
          {n.message}
        </Alert>
      ))}

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            label="CGPA" value={user?.cgpa || '—'}
            sub="Current semester"
            color={COLORS.secondary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarMonth />}
            label="Attendance"
            value={`${attendance?.overallPercentage?.toFixed(1) || 0}%`}
            sub={attendance?.overallPercentage >= 75 ? '✅ Above 75%' : '⚠️ Below 75%'}
            color={getAttColor(attendance?.overallPercentage || 0)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BarChart />}
            label="Avg Marks"
            value={`${avgMarks.toFixed(1)}%`}
            sub={aiData?.suggestionCategory || '—'}
            color={getPerfColor(avgMarks)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Payment />}
            label="Pending Fees"
            value={pendingFees.length}
            sub={pendingFees.length > 0 ? 'Action required' : 'All cleared ✅'}
            color={pendingFees.length > 0 ? COLORS.critical : COLORS.excellent}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          {/* Charts row */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={7}>
              <Card sx={{ height: 280 }}>
                <CardContent sx={{ height: '100%', pb: '16px !important' }}>
                  <Typography variant="h6" fontWeight={700} mb={1.5}>Marks by Subject</Typography>
                  {results.length > 0
                    ? <Box sx={{ height: 210 }}><Bar data={barData} options={barOpts} /></Box>
                    : <Box sx={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary" variant="body2">No results yet</Typography>
                      </Box>
                  }
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Card sx={{ height: 280 }}>
                <CardContent sx={{ height: '100%', pb: '16px !important' }}>
                  <Typography variant="h6" fontWeight={700} mb={1.5}>Attendance Radar</Typography>
                  {subj.length > 0
                    ? <Box sx={{ height: 210 }}><Radar data={radarData} options={radarOpts} /></Box>
                    : <Box sx={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary" variant="body2">No data</Typography>
                      </Box>
                  }
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Attendance breakdown */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Attendance by Subject</Typography>
                <Button size="small" endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/student/attendance')}
                  sx={{ fontSize: '0.8rem' }}>View all</Button>
              </Box>
              {attendance?.subjectBreakdown?.length > 0
                ? attendance.subjectBreakdown.map(s => (
                    <AttendanceBar
                      key={s.subjectCode}
                      subjectName={s.subjectName}
                      subjectCode={s.subjectCode}
                      percentage={s.percentage}
                      present={s.present}
                      total={s.total}
                      classesNeeded={s.classesNeededFor75}
                    />
                  ))
                : <Typography color="text.secondary" variant="body2" textAlign="center" py={3}>No attendance data</Typography>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          {/* Performance badge */}
          {aiData && (
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>AI Performance</Typography>
                <PerformanceBadge percentage={aiData.averageMarksPercentage || avgMarks} />
                <Box sx={{
                  mt: 2, p: 1.5, borderRadius: 2,
                  bgcolor: aiData.riskLevel === 'HIGH' ? COLORS.criticalBg
                         : aiData.riskLevel === 'MEDIUM' ? COLORS.moderateBg : COLORS.greenBg
                }}>
                  <Typography variant="caption" fontWeight={700} sx={{
                    color: aiData.riskLevel === 'HIGH' ? COLORS.critical
                          : aiData.riskLevel === 'MEDIUM' ? COLORS.moderate : COLORS.excellent
                  }}>
                    Risk Level: {aiData.riskLevel}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" mt={0.3}>
                    Predicted SGPA: {aiData.predictedSgpa?.toFixed(2) || '—'}
                  </Typography>
                </Box>
                <Button
                  fullWidth variant="outlined" endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/student/ai-insights')}
                  sx={{ mt: 2, borderRadius: 2, fontSize: '0.8rem' }}
                >
                  View Full Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick actions */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
              {[
                { icon: '📊', label: 'View Results', path: '/student/results', color: COLORS.secondary },
                { icon: '💳', label: 'Pay Fees', path: '/student/fees', color: COLORS.accent, badge: pendingFees.length },
                { icon: '🗓️', label: 'Exam Schedule', path: '/student/exams', color: COLORS.primary },
                { icon: '🤖', label: 'AI Study Plan', path: '/student/study-plan', color: COLORS.excellent },
                { icon: '💬', label: 'CampusMate Chat', path: '/chatbot', color: '#7c3aed' },
              ].map(a => (
                <Box
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                    borderRadius: 2, cursor: 'pointer', mb: 0.5,
                    '&:hover': { bgcolor: `${a.color}0d` }, transition: 'all 0.15s'
                  }}
                >
                  <Typography fontSize="1.2rem">{a.icon}</Typography>
                  <Typography variant="body2" fontWeight={600} color={COLORS.textPrimary} flex={1}>{a.label}</Typography>
                  {a.badge > 0 && (
                    <Chip label={a.badge} size="small" sx={{ bgcolor: COLORS.critical, color: '#fff', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                  )}
                  <ArrowForward sx={{ fontSize: 16, color: COLORS.textMuted }} />
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          {notifs.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1.5}>Notifications</Typography>
                {notifs.slice(0, 4).map(n => (
                  <Box key={n.id} sx={{
                    p: 1.5, borderRadius: 2, mb: 1,
                    bgcolor: n.type === 'ATTENDANCE' ? COLORS.atRiskBg
                           : n.type === 'AI_ALERT'   ? COLORS.criticalBg : COLORS.bgBase,
                    border: `1px solid ${n.type === 'ATTENDANCE' ? COLORS.atRisk + '30'
                           : n.type === 'AI_ALERT' ? COLORS.critical + '30' : COLORS.border}`
                  }}>
                    <Typography variant="caption" fontWeight={700} color={COLORS.textPrimary}>{n.title}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.3 }}>
                      {n.message.slice(0, 70)}{n.message.length > 70 ? '...' : ''}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}