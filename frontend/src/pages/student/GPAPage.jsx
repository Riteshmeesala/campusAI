import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { TrendingUp, School } from '@mui/icons-material';
import { gpaAPI, resultAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';

const gradeColor = g => {
  if (g === 'O' || g === 'A+') return COLORS.excellent;
  if (g === 'A' || g === 'B+') return COLORS.secondary;
  if (g === 'B' || g === 'C') return COLORS.moderate;
  return COLORS.critical;
};

export default function GPAPage() {
  const { user } = useAuth();
  const [gpa,     setGpa]     = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.allSettled([gpaAPI.getMyGpa(), resultAPI.getMyResults()])
      .then(([g, r]) => {
        if (g.status === 'fulfilled') setGpa(g.value.data.data);
        if (r.status === 'fulfilled') setResults(r.value.data.data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  const cgpa = gpa?.cgpa || 0;
  const sgpa = gpa?.sgpa || 0;
  const level = cgpa >= 9 ? {label:'Outstanding', color: COLORS.excellent} :
                cgpa >= 8 ? {label:'Excellent', color: COLORS.excellent} :
                cgpa >= 7 ? {label:'Very Good', color: COLORS.secondary} :
                cgpa >= 6 ? {label:'Good', color: COLORS.secondary} :
                            {label:'Needs Improvement', color: COLORS.critical};

  // Grade scale reference
  const gradeScale = [
    { grade:'O',  range:'90-100%', points:10 },
    { grade:'A+', range:'80-89%',  points:9 },
    { grade:'A',  range:'70-79%',  points:8 },
    { grade:'B+', range:'60-69%',  points:7 },
    { grade:'B',  range:'50-59%',  points:6 },
    { grade:'C',  range:'40-49%',  points:5 },
    { grade:'F',  range:'<40%',    points:0 },
  ];

  return (
    <Box>
      <PageHeader title="GPA Calculator" subtitle="CGPA & SGPA based on your exam results" breadcrumbs={['Home','GPA']} />
      <Grid container spacing={2.5}>
        {/* CGPA/SGPA cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ textAlign:'center', border: `2px solid ${COLORS.secondary}` }}>
            <CardContent sx={{ py: 3 }}>
              <TrendingUp sx={{ fontSize:40, color: COLORS.secondary, mb:1 }} />
              <Typography variant="h2" fontWeight={800} color={COLORS.secondary}>{cgpa.toFixed(2)}</Typography>
              <Typography variant="h6" color="textSecondary">CGPA / 10.0</Typography>
              <Chip label={level.label} sx={{ mt:1, bgcolor: level.color, color:'#fff' }} />
              <Typography variant="body2" color="textSecondary" mt={1}>
                Based on {gpa?.passedResults || 0} passed exams
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ textAlign:'center', border: `2px solid ${COLORS.excellent}` }}>
            <CardContent sx={{ py: 3 }}>
              <School sx={{ fontSize:40, color: COLORS.excellent, mb:1 }} />
              <Typography variant="h2" fontWeight={800} color={COLORS.excellent}>{sgpa.toFixed(2)}</Typography>
              <Typography variant="h6" color="textSecondary">SGPA / 10.0</Typography>
              <Chip label="Semester 4" sx={{ mt:1, bgcolor: COLORS.excellent, color:'#fff' }} />
              <Typography variant="body2" color="textSecondary" mt={1}>Current semester performance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Grade Scale (10-point)</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: COLORS.bgBase }}>
                    {['Grade','Marks %','Grade Points'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, fontSize:11 }}>{h}</TableCell>
                    ))}
                  </TableRow></TableHead>
                  <TableBody>
                    {gradeScale.map(g => (
                      <TableRow key={g.grade}>
                        <TableCell>
                          <Chip label={g.grade} size="small" sx={{ bgcolor: gradeColor(g.grade), color:'#fff', fontSize:11 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize:11 }}>{g.range}</TableCell>
                        <TableCell sx={{ fontSize:11, fontWeight:700 }}>{g.points}.0</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Subject-wise Grade Points</Typography>
              {results.length === 0 ? (
                <Typography color="textSecondary">No results yet. Marks will appear once faculty publishes them.</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                        {['Exam', 'Course', 'Marks', 'Percentage', 'Grade', 'Grade Points', 'Status', 'Semester'].map(h => (
                          <TableCell key={h} sx={{ fontWeight:700, fontSize:12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize:12 }}>{r.exam?.examName}</TableCell>
                          <TableCell sx={{ fontSize:12 }}>{r.exam?.course?.courseName} ({r.exam?.course?.courseCode})</TableCell>
                          <TableCell sx={{ fontSize:12, fontWeight:600 }}>{r.marksObtained}/{r.exam?.totalMarks}</TableCell>
                          <TableCell sx={{ fontSize:12 }}>{r.percentage?.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Chip label={r.grade} size="small" sx={{ bgcolor: gradeColor(r.grade), color:'#fff' }} />
                          </TableCell>
                          <TableCell sx={{ fontSize:14, fontWeight:700, color: COLORS.secondary }}>
                            {r.gradePoints?.toFixed(1) || '0.0'}
                          </TableCell>
                          <TableCell>
                            <Chip label={r.pass ? '✅ Pass' : '❌ Fail'} size="small"
                              sx={{ bgcolor: r.pass ? COLORS.greenBg : '#fee2e2',
                                    color: r.pass ? COLORS.excellent : COLORS.critical }} />
                          </TableCell>
                          <TableCell sx={{ fontSize:12 }}>Sem {r.exam?.semester || 4}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
