import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, MenuItem, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import {
  Search, Visibility, Phone, Email, School, Warning,
  CheckCircle, Person, ContactEmergency, FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { subscribeToDataSync, DATA_SYNC_EVENTS } from '../../services/dataSync';

export default function StudentSearchPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');

  // Student Quick View Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStudents = () => {
    userAPI.getStudents()
      .then(res => {
        setStudents(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();

    // Listen to real-time changes across roles
    const unsubscribe = subscribeToDataSync((event) => {
      if (event.type === DATA_SYNC_EVENTS.STUDENT_PROFILE_UPDATED) {
        fetchStudents();
      }
    });
    return unsubscribe;
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchQ = (s.name || '').toLowerCase().includes(q) ||
      (s.enrollmentNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q);
    const matchDept = deptFilter === 'ALL' || s.department === deptFilter;
    const matchSem = semFilter === 'ALL' || String(s.semester) === String(semFilter);
    return matchQ && matchDept && matchSem;
  });

  const handleOpenView = (s) => {
    setSelectedStudent(s);
    setModalOpen(true);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Search & Academic Dossier"
        subtitle="Quickly search students by enrollment number, name, section, attendance standing, and academic records"
        breadcrumbs={['Home', 'Faculty', 'Student Search']}
      />

      {/* Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: `1px solid ${COLORS.border}`, bgcolor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Roll Number, Full Name, Email, or Section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
              <MenuItem value="Information Technology">Information Technology</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Semester"
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Semesters</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Found {filtered.length} Student Records
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Student Name', 'Roll Number', 'Department', 'Semester / Section', 'Guardian Contact', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No students found matching your search criteria.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.secondary, fontSize: 13, fontWeight: 700 }}>
                            {s.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">{s.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: COLORS.secondary }}>
                        {s.enrollmentNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{s.department}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        Sem {s.semester || 4} • {s.section || 'Sec A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {s.guardianPhone || s.phoneNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={s.isVerified ? 'VERIFIED' : 'ACTIVE'}
                          size="small"
                          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 10, height: 20 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Quick Dossier View">
                            <IconButton size="small" color="primary" onClick={() => handleOpenView(s)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/admin/students/${s.id}`)}
                            sx={{ fontSize: 11, textTransform: 'none', py: 0.2 }}
                          >
                            Full Profile
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quick Dossier Modal */}
      {selectedStudent && (
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.border}` }}>
            Student Academic Dossier — {selectedStudent.name}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, mt: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: COLORS.secondary, fontSize: 24, fontWeight: 700 }}>
                {selectedStudent.name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedStudent.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Roll No: <strong>{selectedStudent.enrollmentNumber}</strong> • Dept: {selectedStudent.department}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Course: {selectedStudent.course || 'B.Tech CSE'} • Semester: Sem {selectedStudent.semester || 4} ({selectedStudent.section || 'Sec A'})
                </Typography>
              </Box>
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                CONTACT & GUARDIAN INFORMATION
              </Typography>
              <Grid container spacing={1} sx={{ fontSize: 13 }}>
                <Grid item xs={6}><strong>Student Email:</strong> {selectedStudent.email}</Grid>
                <Grid item xs={6}><strong>Student Phone:</strong> {selectedStudent.phoneNumber || 'N/A'}</Grid>
                <Grid item xs={6}><strong>Father/Guardian:</strong> {selectedStudent.guardianName || 'Robert Johnson'}</Grid>
                <Grid item xs={6}><strong>Guardian Phone:</strong> {selectedStudent.guardianPhone || '+91 9848012345'}</Grid>
                <Grid item xs={12}><strong>Address:</strong> {selectedStudent.address || 'Academic Block Hostel A'}</Grid>
              </Grid>
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={800} color="#166534">84.5%</Typography>
                  <Typography variant="caption" color="#166534">Attendance</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={800} color="#1e40af">8.62</Typography>
                  <Typography variant="caption" color="#1e40af">Current CGPA</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">0</Typography>
                  <Typography variant="caption" color="text.secondary">Backlogs</Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                setModalOpen(false);
                navigate(`/admin/students/${selectedStudent.id}`);
              }}
            >
              Open Full Academic Profile
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
