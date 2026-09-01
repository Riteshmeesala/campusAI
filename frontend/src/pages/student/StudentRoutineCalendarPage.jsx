import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Divider
} from '@mui/material';
import {
  CalendarMonth, AccessTime, Download, Print,
  LocationOn, Person, Today, FilterList
} from '@mui/icons-material';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CLASS_ROUTINE = {
  Monday: [
    { time: '09:00 - 10:00 AM', subject: 'Cloud Computing & Distributed Systems', code: 'CS601PC', room: 'LH-302', faculty: 'Dr. Ramesh Sharma', type: 'Lecture', status: 'Completed' },
    { time: '10:00 - 11:00 AM', subject: 'Machine Learning & Neural Nets', code: 'CS602PC', room: 'LH-302', faculty: 'Prof. Ananya Sen', type: 'Lecture', status: 'Completed' },
    { time: '11:15 - 01:15 PM', subject: 'Full Stack Web Dev Lab', code: 'CS605PC', room: 'CS-LAB-4', faculty: 'Prof. Rajesh K.', type: 'Lab', status: 'Ongoing' },
    { time: '02:00 - 03:00 PM', subject: 'Information Security & Cryptography', code: 'CS603PC', room: 'LH-302', faculty: 'Dr. K. V. Rao', type: 'Lecture', status: 'Upcoming' },
    { time: '03:00 - 04:00 PM', subject: 'Constitution of India', code: 'MC601', room: 'Auditorium-B', faculty: 'Prof. Meera Nair', type: 'Tutorial', status: 'Upcoming' },
  ],
  Tuesday: [
    { time: '09:00 - 10:00 AM', subject: 'Machine Learning & Neural Nets', code: 'CS602PC', room: 'LH-302', faculty: 'Prof. Ananya Sen', type: 'Lecture', status: 'Upcoming' },
    { time: '10:00 - 11:00 AM', subject: 'Cloud Computing & Distributed Systems', code: 'CS601PC', room: 'LH-302', faculty: 'Dr. Ramesh Sharma', type: 'Lecture', status: 'Upcoming' },
    { time: '11:15 - 12:15 PM', subject: 'Compiler Design', code: 'CS604PC', room: 'LH-302', faculty: 'Dr. S. Mukherjee', type: 'Lecture', status: 'Upcoming' },
    { time: '01:00 - 03:00 PM', subject: 'AI & Deep Learning Mini Project', code: 'CS606PC', room: 'AI-LAB-2', faculty: 'Dr. Ramesh Sharma', type: 'Lab', status: 'Upcoming' },
    { time: '03:15 - 04:15 PM', subject: 'Technical Seminar & Communication', code: 'CS607PC', room: 'LH-302', faculty: 'Dr. Sneha Roy', type: 'Seminar', status: 'Upcoming' },
  ],
  Wednesday: [
    { time: '09:00 - 10:00 AM', subject: 'Compiler Design', code: 'CS604PC', room: 'LH-302', faculty: 'Dr. S. Mukherjee', type: 'Lecture', status: 'Upcoming' },
    { time: '10:00 - 11:00 AM', subject: 'Information Security & Cryptography', code: 'CS603PC', room: 'LH-302', faculty: 'Dr. K. V. Rao', type: 'Lecture', status: 'Upcoming' },
    { time: '11:15 - 01:15 PM', subject: 'Compiler Design Lab', code: 'CS608PC', room: 'CS-LAB-2', faculty: 'Dr. S. Mukherjee', type: 'Lab', status: 'Upcoming' },
    { time: '02:00 - 03:00 PM', subject: 'Cloud Computing & Distributed Systems', code: 'CS601PC', room: 'LH-302', faculty: 'Dr. Ramesh Sharma', type: 'Lecture', status: 'Upcoming' },
    { time: '03:00 - 04:00 PM', subject: 'Sports / Library Hour', code: 'GEN601', room: 'Sports Complex', faculty: 'Coach M. Singh', type: 'Activity', status: 'Upcoming' },
  ],
  Thursday: [
    { time: '09:00 - 10:00 AM', subject: 'Machine Learning & Neural Nets', code: 'CS602PC', room: 'LH-302', faculty: 'Prof. Ananya Sen', type: 'Lecture', status: 'Upcoming' },
    { time: '10:00 - 11:00 AM', subject: 'Information Security & Cryptography', code: 'CS603PC', room: 'LH-302', faculty: 'Dr. K. V. Rao', type: 'Lecture', status: 'Upcoming' },
    { time: '11:15 - 12:15 PM', subject: 'Open Elective - Renewable Energy', code: 'OE601', room: 'EE-104', faculty: 'Dr. B. Prasad', type: 'Lecture', status: 'Upcoming' },
    { time: '01:00 - 03:00 PM', subject: 'Cloud & DevOps Practical Workshop', code: 'CS609PC', room: 'CLOUD-LAB-1', faculty: 'Dr. Ramesh Sharma', type: 'Lab', status: 'Upcoming' },
    { time: '03:15 - 04:15 PM', subject: 'Mentoring & Grievance Counseling', code: 'MENTOR', room: 'Staff Room 3', faculty: 'Prof. Ananya Sen', type: 'Counseling', status: 'Upcoming' },
  ],
  Friday: [
    { time: '09:00 - 10:00 AM', subject: 'Compiler Design', code: 'CS604PC', room: 'LH-302', faculty: 'Dr. S. Mukherjee', type: 'Lecture', status: 'Upcoming' },
    { time: '10:00 - 11:00 AM', subject: 'Cloud Computing & Distributed Systems', code: 'CS601PC', room: 'LH-302', faculty: 'Dr. Ramesh Sharma', type: 'Lecture', status: 'Upcoming' },
    { time: '11:15 - 12:15 PM', subject: 'Machine Learning Tutorial', code: 'CS602PC', room: 'LH-302', faculty: 'Prof. Ananya Sen', type: 'Tutorial', status: 'Upcoming' },
    { time: '01:00 - 02:00 PM', subject: 'Constitution of India', code: 'MC601', room: 'Auditorium-B', faculty: 'Prof. Meera Nair', type: 'Lecture', status: 'Upcoming' },
    { time: '02:00 - 04:00 PM', subject: 'Industry Guest Lecture / Tech Club', code: 'CLUB', room: 'Main Seminar Hall', faculty: 'Guest Speaker', type: 'Event', status: 'Upcoming' },
  ],
  Saturday: [
    { time: '09:00 - 11:00 AM', subject: 'Coding Club & Hackathon Practice', code: 'HACK', room: 'Incubation Hub', faculty: 'Student Leads', type: 'Activity', status: 'Upcoming' },
    { time: '11:15 - 01:15 PM', subject: 'Placement Aptitude & Soft Skills', code: 'CRT601', room: 'LH-302', faculty: 'CRT Trainers', type: 'Training', status: 'Upcoming' },
  ]
};

