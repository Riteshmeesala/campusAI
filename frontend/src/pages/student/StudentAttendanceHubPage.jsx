import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, MenuItem, TextField
} from '@mui/material';
import {
  CalendarMonth, BarChart, CheckCircle, Download, Search
} from '@mui/icons-material';

// Comprehensive subject catalogs across all semesters
const SEMESTER_CURRICULUM = {
  '4-1': [
    { code: 'CS701PC', name: 'Cloud Computing & Distributed Systems', faculty: 'Dr. Ramesh Sharma', conducted: 44, attended: 40, pct: 90.9, status: 'Safe' },
    { code: 'CS702PC', name: 'Machine Learning & Neural Networks', faculty: 'Prof. Ananya Sen', conducted: 42, attended: 38, pct: 90.5, status: 'Safe' },
    { code: 'CS703PE', name: 'Information Security & Cryptography', faculty: 'Dr. K. V. Rao', conducted: 38, attended: 32, pct: 84.2, status: 'Safe' },
    { code: 'CS704PE', name: 'Compiler Design', faculty: 'Dr. S. Mukherjee', conducted: 36, attended: 28, pct: 77.8, status: 'Safe' },
    { code: 'CS705PC', name: 'Full Stack Web Development Lab', faculty: 'Prof. Rajesh K.', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' },
    { code: 'CS706PC', name: 'AI & Deep Learning Lab', faculty: 'Dr. Ramesh Sharma', conducted: 16, attended: 15, pct: 93.8, status: 'Safe' },
    { code: 'CS707PW', name: 'Major Project Phase - I', faculty: 'Dr. S. K. Sharma', conducted: 12, attended: 12, pct: 100.0, status: 'Safe' }
  ],
  '4-2': [
    { code: 'CS801PC', name: 'DevOps & Cloud Native Architecture', faculty: 'Dr. Ramesh Sharma', conducted: 36, attended: 33, pct: 91.7, status: 'Safe' },
    { code: 'CS802PE', name: 'Cyber Physical Systems & IoT', faculty: 'Prof. K. Swamy', conducted: 34, attended: 30, pct: 88.2, status: 'Safe' },
    { code: 'CS803PE', name: 'Deep Generative AI & Large Language Models', faculty: 'Prof. Ananya Sen', conducted: 38, attended: 35, pct: 92.1, status: 'Safe' },
    { code: 'CS804PW', name: 'Major Project Phase - II & Dissertation', faculty: 'Dr. S. K. Sharma', conducted: 24, attended: 24, pct: 100.0, status: 'Safe' }
  ],
  '3-1': [
    { code: 'CS501PC', name: 'Database Management Systems', faculty: 'Dr. B. Raman', conducted: 48, attended: 43, pct: 89.6, status: 'Safe' },
    { code: 'CS502PC', name: 'Operating Systems Principles', faculty: 'Dr. Ramesh Sharma', conducted: 46, attended: 41, pct: 89.1, status: 'Safe' },
    { code: 'CS503PC', name: 'Computer Networks', faculty: 'Prof. M. Verma', conducted: 44, attended: 38, pct: 86.4, status: 'Safe' },
    { code: 'CS504PC', name: 'Software Engineering & Agile Methodologies', faculty: 'Prof. Ananya Sen', conducted: 40, attended: 36, pct: 90.0, status: 'Safe' },
    { code: 'CS505PC', name: 'DBMS & SQL Hands-on Lab', faculty: 'Dr. B. Raman', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' },
    { code: 'CS506PC', name: 'Operating Systems Linux Kernel Lab', faculty: 'Dr. Ramesh Sharma', conducted: 16, attended: 15, pct: 93.8, status: 'Safe' }
  ],
  '3-2': [
    { code: 'CS601PC', name: 'Design and Analysis of Algorithms', faculty: 'Dr. S. Mukherjee', conducted: 50, attended: 45, pct: 90.0, status: 'Safe' },
    { code: 'CS602PC', name: 'Web Technologies & REST Frameworks', faculty: 'Prof. Rajesh K.', conducted: 44, attended: 40, pct: 90.9, status: 'Safe' },
    { code: 'CS603PC', name: 'Formal Languages and Automata Theory', faculty: 'Dr. K. V. Rao', conducted: 42, attended: 36, pct: 85.7, status: 'Safe' },
    { code: 'CS604PC', name: 'Data Warehousing & Business Intelligence', faculty: 'Prof. Ananya Sen', conducted: 40, attended: 37, pct: 92.5, status: 'Safe' },
    { code: 'CS605PC', name: 'Web Technologies Lab', faculty: 'Prof. Rajesh K.', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' },
    { code: 'CS606PC', name: 'Algorithms Implementation Lab', faculty: 'Dr. S. Mukherjee', conducted: 16, attended: 15, pct: 93.8, status: 'Safe' }
  ],
  '2-1': [
    { code: 'CS301PC', name: 'Data Structures and Algorithms', faculty: 'Dr. S. Mukherjee', conducted: 52, attended: 48, pct: 92.3, status: 'Safe' },
    { code: 'CS302PC', name: 'Discrete Mathematics', faculty: 'Dr. P. Sharma', conducted: 46, attended: 40, pct: 87.0, status: 'Safe' },
    { code: 'CS303PC', name: 'Digital Logic Design & Microprocessors', faculty: 'Prof. V. Reddy', conducted: 44, attended: 39, pct: 88.6, status: 'Safe' },
    { code: 'CS304PC', name: 'Object Oriented Programming with Java', faculty: 'Prof. Rajesh K.', conducted: 46, attended: 42, pct: 91.3, status: 'Safe' },
    { code: 'CS305PC', name: 'Data Structures Lab in C++', faculty: 'Dr. S. Mukherjee', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' },
    { code: 'CS306PC', name: 'Java Programming Lab', faculty: 'Prof. Rajesh K.', conducted: 16, attended: 15, pct: 93.8, status: 'Safe' }
  ],
  '2-2': [
    { code: 'CS401PC', name: 'Computer Organization & Architecture', faculty: 'Prof. V. Reddy', conducted: 48, attended: 42, pct: 87.5, status: 'Safe' },
    { code: 'CS402PC', name: 'Python for Data Science & Automation', faculty: 'Prof. Ananya Sen', conducted: 46, attended: 43, pct: 93.5, status: 'Safe' },
    { code: 'CS403PC', name: 'Probability, Statistics & Queueing Theory', faculty: 'Dr. P. Sharma', conducted: 44, attended: 39, pct: 88.6, status: 'Safe' },
    { code: 'CS404PC', name: 'Universal Human Values & Professional Ethics', faculty: 'Prof. Meera Nair', conducted: 32, attended: 30, pct: 93.8, status: 'Safe' },
    { code: 'CS405PC', name: 'Python Programming Lab', faculty: 'Prof. Ananya Sen', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' }
  ],
  '1-1': [
    { code: 'BS101MA', name: 'Linear Algebra and Calculus', faculty: 'Dr. P. Sharma', conducted: 50, attended: 46, pct: 92.0, status: 'Safe' },
    { code: 'BS102PH', name: 'Engineering Physics & Optics', faculty: 'Dr. K. Swamy', conducted: 46, attended: 41, pct: 89.1, status: 'Safe' },
    { code: 'ES103CS', name: 'Programming for Problem Solving with C', faculty: 'Prof. Rajesh K.', conducted: 48, attended: 45, pct: 93.8, status: 'Safe' },
    { code: 'ES104EE', name: 'Basic Electrical & Electronics Engineering', faculty: 'Prof. V. Reddy', conducted: 44, attended: 38, pct: 86.4, status: 'Safe' },
    { code: 'ES105CS', name: 'C Programming Laboratory', faculty: 'Prof. Rajesh K.', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' }
  ],
  '1-2': [
    { code: 'BS201MA', name: 'Advanced Differential Equations & Transforms', faculty: 'Dr. P. Sharma', conducted: 48, attended: 44, pct: 91.7, status: 'Safe' },
    { code: 'BS202CH', name: 'Engineering Chemistry & Materials', faculty: 'Dr. M. Rao', conducted: 44, attended: 39, pct: 88.6, status: 'Safe' },
    { code: 'ES203CS', name: 'Data Structures Fundamentals using C', faculty: 'Dr. S. Mukherjee', conducted: 48, attended: 45, pct: 93.8, status: 'Safe' },
    { code: 'HS204EN', name: 'English for Technical Communication', faculty: 'Prof. Meera Nair', conducted: 36, attended: 34, pct: 94.4, status: 'Safe' },
    { code: 'ES205CS', name: 'Data Structures Laboratory', faculty: 'Dr. S. Mukherjee', conducted: 16, attended: 16, pct: 100.0, status: 'Safe' }
  ]
};

// Generate realistic day-wise logs for any given month & year
const generateDailyLogs = (monthName, yearNum, semester) => {
  const monthMap = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  const mIndex = monthMap[monthName] !== undefined ? monthMap[monthName] : 8;
  const daysInMonth = new Date(yearNum, mIndex + 1, 0).getDate();
  const logs = [];

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(yearNum, mIndex, d);
    const dayOfWeek = weekdays[curDate.getDay()];
    const dateStr = `${d < 10 ? '0' + d : d} ${monthName.slice(0, 3)} ${yearNum}`;

    if (dayOfWeek === 'Sunday') {
      logs.push({
        date: dateStr,
        day: dayOfWeek,
        period1: 'SUN', period2: 'SUN', period3: 'SUN', period4: 'SUN', period5: 'SUN', period6: 'SUN',
        totalDay: '0 / 0',
        status: 'Holiday'
      });
    } else if (dayOfWeek === 'Saturday' && (d === 13 || d === 27)) {
      // 2nd & 4th Saturday Holiday
      logs.push({
        date: dateStr,
        day: dayOfWeek,
        period1: 'HOL', period2: 'HOL', period3: 'HOL', period4: 'HOL', period5: 'HOL', period6: 'HOL',
        totalDay: '0 / 0',
        status: '2nd/4th Saturday'
      });
    } else if (d === 4 || d === 18) {
      // Approved On-Duty participation (Hackathon/Conference)
      logs.push({
        date: dateStr,
        day: dayOfWeek,
        period1: 'OD', period2: 'OD', period3: 'OD', period4: 'OD', period5: 'OD', period6: 'OD',
        totalDay: '6 / 6 (OD)',
        status: 'On-Duty'
      });
    } else if (d === 8 || d === 22) {
      // Partial attendance
      logs.push({
        date: dateStr,
        day: dayOfWeek,
        period1: 'A', period2: 'P', period3: 'P', period4: 'P', period5: 'P', period6: 'P',
        totalDay: '5 / 6',
        status: 'Partial'
      });
    } else {
      // Full attendance
      logs.push({
        date: dateStr,
        day: dayOfWeek,
        period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P', period6: 'P',
        totalDay: '6 / 6',
        status: 'Present'
      });
    }
  }
  return logs;
};

export default function StudentAttendanceHubPage({ initialTab = 1 }) {
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [selectedSemester, setSelectedSemester] = useState('4-1');
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Active curriculum data for selected semester
  const activeSubjectList = useMemo(() => {
    return SEMESTER_CURRICULUM[selectedSemester] || SEMESTER_CURRICULUM['4-1'];
  }, [selectedSemester, searchTrigger]);

  // Active day-by-day logs for the month
  const activeDailyLogs = useMemo(() => {
    return generateDailyLogs(selectedMonth, parseInt(selectedYear, 10), selectedSemester);
  }, [selectedMonth, selectedYear, selectedSemester, searchTrigger]);

  const totalHeld = useMemo(() => {
    return activeSubjectList.reduce((acc, c) => acc + c.conducted, 0);
  }, [activeSubjectList]);

  const totalAtt = useMemo(() => {
    return activeSubjectList.reduce((acc, c) => acc + c.attended, 0);
  }, [activeSubjectList]);

  const overallPct = useMemo(() => {
    if (totalHeld === 0) return '0.0';
    return ((totalAtt / totalHeld) * 100).toFixed(1);
  }, [totalHeld, totalAtt]);

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Breadcrumb & Institutional Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart sx={{ color: '#2563eb' }} /> Attendance
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Student Attendance & Biometric Analytics Portal
          </Typography>
        </Box>

        {/* Filters Bar matching user institutional UI */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <TextField
            select
            label="Semester *"
            size="small"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map((sem) => (
              <MenuItem key={sem} value={sem}>{sem}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Month *"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Year *"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            {['2026', '2025', '2024', '2023'].map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{
              minWidth: 44,
              height: 40,
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              borderRadius: 2,
              px: 2
            }}
          >
            <Search />
          </Button>
        </Paper>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>
              SEMESTER {selectedSemester} AGGREGATE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: Number(overallPct) >= 75 ? '#16a34a' : '#dc2626', mt: 0.5 }}>
              {overallPct}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Number(overallPct)}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 4,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': { bgcolor: Number(overallPct) >= 75 ? '#16a34a' : '#dc2626' }
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Minimum Mandated: 75.0%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>
              PERIODS ATTENDED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563eb', mt: 0.5 }}>
              {totalAtt} <Typography component="span" variant="h6" sx={{ color: '#64748b' }}>/ {totalHeld}</Typography>
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Includes 12 Approved On-Duty (OD) Hours
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>
              TOTAL PERIODS ABSENT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#e11d48', mt: 0.5 }}>
              {totalHeld - totalAtt}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Leaves & unexcused absence
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5 }}>
              SEE EXAMINATION STATUS
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#16a34a' }} /> ELIGIBLE
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
              Hall ticket clearance granted
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            bgcolor: '#ffffff',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, py: 2, minHeight: 48 },
            '& .Mui-selected': { color: '#2563eb' },
            '& .MuiTabs-indicator': { bgcolor: '#2563eb', height: 3 }
          }}
        >
          <Tab icon={<CalendarMonth fontSize="small" />} iconPosition="start" label={`Monthly Day-by-Day Sheet (${selectedMonth} ${selectedYear})`} />
          <Tab icon={<BarChart fontSize="small" />} iconPosition="start" label={`Semester ${selectedSemester} Subject-Wise Summary`} />
        </Tabs>
      </Paper>

      {/* Tab 0: Monthly Day-by-Day Sheet */}
      {tabIndex === 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Daily Attendance Matrix — {selectedMonth} {selectedYear} (Semester {selectedSemester})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Biometric Punch & Faculty Verified RFID Classroom Attendance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="P: Present" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700 }} />
              <Chip label="A: Absent" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700 }} />
              <Chip label="OD: On-Duty" size="small" sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 700 }} />
              <Chip label="SUN/HOL: Holiday" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700 }} />
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 700, color: '#334155' } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell align="center">Period 1<br /><Typography variant="caption" sx={{ color: '#64748b' }}>09:00 - 10:00</Typography></TableCell>
                  <TableCell align="center">Period 2<br /><Typography variant="caption" sx={{ color: '#64748b' }}>10:00 - 11:00</Typography></TableCell>
                  <TableCell align="center">Period 3<br /><Typography variant="caption" sx={{ color: '#64748b' }}>11:15 - 12:15</Typography></TableCell>
                  <TableCell align="center">Period 4<br /><Typography variant="caption" sx={{ color: '#64748b' }}>12:15 - 01:15</Typography></TableCell>
                  <TableCell align="center">Period 5<br /><Typography variant="caption" sx={{ color: '#64748b' }}>02:00 - 03:00</Typography></TableCell>
                  <TableCell align="center">Period 6<br /><Typography variant="caption" sx={{ color: '#64748b' }}>03:00 - 04:00</Typography></TableCell>
                  <TableCell align="center">Day Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeDailyLogs.map((log, i) => (
                  <TableRow key={i} hover sx={{ bgcolor: log.day === 'Sunday' ? '#f8fafc' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{log.date}</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 600 }}>{log.day}</TableCell>
                    {['period1', 'period2', 'period3', 'period4', 'period5', 'period6'].map((pKey) => {
                      const val = log[pKey];
                      return (
                        <TableCell key={pKey} align="center">
                          <Chip
                            label={val}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              minWidth: 36,
                              bgcolor: val === 'P' ? '#dcfce7' : val === 'A' ? '#fee2e2' : val === 'OD' ? '#e0e7ff' : '#f1f5f9',
                              color: val === 'P' ? '#166534' : val === 'A' ? '#991b1b' : val === 'OD' ? '#3730a3' : '#64748b',
                            }}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#0f172a' }}>{log.totalDay}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={log.status}
                        size="small"
                        color={log.status === 'Present' ? 'success' : log.status === 'On-Duty' ? 'info' : log.status === 'Partial' ? 'warning' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 1: Subject-Wise Attendance Aggregates */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Semester {selectedSemester} Subject-Wise Attendance Breakdown
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Course-wise period counts, attended percentages, and condonation compliance
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<Download />} size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Download PDF Report
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Course Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Course / Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Faculty In-Charge</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Conducted</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Attended</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Absent / OD</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 180 }}>Percentage</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeSubjectList.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{row.name}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{row.faculty}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{row.conducted}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#2563eb' }}>{row.attended}</TableCell>
                    <TableCell align="center" sx={{ color: '#64748b' }}>{row.conducted - row.attended}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={row.pct}
                          sx={{
                            flex: 1,
                            height: 7,
                            borderRadius: 4,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': { bgcolor: row.pct >= 75 ? '#16a34a' : '#ef4444' }
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: row.pct >= 75 ? '#16a34a' : '#ef4444', minWidth: 48 }}>
                          {row.pct}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.pct >= 75 ? 'Safe / Eligible' : 'Shortage'}
                        color={row.pct >= 75 ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#16a34a' }} />
            <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
              All subject attendances for Semester {selectedSemester} are compliant with the institutional 75.0% threshold. You are fully eligible for Semester End Examinations (SEE).
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
