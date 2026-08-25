import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  TextField, InputAdornment, CircularProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Tooltip, MenuItem,
  Divider
} from '@mui/material';
import {
  Search, Visibility, PersonAdd, Edit, Delete, Groups,
  AddCircleOutline
} from '@mui/icons-material';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { anim } from '../../theme/animations';
import { toast } from 'react-toastify';

const INITIAL_DEPTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics',
  'Mathematics',
  'Physics',
  'Humanities & Sciences'
];

const BLANK = {
  username: '',
  name: '',
  email: '',
  password: 'campusiq@1234',
  phoneNumber: '',
  department: 'Computer Science',
  customDepartment: '',
  employeeId: '',
};

export default function FacultyList() {
  const navigate = useNavigate();
  const [faculty,     setFaculty]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [deptFilter,  setDeptFilter]  = useState('ALL');
  const [deptOptions, setDeptOptions] = useState(INITIAL_DEPTS);

  // Dialog state
  const [addOpen,  setAddOpen]  = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form,     setForm]     = useState(BLANK);
  const [editForm, setEditForm] = useState({});
  const [editId,   setEditId]   = useState(null);

  const load = () => {
    setLoading(true);
    userAPI.getFaculty()
      .then(r => {
        const list = r.data.data || [];
        setFaculty(list);
        const discovered = new Set(INITIAL_DEPTS);
        list.forEach(f => {
          if (f.department && !discovered.has(f.department)) {
            discovered.add(f.department);
          }
        });
        setDeptOptions(Array.from(discovered));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return faculty.filter(f => {
      const q = search.toLowerCase();
      const matchesSearch =
        (f.name || '').toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.username || '').toLowerCase().includes(q) ||
        (f.enrollmentNumber || '').toLowerCase().includes(q);

      const matchesDept = deptFilter === 'ALL' || f.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [faculty, search, deptFilter]);

  const handleAdd = async () => {
    if (!form.username || !form.email || !form.name) {
      toast.warning('Username, Name, and Email are required');
      return;
    }

    const finalDept = form.department === '__CUSTOM__'
      ? (form.customDepartment.trim() || 'General')
      : form.department;

    setSaving(true);
    try {
      await userAPI.createFaculty({
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber,
        department: finalDept,
        employeeId: form.employeeId.trim(),
      });

      toast.success(`✅ Faculty "${form.name}" created! (Dept: ${finalDept})`);
      if (!deptOptions.includes(finalDept)) {
        setDeptOptions(p => [...p, finalDept]);
      }
      setAddOpen(false);
      setForm(BLANK);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create faculty');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (f) => {
    setEditId(f.id);
    const isCustomDept = f.department && !deptOptions.includes(f.department);
    setEditForm({
      name: f.name || '',
      email: f.email || '',
      phoneNumber: f.phoneNumber || '',
      department: isCustomDept ? '__CUSTOM__' : (f.department || 'Computer Science'),
      customDepartment: isCustomDept ? f.department : '',
      enrollmentNumber: f.enrollmentNumber || '',
      password: '',
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    const finalDept = editForm.department === '__CUSTOM__'
      ? (editForm.customDepartment?.trim() || 'General')
      : editForm.department;

    try {
      await userAPI.updateUser(editId, {
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        department: finalDept,
        enrollmentNumber: editForm.enrollmentNumber,
        password: editForm.password,
      });
      toast.success('Faculty profile updated');
      setEditOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete faculty "${f.name}"? Cannot be undone.`)) return;
    try {
      await userAPI.deleteUser(f.id);
      toast.success('Faculty deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Faculty Management"
        subtitle="Manage professors, assistant professors, assign owned departments, and configure credentials"
        breadcrumbs={['Home', 'Admin', 'Faculty']}
        action={
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setAddOpen(true)}
            sx={{
              background: COLORS.gradBlue,
              borderRadius: 3,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            Add New Faculty
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3.5, border: `1px solid ${COLORS.borderLight}`, ...anim.fadeInUp(0.1) }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search faculty name, department, employee ID, or email..."
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

            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department Filter"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Departments ({deptOptions.length})</MenuItem>
                {deptOptions.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card sx={{ borderRadius: 3.5, border: `1px solid ${COLORS.borderLight}`, ...anim.fadeInUp(0.15) }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.015)', borderBottom: `1px solid ${COLORS.borderLight}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups sx={{ color: COLORS.secondary }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: COLORS.textPrimary }}>
                Teaching Staff & Faculty Directory
              </Typography>
            </Box>
            <Chip
              label={`${filtered.length} of ${faculty.length} Faculty`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: `${COLORS.secondary}12`, color: COLORS.secondary }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  {['Faculty Name', 'Username', 'Employee ID', 'Home Department', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.8rem', py: 1.5, color: COLORS.textSecondary }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="textSecondary">No faculty found matching the criteria.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(f => (
                    <TableRow key={f.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary, fontSize: '0.85rem', fontWeight: 700 }}>
                            {f.name?.[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.textPrimary }}>
                            {f.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', color: COLORS.primary, fontWeight: 700 }}>
                        {f.username}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                        {f.enrollmentNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={f.department || 'General'}
                          size="small"
                          sx={{
                            bgcolor: `${COLORS.primary}12`,
                            color: COLORS.primary,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                        {f.email}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: COLORS.textMuted }}>
                        {f.phoneNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={f.active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: f.active ? '#dcfce7' : '#fee2e2',
                            color: f.active ? '#15803d' : '#dc2626',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Profile">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/admin/faculty/${f.id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Faculty">
                            <IconButton size="small" sx={{ color: COLORS.moderate }} onClick={() => openEdit(f)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Faculty">
                            <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDelete(f)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── ADD FACULTY DIALOG ── */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', borderBottom: `1px solid ${COLORS.border}`, py: 2 }}>
          Register Faculty Profile
          <Typography variant="caption" display="block" color="text.secondary" mt={0.25}>
            Configure faculty login credentials and assign designated home department
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username *"
                size="small"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                helperText="Used for system login"
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password *"
                size="small"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                helperText="Default: campusiq@1234"
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                size="small"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                size="small"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                size="small"
                placeholder="e.g. FAC009"
                value={form.employeeId}
                onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                disabled={saving}
              />
            </Grid>

            {/* Department Selector with Add New Dept Option */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Home Department *"
                size="small"
                value={form.department}
                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                disabled={saving}
              >
                {deptOptions.map(d => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 0.5 }} />
                <MenuItem value="__CUSTOM__" sx={{ color: COLORS.secondary, fontWeight: 700 }}>
                  <AddCircleOutline sx={{ fontSize: 16, mr: 1 }} /> + Add New Department...
                </MenuItem>
              </TextField>
            </Grid>

            {/* Custom Department Name Input */}
            {form.department === '__CUSTOM__' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Department Name *"
                  size="small"
                  placeholder="e.g. Data Science"
                  value={form.customDepartment}
                  onChange={e => setForm(p => ({ ...p, customDepartment: e.target.value }))}
                  disabled={saving}
                  autoFocus
                />
              </Grid>
            )}

            <Grid item xs={12} sm={form.department === '__CUSTOM__' ? 12 : 6}>
              <TextField
                fullWidth
                label="Phone Number"
                size="small"
                placeholder="e.g. 9876543210"
                value={form.phoneNumber}
                onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                disabled={saving}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={saving}
            sx={{ background: COLORS.gradBlue, borderRadius: 2.5, minWidth: 140, fontWeight: 700 }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Create Faculty'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', borderBottom: `1px solid ${COLORS.border}`, py: 2 }}>
          Edit Faculty Profile & Staff Assignment
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                size="small"
                value={editForm.name || ''}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                size="small"
                value={editForm.email || ''}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                size="small"
                value={editForm.enrollmentNumber || ''}
                onChange={e => setEditForm(p => ({ ...p, enrollmentNumber: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                size="small"
                value={editForm.phoneNumber || ''}
                onChange={e => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))}
                disabled={saving}
              />
            </Grid>

            {/* Department in Edit */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Home Department"
                size="small"
                value={editForm.department || 'Computer Science'}
                onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))}
                disabled={saving}
              >
                {deptOptions.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
                <Divider sx={{ my: 0.5 }} />
                <MenuItem value="__CUSTOM__" sx={{ color: COLORS.secondary, fontWeight: 700 }}>
                  <AddCircleOutline sx={{ fontSize: 16, mr: 1 }} /> + Add New Department...
                </MenuItem>
              </TextField>
            </Grid>

            {editForm.department === '__CUSTOM__' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Department Name"
                  size="small"
                  value={editForm.customDepartment || ''}
                  onChange={e => setEditForm(p => ({ ...p, customDepartment: e.target.value }))}
                  disabled={saving}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password (leave blank to keep existing)"
                size="small"
                value={editForm.password || ''}
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                disabled={saving}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setEditOpen(false)} disabled={saving} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={saving}
            sx={{ background: COLORS.gradBlue, borderRadius: 2.5, minWidth: 130, fontWeight: 700 }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}