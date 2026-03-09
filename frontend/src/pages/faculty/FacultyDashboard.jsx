import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Box, Card, CardContent, Typography, Button, Chip, Divider,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar
} from '@mui/material';
import { School, CalendarMonth, Assessment, Add, People, LibraryBooks } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { scheduleAPI, examAPI, userAPI, courseAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS } from '../../theme/theme';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [exams,     setExams]     = useState([]);
  const [students,  setStudents]  = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      scheduleAPI.getMySchedules(),
      examAPI.getUpcoming(),
      userAPI.getStudents(),
      courseAPI.getAll(),
    ]).then(([sch, ex, stu, crs]) => {
      if (sch.status === 'fulfilled') setSchedules(sch.value.data.data || []);
      if (ex.status === 'fulfilled')  setExams(ex.value.data.data || []);
      if (stu.status === 'fulfilled') setStudents(stu.value.data.data || []);
      if (crs.status === 'fulfilled') setCourses(crs.value.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  const recentSchedules = schedules.slice(0, 5);

  return (
    <Box>
      <PageHeader
        title="Faculty Dashboard"
        subtitle={`Welcome, ${user?.name} — ${user?.department}`}
        breadcrumbs={['Home', 'Faculty Dashboard']}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/faculty/schedule')}
            sx={{ bgcolor: COLORS.secondary }}>Add Class Topic</Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { icon:<People />,      label:'Total Students', value:students.length, color:COLORS.secondary },
          { icon:<School />,      label:'Courses',        value:courses.length,  color:COLORS.primary },
          { icon:<LibraryBooks />,label:'Topics Logged',  value:schedules.length, color:COLORS.excellent },
          { icon:<Assessment />,  label:'Upcoming Exams', value:exams.length,    color:COLORS.accent },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...s} /></Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Recent Teaching Schedule */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Teaching Schedule</Typography>
                <Button size="small" onClick={() => navigate('/faculty/schedule')}
                  sx={{ color: COLORS.secondary }}>View All</Button>
              </Box>
              {recentSchedules.length === 0 ? (
                <Box sx={{ textAlign:'center', py:4 }}>
                  <LibraryBooks sx={{ fontSize:48, color: COLORS.textMuted, mb:1 }} />
                  <Typography color="textSecondary">No schedules yet. Start logging your class topics!</Typography>
                  <Button variant="outlined" sx={{ mt:2 }} onClick={() => navigate('/faculty/schedule')}>
                    Add First Schedule
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                        {['Date','Course','Topic','Method'].map(h => (
                          <TableCell key={h} sx={{ fontWeight:700, fontSize:11 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentSchedules.map((s, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize:11 }}>{s.scheduleDate}</TableCell>
                          <TableCell>
                            <Chip label={s.course?.courseCode} size="small" sx={{ bgcolor: COLORS.bgBase, fontSize:10 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize:11, fontWeight:600 }}>{s.topicCovered}</TableCell>
                          <TableCell>
                            <Chip label={s.teachingMethod || 'Lecture'} size="small" variant="outlined" sx={{ fontSize:10 }} />
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

        {/* Right panel */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
              {[
                { label:'Log Today\'s Class Topics', path:'/faculty/schedule', icon:<Add />, color: COLORS.secondary },
                { label:'Mark Attendance', path:'/student/attendance', icon:<CalendarMonth />, color: COLORS.primary },
                { label:'Publish Results', path:'/student/results', icon:<Assessment />, color: COLORS.excellent },
                { label:'View Students', path:'/admin/students', icon:<People />, color: COLORS.accent },
              ].map((btn, i) => (
                <Button key={i} fullWidth variant="outlined" startIcon={btn.icon}
                  sx={{ mb:1, justifyContent:'flex-start', color:btn.color, borderColor:btn.color,
                        '&:hover':{ bgcolor:`${btn.color}10` } }}
                  onClick={() => navigate(btn.path)}>
                  {btn.label}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Students ({students.length})</Typography>
              {students.slice(0,5).map((s, i) => (
                <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1.5 }}>
                  <Avatar sx={{ width:30, height:30, bgcolor: COLORS.secondary, fontSize:12 }}>{s.name?.[0]}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{s.enrollmentNumber}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