const ACADEMIC_EVENTS = [
  { date: '15 Sep 2026', title: 'Mid-Term CIE-1 Examinations Commence', category: 'Exam', badgeColor: 'error' },
  { date: '22 Sep 2026', title: 'National Level Technical Symposium - InnovateX', category: 'Event', badgeColor: 'primary' },
  { date: '02 Oct 2026', title: 'Gandhi Jayanti (Institutional Holiday)', category: 'Holiday', badgeColor: 'warning' },
  { date: '10 Oct 2026', title: 'Capstone Project Mid-Phase Evaluation & Review', category: 'Academic', badgeColor: 'info' },
  { date: '28 Oct 2026', title: 'Pre-Placement Drive: Microsoft & Amazon', category: 'Placement', badgeColor: 'success' },
  { date: '12 Nov 2026', title: 'End Semester SEE Theory Examinations', category: 'Exam', badgeColor: 'error' },
];

export default function StudentRoutineCalendarPage({ initialTab = 0 }) {
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSemester, setSelectedSemester] = useState('B.Tech III Year - Sem II (CSE-A)');

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth sx={{ color: '#2563eb' }} /> Academic Calendar & Class Routine
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            View your real-time class timetable, room numbers, faculty schedules, and university calendar events.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<Download />} size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Export PDF
          </Button>
          <Button variant="contained" startIcon={<Print />} size="small" sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}>
            Print Routine
          </Button>
        </Box>
      </Box>

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
          <Tab icon={<AccessTime fontSize="small" />} iconPosition="start" label="Class Routine (Timetable)" />
          <Tab icon={<CalendarMonth fontSize="small" />} iconPosition="start" label="Institutional Academic Calendar" />
          <Tab icon={<Today fontSize="small" />} iconPosition="start" label="Weekly Routine Grid" />
        </Tabs>
      </Paper>

      {/* Tab 0: Class Routine Daily Breakdown */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {/* Day Selector Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList fontSize="small" /> Select Day
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {WEEKDAYS.map((day) => (
                  <Button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    variant={selectedDay === day ? 'contained' : 'outlined'}
                    sx={{
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: selectedDay === day ? '#2563eb' : 'transparent',
                      color: selectedDay === day ? '#ffffff' : '#334155',
                      borderColor: selectedDay === day ? '#2563eb' : '#e2e8f0',
                      '&:hover': {
                        bgcolor: selectedDay === day ? '#1d4ed8' : '#f1f5f9'
                      }
                    }}
                  >
                    <span>{day}</span>
                    <Chip
                      label={`${CLASS_ROUTINE[day]?.length || 0} slots`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: selectedDay === day ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: selectedDay === day ? '#ffffff' : '#64748b'
                      }}
                    />
                  </Button>
                ))}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
                ACADEMIC CLASS & SECTION
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                sx={{ bgcolor: '#f8fafc' }}
              >
                <MenuItem value="B.Tech III Year - Sem II (CSE-A)">B.Tech III Year - Sem II (CSE-A)</MenuItem>
                <MenuItem value="B.Tech III Year - Sem II (CSE-B)">B.Tech III Year - Sem II (CSE-B)</MenuItem>
                <MenuItem value="B.Tech III Year - Sem II (AI&DS)">B.Tech III Year - Sem II (AI&DS)</MenuItem>
              </TextField>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, display: 'block' }}>
                  ⚡ AI Routine Optimizer
                </Typography>
                <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                  No timetable clashes detected. Today's lab session starts at 11:15 AM in CS-LAB-4.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Periods List */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedDay}'s Class Schedule
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Current Academic Section: {selectedSemester}
                  </Typography>
                </Box>
                <Chip label={`${CLASS_ROUTINE[selectedDay]?.length || 0} Periods Scheduled`} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {CLASS_ROUTINE[selectedDay]?.map((slot, idx) => (
                  <Card
                    key={idx}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#93c5fd', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' }
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2563eb' }}>
                            <AccessTime fontSize="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {slot.time}
                            </Typography>
                          </Box>
                          <Chip
                            label={slot.type}
                            size="small"
                            sx={{
                              mt: 0.8,
                              bgcolor: slot.type === 'Lab' ? '#ecfdf5' : slot.type === 'Tutorial' ? '#fef3c7' : '#eff6ff',
                              color: slot.type === 'Lab' ? '#047857' : slot.type === 'Tutorial' ? '#b45309' : '#1d4ed8',
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {slot.subject}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                            Course Code: <strong>{slot.code}</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                              <Person sx={{ fontSize: 16 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{slot.faculty}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                              <LocationOn sx={{ fontSize: 16, color: '#ef4444' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{slot.room}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                          <Chip
                            label={slot.status}
                            size="small"
                            variant={slot.status === 'Completed' ? 'filled' : 'outlined'}
                            color={slot.status === 'Completed' ? 'success' : slot.status === 'Ongoing' ? 'primary' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Academic Calendar */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Academic Year 2026-2027 Key Dates & Deadlines
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Approved by Academic Senate & Controller of Examinations
              </Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Event & Activity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ACADEMIC_EVENTS.map((item, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{item.date}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{item.title}</TableCell>
                    <TableCell>
                      <Chip label={item.category} color={item.badgeColor} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Add to Reminders
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Full Weekly Routine Grid */}
      {tabIndex === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', overflowX: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Complete Weekly Master Timetable Matrix
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 800, border: '1px solid #e2e8f0' }}>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a', width: 120 }}>Day</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>09:00 - 10:00</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>10:00 - 11:00</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>11:15 - 01:15</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>02:00 - 03:00</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>03:00 - 04:00</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {WEEKDAYS.map((day) => (
                  <TableRow key={day} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#1e40af', bgcolor: '#f8fafc' }}>{day}</TableCell>
                    {CLASS_ROUTINE[day]?.slice(0, 5).map((p, pIdx) => (
                      <TableCell key={pIdx} sx={{ p: 1.5, verticalAlign: 'top', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          {p.code}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                          {p.room} • {p.faculty.split(' ')[1] || p.faculty}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
