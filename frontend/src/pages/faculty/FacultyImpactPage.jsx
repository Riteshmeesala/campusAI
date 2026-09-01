import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Rating, LinearProgress, Avatar, Tabs, Tab, Divider,
  TextField, MenuItem, IconButton
} from '@mui/material';
import {
  WorkspacePremium, Star, EmojiEvents, ThumbUp, Feedback,
  AutoGraph, TrendingUp, Download, AccountBalance, School,
  AssignmentTurnedIn, Psychology, Add, Edit, Delete
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function FacultyImpactPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = parseInt(queryParams.get('tab') || '0', 10);
  const [tabIndex, setTabIndex] = useState(initialTab);

  useEffect(() => {
    const qTab = queryParams.get('tab');
    if (qTab !== null) {
      setTabIndex(parseInt(qTab, 10));
    }
  }, [location.search]);

  const tabLabels = [
    'Faculty Achievement',
    'Governance & Administration',
    'Teaching Improvements',
    'Duties Performed'
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Faculty Impact & Recognitions"
        subtitle="Institutional honors, academic governance duties, pedagogical innovations, and statutory duties performed"
        breadcrumbs={['Home', 'Academic Management', 'Faculty Impact & Recognitions', tabLabels[tabIndex]]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => toast.success('Exporting Faculty Recognition Dossier (.PDF)')}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Export Dossier (.PDF)
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => toast.info('Add new faculty achievement entry')}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
            >
              Add Record
            </Button>
          </Stack>
        }
      />

      {/* Tabs Header with All 4 Sub-Modules */}
      <Paper elevation={0} sx={{ borderBottom: `1px solid ${COLORS.border}`, mb: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => {
            setTabIndex(val);
            navigate(`/faculty/impact-recognitions?tab=${val}`, { replace: true });
          }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ px: 2 }}
        >
          <Tab icon={<EmojiEvents fontSize="small" />} iconPosition="start" label="Faculty Achievement" />
          <Tab icon={<AccountBalance fontSize="small" />} iconPosition="start" label="Governance & Administration" />
          <Tab icon={<Psychology fontSize="small" />} iconPosition="start" label="Teaching Improvements" />
          <Tab icon={<AssignmentTurnedIn fontSize="small" />} iconPosition="start" label="Duties Performed" />
        </Tabs>
      </Paper>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FACULTY ACHIEVEMENT (TAB 0)                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {tabIndex === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[
              { title: 'Best Researcher of the Year Award 2023', body: 'Conferred by State Council of Higher Education for high-impact Scopus AI publications and ₹12 Lakhs grant.', date: 'December 2023', badge: 'State Level Honor', color: '#16a34a' },
              { title: 'IEEE Senior Member Elevation', body: 'Conferred by IEEE USA in recognition of 10+ years of professional leadership and high-citation research.', date: 'August 2023', badge: 'International Recognition', color: '#2563eb' },
              { title: 'NPTEL Top 1% Elite+Gold Faculty Award', body: 'Top 1% performing mentor nationally for 12-week course on Cloud Computing & Deep Learning.', date: 'November 2023', badge: 'National Level', color: COLORS.secondary },
              { title: 'Indian Patent Grant: Smart Campus IoT Grid', body: 'Patent No. IN-498218-B awarded by Controller General of Patents, Designs and Trade Marks.', date: 'January 2024', badge: 'Patent Granted', color: '#d97706' },
            ].map((a, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip label={a.badge} size="small" sx={{ bgcolor: `${a.color}15`, color: a.color, fontWeight: 700 }} />
                      <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0f172a" mb={1}>{a.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{a.body}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. GOVERNANCE & ADMINISTRATION (TAB 1)                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {tabIndex === 1 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, px: 2.5, bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle1" fontWeight={700}>Institutional Administrative Portfolios & Committee Memberships</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Portfolio / Committee', 'Role Held', 'Tenure / Academic Term', 'Key Responsibilities', 'Status'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { committee: 'National Board of Accreditation (NBA) Core Cell', role: 'Department Coordinator', tenure: '2022 - Present', desc: 'Criterion 3 & 5 SAR dossier preparation, outcome measurement audits', status: 'ACTIVE' },
                    { committee: 'Board of Studies (BOS) - CSE Curriculum', role: 'Chairman / Member Secretary', tenure: '2023 - 2025', desc: 'R23 autonomous regulation curriculum revision and industry elective alignment', status: 'ACTIVE' },
                    { committee: 'Institutional Academic Council', role: 'Faculty Representative', tenure: '2023 - 2024', desc: 'Academic calendar approval, exam regulations, and credit transfers', status: 'ACTIVE' },
                    { committee: 'Anti-Ragging & Student Grievance Redressal Cell', role: 'Senior Member', tenure: '2021 - Present', desc: 'Hostel and campus safety vigil patrols and discipline reporting', status: 'ACTIVE' },
                  ].map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{r.committee}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>{r.role}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{r.tenure}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{r.desc}</TableCell>
                      <TableCell><Chip label={r.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. TEACHING IMPROVEMENTS (TAB 2)                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {tabIndex === 2 && (
        <Grid container spacing={3}>
          {[
            { title: 'Interactive Flipped Classroom & Virtual Lab Integration', desc: 'Created 24 micro-lecture videos for Operating System process synchronization; students complete coding challenges before lectures.', metric: 'Student pass percentage improved from 82% to 94%' },
            { title: 'AI-Assisted Code Autograding in Full-Stack Lab', desc: 'Integrated real-time automated unit testing suites in CS405 lab sessions, giving students instant feedback on submitted pull requests.', metric: '100% lab exercise completion rate on GitHub Classroom' },
            { title: 'MOOC & NPTEL Video Lectures Curation', desc: 'Mapped Swayam/NPTEL advanced modules to Unit 4 & 5 syllabus, enabling 45 students to earn NPTEL course certifications.', metric: '45 Students certified with Elite & Silver medals' },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={1}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{item.desc}</Typography>
                  <Paper sx={{ p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block' }}>
                      Measurable Impact: {item.metric}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. DUTIES PERFORMED (TAB 3)                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {tabIndex === 3 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle1" fontWeight={700}>Statutory Examination & Institutional Duties Record</Typography>
              <Chip label="Academic Year 2023-24" size="small" color="primary" sx={{ fontWeight: 600 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Duty Category', 'Assignment Description', 'Assigned Slot / Dates', 'Duty Hours / Days', 'Certified By'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { cat: 'University Examination', desc: 'Chief Superintendent - Mid-Term 1 Exams', date: '26 Feb 2024 - 02 Mar 2024', hrs: '30 Hours', by: 'Controller of Examinations (COE)' },
                    { cat: 'Evaluation & Coding', desc: 'Chief Examiner - B.Tech CS401 Paper Valuation', date: '10 Dec 2023 - 18 Dec 2023', hrs: '350 Answer Scripts', by: 'University Spot Valuation Camp' },
                    { cat: 'Laboratory Stock Verification', desc: 'Annual Computing Labs Hardware & License Audit', date: '02 Jan 2024 - 04 Jan 2024', hrs: '3 Days', by: 'Principal / Registrar' },
                    { cat: 'Admission Counselling', desc: 'B.Tech Engineering Admission Desk & Verification', date: '15 Jul 2023 - 22 Jul 2023', hrs: '1 Week', by: 'Director of Admissions' },
                  ].map((d, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Chip label={d.cat} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: 10 }} /></TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{d.desc}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{d.date}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700, color: COLORS.secondary }}>{d.hrs}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{d.by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
