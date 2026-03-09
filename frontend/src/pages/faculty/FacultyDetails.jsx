import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert
} from '@mui/material';
import { Email, Phone, School } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userAPI, scheduleAPI, courseAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';

export default function FacultyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const facultyId = id || user?.id;

  const [faculty,   setFaculty]   = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!facultyId) return;
    Promise.allSettled([
      userAPI.getById(facultyId),
      scheduleAPI.getFacultySchedules(facultyId),
    ]).then(([u, sch]) => {
      if (u.status === 'fulfilled') setFaculty(u.value.data.data);
      if (sch.status === 'fulfilled') setSchedules(sch.value.data.data || []);
      setLoading(false);
    });
  }, [facultyId]);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  // Group schedules by course
  const byCourse = {};
  schedules.forEach(s => {
    const code = s.course?.courseCode || 'Unknown';
    if (!byCourse[code]) byCourse[code] = { name: s.course?.courseName, topics: [] };
    byCourse[code].topics.push(s);
  });

  return (
    <Box>
      <PageHeader
        title="Faculty Profile"
        subtitle={faculty ? faculty.name : ''}
        breadcrumbs={['Home', 'Faculty', 'Profile']}
      />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: COLORS.primary, fontSize: 32, mx: 'auto', mb: 2 }}>
                {faculty?.name?.[0] || 'F'}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{faculty?.name}</Typography>
              <Chip label="FACULTY" size="small" sx={{ mt: 0.5, bgcolor: COLORS.primary, color: '#fff' }} />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'left' }}>
                {[
                  { icon: <Email fontSize="small" />, label: 'Email', value: faculty?.email },
                  { icon: <Phone fontSize="small" />, label: 'Phone', value: faculty?.phoneNumber },
                  { icon: <School fontSize="small" />, label: 'Department', value: faculty?.department },
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
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Teaching Schedule & Topics Covered</Typography>
              {schedules.length === 0 ? (
                <Typography color="textSecondary">No schedule records yet.</Typography>
              ) : (
                Object.entries(byCourse).map(([code, data]) => (
                  <Box key={code} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={COLORS.secondary} mb={1}>
                      {code} — {data.name}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                            {['Date', 'Topic', 'Sub-topics', 'Chapter', 'Method', 'Duration'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.topics.map((t, i) => (
                            <TableRow key={i} hover>
                              <TableCell sx={{ fontSize: 11 }}>{t.scheduleDate}</TableCell>
                              <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>{t.topicCovered}</TableCell>
                              <TableCell sx={{ fontSize: 11 }}>{t.subTopics || '-'}</TableCell>
                              <TableCell sx={{ fontSize: 11 }}>{t.chapterNumber || '-'}</TableCell>
                              <TableCell sx={{ fontSize: 11 }}>
                                <Chip label={t.teachingMethod || 'Lecture'} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell sx={{ fontSize: 11 }}>{t.durationHours}h</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
