import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, IconButton, Avatar, InputAdornment
} from '@mui/material';
import {
  Search, Edit, Delete, Add, AssignmentInd
} from '@mui/icons-material';
import { userAPI, facultyAssignmentAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { anim } from '../../theme/animations';
import { toast } from 'react-toastify';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical & Electronics',
  'Mathematics', 'Physics', 'Humanities & Sciences'
];

const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'Batch 1', 'Batch 2'];

const BLANK_ASSIGNMENT = {
  facultyId: '',
  department: 'Computer Science',
  subjectCode: '',
  subjectName: '',
  semesterCode: '1-1',
  academicYear: '2025-2026',
  section: 'Section A',
  creditHours: 3,
};

export default function FacultySubjectAssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [facultyList,  setFacultyList]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  // Filters & Search
  const [search,         setSearch]         = useState('');
  const [deptFilter,     setDeptFilter]     = useState('ALL');
  const [semFilter,      setSemFilter]      = useState('ALL');

  // Dialog State
  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [editingId,      setEditingId]      = useState(null);
  const [form,           setForm]           = useState(BLANK_ASSIGNMENT);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, aRes] = await Promise.all([
        userAPI.getFaculty(),
        facultyAssignmentAPI.getAll(),
      ]);
      setFacultyList(fRes.data.data || []);
      setAssignments(aRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load faculty assignments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const q = search.toLowerCase();
      const matchesSearch =
        (a.subjectName || '').toLowerCase().includes(q) ||
        (a.subjectCode || '').toLowerCase().includes(q) ||
        (a.faculty?.name || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q);

      const matchesDept = deptFilter === 'ALL' || a.department === deptFilter;
      const matchesSem  = semFilter === 'ALL' || a.semesterCode === semFilter;

      return matchesSearch && matchesDept && matchesSem;
    });
  }, [assignments, search, deptFilter, semFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...BLANK_ASSIGNMENT,
      facultyId: facultyList.length > 0 ? facultyList[0].id : '',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (a) => {
    setEditingId(a.id);
    setForm({
      facultyId: a.faculty?.id || '',
      department: a.department || 'Computer Science',
      subjectCode: a.subjectCode || '',
      subjectName: a.subjectName || '',
      semesterCode: a.semesterCode || '1-1',
      academicYear: a.academicYear || '2025-2026',
      section: a.section || 'Section A',
      creditHours: a.creditHours || 3,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.facultyId || !form.subjectCode.trim() || !form.subjectName.trim()) {
      toast.warning('Please select Faculty, Subject Code, and Subject Name');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await facultyAssignmentAPI.updateAssignment(editingId, form);
        toast.success(`Assignment for ${form.subjectCode} updated successfully!`);
      } else {
        await facultyAssignmentAPI.createAssignment(form);
        toast.success(`Subject ${form.subjectCode} assigned to faculty!`);
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save faculty assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Remove subject assignment "${a.subjectCode}: ${a.subjectName}" for ${a.faculty?.name}?`)) return;
    try {
      await facultyAssignmentAPI.deleteAssignment(a.id);
      toast.success('Assignment removed');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Faculty Subject Assignment"
        subtitle="Allocate subjects to faculty members across departments, semesters (1-1 to 4-2), academic years, and class sections"
        breadcrumbs={['Home', 'Admin', 'Faculty Assignments']}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{
              background: COLORS.gradBlue,
              borderRadius: 3,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            Assign New Subject
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3.5, border: `1px solid ${COLORS.borderLight}`, ...anim.fadeInUp(0.1) }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by faculty name, subject code, or course title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department Filter"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {DEPARTMENTS.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Semester Filter"
                value={semFilter}
                onChange={e => setSemFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Semesters (1-1 to 4-2)</MenuItem>
                {SEMESTERS.map(s => (
                  <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card sx={{ borderRadius: 3.5, border: `1px solid ${COLORS.borderLight}`, ...anim.fadeInUp(0.2) }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <AssignmentInd sx={{ fontSize: 48, color: COLORS.textMuted, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                No Faculty Subject Assignments Found
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.5 }}>
                Click "Assign New Subject" above to assign courses and curricula to faculty members.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#f8fafc', fontWeight: 700, fontSize: '0.78rem', py: 1.5 } }}>
                    <TableCell sx={{ minWidth: 160 }}>Faculty Member</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Subject Code</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Subject Name</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Department</TableCell>
                    <TableCell sx={{ minWidth: 90 }}>Semester</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Section</TableCell>
                    <TableCell sx={{ minWidth: 110 }}>Academic Year</TableCell>
                    <TableCell sx={{ width: 60 }}>Credits</TableCell>
                    <TableCell sx={{ width: 80, textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff6ff', color: COLORS.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                            {a.faculty?.name?.[0] || 'F'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: COLORS.textPrimary }}>
                              {a.faculty?.name || 'Assigned Faculty'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                              {a.faculty?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '0.82rem' }}>
                        {a.subjectCode}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textPrimary }}>
                        {a.subjectName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        {a.department}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Sem ${a.semesterCode}`}
                          size="small"
                          sx={{ bgcolor: '#eff6ff', color: COLORS.primary, fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {a.section || 'Section A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
                        {a.academicYear || '2025-2026'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {a.creditHours || 3}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(a)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(a)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: `1px solid ${COLORS.borderLight}`, pb: 1.5 }}>
          {editingId ? 'Edit Faculty Subject Assignment' : 'Assign Subject to Faculty'}
        </DialogTitle>
        <DialogContent sx={{ py: 2.5 }}>
          <Grid container spacing={2}>
            {/* Faculty Selection */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                size="small"
                label="Select Faculty Member"
                value={form.facultyId}
                onChange={e => {
                  const fid = e.target.value;
                  const f = facultyList.find(x => x.id === fid);
                  setForm({
                    ...form,
                    facultyId: fid,
                    department: f?.department || form.department,
                  });
                }}
              >
                {facultyList.map(f => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name} ({f.department || 'General'}) — {f.email}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Semester Code (1-1 to 4-2) */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Semester"
                value={form.semesterCode}
                onChange={e => setForm({ ...form, semesterCode: e.target.value })}
              >
                {SEMESTERS.map(s => (
                  <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Subject Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Subject Code"
                placeholder="e.g. CS301"
                value={form.subjectCode}
                onChange={e => setForm({ ...form, subjectCode: e.target.value.toUpperCase() })}
              />
            </Grid>

            {/* Subject Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Subject Name / Title"
                placeholder="e.g. Web Technologies & Full Stack"
                value={form.subjectName}
                onChange={e => setForm({ ...form, subjectName: e.target.value })}
              />
            </Grid>

            {/* Academic Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Academic Year"
                placeholder="e.g. 2025-2026"
                value={form.academicYear}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}
              />
            </Grid>

            {/* Class / Section */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Class / Section"
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
              >
                {SECTIONS.map(sec => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Credit Hours */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Credit Hours"
                value={form.creditHours}
                onChange={e => setForm({ ...form, creditHours: parseInt(e.target.value) || 3 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.borderLight}` }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ background: COLORS.gradBlue, borderRadius: 2, fontWeight: 700 }}
          >
            {saving ? 'Saving...' : editingId ? 'Update Assignment' : 'Assign Subject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
