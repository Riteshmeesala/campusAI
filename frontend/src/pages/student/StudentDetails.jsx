import { Badge, Email, Phone, School, TrendingUp } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card, CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, attendanceAPI, gpaAPI, resultAPI, userAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';

export default function StudentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  // If no id param, show current user's profile
  const studentId = id || user?.id;

  const [student,    setStudent]    = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results,    setResults]    = useState([]);
  const [gpa,        setGpa]        = useState(null);
  const [perf,       setPerf]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (!studentId) return;
    Promise.allSettled([
      userAPI.getById(studentId),
      studentId == user?.id ? attendanceAPI.getMyAttendance() : attendanceAPI.getStudentAttendance(studentId),
      studentId == user?.id ? resultAPI.getMyResults() : resultAPI.getStudentResults(studentId),
      gpaAPI.getStudentGpa(studentId),
      studentId == user?.id
        ? analyticsAPI.getMyPerformance()
        : analyticsAPI.getStudentPerformance(studentId),
    ]).then(([u, att, res, gpaRes, perfRes]) => {
      if (u.status === 'fulfilled')    setStudent(u.value.data.data);
      if (att.status === 'fulfilled')  setAttendance(att.value.data.data || []);
      if (res.status === 'fulfilled')  setResults(res.value.data.data || []);
      if (gpaRes.status === 'fulfilled') setGpa(gpaRes.value.data.data);
      if (perfRes.status === 'fulfilled') setPerf(perfRes.value.data.data);
      setLoading(false);
    });
  }, [studentId]);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Calculate attendance per course
  const courseAtt = {};
  attendance.forEach(a => {
    const key = a.course?.id;
    if (!key) return;
    if (!courseAtt[key]) courseAtt[key] = { name: a.course?.courseCode, present: 0, total: 0 };
    courseAtt[key].total++;
    if (a.status === 'PRESENT' || a.status === 'LATE') courseAtt[key].present++;
  });

  const cgpa = gpa?.cgpa || 0;
  const sgpa = gpa?.sgpa || 0;

  // Live attendance calc from raw records
  const totalAttClasses = attendance.length;
  const totalAttPresent = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const overallAttPct   = totalAttClasses > 0 ? (totalAttPresent / totalAttClasses) * 100 : 0;
  const avgMarksPct     = results.length
    ? results.reduce((s,r) => s + parseFloat(r.percentage || 0), 0) / results.length
    : 0;

  return (
    <Box>
      <PageHeader
        title="Student Profile"
        subtitle={student ? `${student.name} — ${student.enrollmentNumber || ''}` : ''}
        breadcrumbs={['Home', 'Students', 'Profile']}
      />
      <Grid container spacing={2.5}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: COLORS.secondary, fontSize: 32, mx: 'auto', mb: 2 }}>
                {student?.name?.[0] || 'S'}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{student?.name}</Typography>
              <Chip label={student?.role} size="small" sx={{ mt: 0.5, bgcolor: COLORS.secondary, color: '#fff' }} />
              {/* Live Performance Summary */}
              <Box sx={{ display:'flex', gap:1, justifyContent:'center', mt:1.5, flexWrap:'wrap' }}>
                <Chip
                  label={`Att: ${overallAttPct.toFixed(1)}%`}
                  size="small"
                  sx={{
                    bgcolor: overallAttPct >= 75 ? '#dcfce7' : '#fee2e2',
                    color:   overallAttPct >= 75 ? '#166534' : '#dc2626',
                    fontWeight: 700, fontSize: 11,
                  }}
                />
                <Chip
                  label={`Avg: ${avgMarksPct.toFixed(1)}%`}
                  size="small"
                  sx={{
                    bgcolor: avgMarksPct >= 60 ? '#dbeafe' : '#fef3c7',
                    color:   avgMarksPct >= 60 ? '#1e40af' : '#92400e',
                    fontWeight: 700, fontSize: 11,
                  }}
                />
                {cgpa > 0 && (
                  <Chip
                    label={`CGPA: ${Number(cgpa).toFixed(2)}`}
                    size="small"
                    sx={{ bgcolor:'#e0e7ff', color:'#4338ca', fontWeight:700, fontSize:11 }}
                  />
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'left' }}>
                {[
                  { icon: <Badge fontSize="small" />, label: 'Enrollment', value: student?.enrollmentNumber },
                  { icon: <Email fontSize="small" />, label: 'Email', value: student?.email },
                  { icon: <Phone fontSize="small" />, label: 'Phone', value: student?.phoneNumber },
                  { icon: <School fontSize="small" />, label: 'Department', value: student?.department },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: COLORS.textSecond }}>
                    {row.icon}
                    <Box>
                      <Typography variant="caption" color="textSecondary">{row.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{row.value || 'N/A'}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* GPA Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Academic Performance</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center', bgcolor: COLORS.bgBase, borderRadius: 2, p: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} color={COLORS.secondary}>{cgpa.toFixed(2)}</Typography>
                  <Typography variant="caption">CGPA / 10.0</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', bgcolor: COLORS.bgBase, borderRadius: 2, p: 1.5 }}>
                  <Typography variant="h4" fontWeight={800} color={COLORS.excellent}>{sgpa.toFixed(2)}</Typography>
                  <Typography variant="caption">SGPA (Sem 4)</Typography>
                </Box>
              </Box>
              <Chip
                label={cgpa >= 9 ? 'Outstanding' : cgpa >= 8 ? 'Excellent' : cgpa >= 7 ? 'Very Good' : cgpa >= 6 ? 'Good' : 'Needs Improvement'}
                size="small"
                sx={{ bgcolor: cgpa >= 7 ? COLORS.excellent : cgpa >= 5 ? COLORS.moderate : COLORS.critical, color: '#fff' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance + Results */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Attendance by Subject</Typography>
              {Object.values(courseAtt).length === 0 ? (
                <Typography color="textSecondary">No attendance records found.</Typography>
              ) : (
                Object.values(courseAtt).map((c, i) => {
                  const pct = c.total > 0 ? (c.present / c.total * 100) : 0;
                  const color = pct >= 90 ? COLORS.excellent : pct >= 75 ? COLORS.secondary : COLORS.critical;
                  return (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                        <Typography variant="body2" color={color} fontWeight={700}>
                          {c.present}/{c.total} ({pct.toFixed(1)}%)
                          {pct < 75 && ' ⚠️'}
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#eee',
                              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
                      {pct < 75 && (
                        <Typography variant="caption" color={COLORS.critical}>
                          Need {Math.ceil((75 * c.total - 100 * c.present) / 25)} more classes to reach 75%
                        </Typography>
                      )}
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Exam Results & Marks</Typography>
              {results.length === 0 ? (
                <Typography color="textSecondary">No results published yet.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                        {['Exam', 'Course', 'Marks', 'Percentage', 'Grade', 'Grade Points', 'Status'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize: 12 }}>{r.exam?.examName}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{r.exam?.course?.courseCode}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{r.marksObtained}/{r.exam?.totalMarks}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{r.percentage?.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Chip label={r.grade} size="small"
                              sx={{ bgcolor: r.percentage >= 80 ? COLORS.excellent : r.percentage >= 60 ? COLORS.secondary : COLORS.critical,
                                    color: '#fff', fontSize: 11 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{r.gradePoints?.toFixed(1)}</TableCell>
                          <TableCell>
                            <Chip label={r.pass ? 'Pass ✅' : 'Fail ❌'} size="small"
                              sx={{ bgcolor: r.pass ? COLORS.greenBg : COLORS.criticalBg,
                                    color: r.pass ? COLORS.excellent : COLORS.critical, fontSize: 11 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      {/* Academic Performance Live Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
                <TrendingUp sx={{ color: COLORS.secondary }} />
                <Typography variant="h6" fontWeight={700}>Academic Performance</Typography>
                <Chip label="Live" size="small" sx={{ bgcolor:'#dcfce7', color:'#166534', fontSize:10, fontWeight:700 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p:2, textAlign:'center', borderRadius:2, bgcolor:'#f8fafc' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: overallAttPct>=75?'#059669':'#dc2626' }}>
                      {overallAttPct.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Overall Attendance</Typography>
                    {overallAttPct < 75 && (
                      <Typography variant="caption" sx={{ display:'block', color:'#dc2626', fontWeight:700 }}>
                        ⚠️ Below 75%
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p:2, textAlign:'center', borderRadius:2, bgcolor:'#f8fafc' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.secondary }}>
                      {avgMarksPct.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Average Marks</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p:2, textAlign:'center', borderRadius:2, bgcolor:'#f8fafc' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color:'#4338ca' }}>
                      {Number(cgpa).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">CGPA</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p:2, textAlign:'center', borderRadius:2, bgcolor:'#f8fafc' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color:'#0891b2' }}>
                      {Number(sgpa).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">SGPA (Last Sem)</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Subject-wise attendance bars */}
              {Object.keys(courseAtt).length > 0 && (
                <Box sx={{ mt:2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                    Subject-wise Attendance
                  </Typography>
                  {Object.values(courseAtt).map((c, i) => {
                    const pct = c.total ? (c.present/c.total)*100 : 0;
                    return (
                      <Box key={i} sx={{ mb:1.5 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                          <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                          <Typography variant="body2" sx={{ color: pct>=75?'#059669':'#dc2626', fontWeight:700 }}>
                            {c.present}/{c.total} — {pct.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height:8, borderRadius:4,
                            bgcolor: pct>=75?'#dcfce7':'#fee2e2',
                            '& .MuiLinearProgress-bar':{ bgcolor: pct>=75?'#059669':'#dc2626' }
                          }} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}