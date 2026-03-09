import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Box, Card, CardContent, Typography, Chip, Table, Button,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Avatar, LinearProgress, Divider, IconButton
} from '@mui/material';
import { People, School, Payment, TrendingUp, Warning, Visibility, Groups } from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { userAPI, feeAPI, examAPI, gpaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { COLORS } from '../../theme/theme';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [exams,    setExams]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userAPI.getStudents(),
      userAPI.getStats(),
      examAPI.getUpcoming(),
    ]).then(([stu, st, ex]) => {
      if (stu.status === 'fulfilled') setStudents(stu.value.data.data || []);
      if (st.status === 'fulfilled')  setStats(st.value.data.data);
      if (ex.status === 'fulfilled')  setExams(ex.value.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  const totalStudents = stats?.totalStudents || students.length;
  const totalFaculty  = stats?.totalFaculty  || 0;

  const barData = {
    labels: students.slice(0,5).map(s => s.name?.split(' ')[0]),
    datasets: [
      { label: 'Students',
        data: students.slice(0,5).map((_, i) => 60 + i * 5),
        backgroundColor: `${COLORS.secondary}cc`, borderRadius: 6 },
    ]
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { max: 100, grid: { color: '#f1f5f9' } } }
  };

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome, ${user?.name} — Complete system overview`}
        breadcrumbs={['Home','Admin Dashboard']}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { icon:<People />,     label:'Total Students', value:totalStudents,  color:COLORS.secondary },
          { icon:<Groups />,     label:'Faculty Members',value:totalFaculty,   color:COLORS.primary },
          { icon:<School />,     label:'Upcoming Exams', value:exams.length,   color:COLORS.excellent },
          { icon:<Payment />,    label:'System Status',  value:'Active',       color:COLORS.accent },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...s} /></Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Students Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
                <Typography variant="h6" fontWeight={700}>All Students</Typography>
                <Button size="small" endIcon={<Visibility />} onClick={() => navigate('/admin/students')}
                  sx={{ color: COLORS.secondary }}>View All</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                      {['Name','Enrollment','Department','Email','Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight:700, fontSize:11 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.slice(0,8).map((s, i) => (
                      <TableRow key={i} hover sx={{ cursor:'pointer' }} onClick={() => navigate(`/admin/students/${s.id}`)}>
                        <TableCell>
                          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                            <Avatar sx={{ width:26, height:26, bgcolor: COLORS.secondary, fontSize:11 }}>{s.name?.[0]}</Avatar>
                            <Typography variant="body2" sx={{ fontSize:12 }}>{s.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize:11 }}>{s.enrollmentNumber}</TableCell>
                        <TableCell sx={{ fontSize:11 }}>{s.department}</TableCell>
                        <TableCell sx={{ fontSize:11 }}>{s.email}</TableCell>
                        <TableCell>
                          <Chip label={s.active ? 'Active' : 'Inactive'} size="small"
                            sx={{ fontSize:10, bgcolor: s.active ? COLORS.greenBg : '#fee2e2',
                                  color: s.active ? COLORS.excellent : COLORS.critical }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
              {[
                { label:'Manage Students', path:'/admin/students', color: COLORS.secondary },
                { label:'Manage Faculty',  path:'/admin/faculty',  color: COLORS.primary },
                { label:'View All Exams',  path:'/student/exams',  color: COLORS.excellent },
                { label:'Fee Management',  path:'/student/fees',   color: COLORS.accent },
                { label: 'Publish CGPA',    path: '/admin/publish-cgpa', color: COLORS.excellent }, 
              ].map((btn, i) => (
                <Button key={i} fullWidth variant="outlined" sx={{ mb:1, justifyContent:'flex-start',
                  color: btn.color, borderColor: btn.color, '&:hover':{ bgcolor: `${btn.color}10` } }}
                  onClick={() => navigate(btn.path)}>
                  {btn.label}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Upcoming Exams ({exams.length})</Typography>
              {exams.slice(0,4).map((e, i) => (
                <Box key={i} sx={{ mb:1.5, pb:1.5, borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <Typography variant="body2" fontWeight={600}>{e.examName}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {e.course?.courseCode} • {e.scheduledDate?.split('T')[0]}
                  </Typography>
                </Box>
              ))}
              {exams.length === 0 && <Typography variant="body2" color="textSecondary">No upcoming exams</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
