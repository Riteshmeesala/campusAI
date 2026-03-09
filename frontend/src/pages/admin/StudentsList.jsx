import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  TextField, InputAdornment, CircularProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Tooltip
} from '@mui/material';
import { Search, Visibility, PersonAdd, Edit, Delete } from '@mui/icons-material';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

const BLANK = {
  username: '', name: '', email: '', password: 'campusiq@1234',
  phoneNumber: '', department: 'Computer Science', enrollmentNumber: ''
};

export default function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [addOpen,  setAddOpen]  = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form,     setForm]     = useState(BLANK);
  const [editForm, setEditForm] = useState({});
  const [editId,   setEditId]   = useState(null);

  const load = () => {
    setLoading(true);
    userAPI.getStudents()
      .then(r => { const l = r.data.data || []; setStudents(l); setFiltered(l); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.enrollmentNumber?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    ));
  }, [search, students]);

  const handleAdd = async () => {
    if (!form.username || !form.email || !form.name) {
      toast.warning('Username, Name, and Email are required'); return;
    }
    setSaving(true);
    try {
      await userAPI.createStudent(form);
      toast.success(`✅ Student "${form.name}" created! Login: ${form.username} / ${form.password}`);
      setAddOpen(false); setForm(BLANK); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create student'); }
    finally { setSaving(false); }
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setEditForm({ name: s.name, email: s.email, phoneNumber: s.phoneNumber || '',
                  department: s.department || '', enrollmentNumber: s.enrollmentNumber || '', password: '' });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await userAPI.updateUser(editId, editForm);
      toast.success('Student updated'); setEditOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    try { await userAPI.deleteUser(s.id); toast.success('Student deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageHeader title="Students Management" subtitle="Add, edit, and manage all students"
        breadcrumbs={['Home','Admin','Students']}
        action={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAddOpen(true)}
            sx={{ borderRadius: 2, bgcolor: COLORS.primary, fontWeight: 700 }}>
            Add Student
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
            <TextField size="small" placeholder="Search name, enrollment, email..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              sx={{ width: 360 }} />
            <Typography variant="body2" color="textSecondary" alignSelf="center">
              {filtered.length} / {students.length} students
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.bgBase }}>
                  {['Student','Username','Enrollment','Department','Email','Phone','Status','Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                        <Avatar sx={{ width:32, height:32, bgcolor: COLORS.secondary, fontSize:14 }}>{s.name?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize:12, fontFamily:'monospace', color: COLORS.primary }}>{s.username}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{s.enrollmentNumber || '—'}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{s.department || '—'}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{s.email}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{s.phoneNumber || '—'}</TableCell>
                    <TableCell>
                      <Chip label={s.active ? 'Active' : 'Inactive'} size="small"
                        sx={{ bgcolor: s.active ? COLORS.greenBg : '#fee2e2',
                              color: s.active ? COLORS.excellent : COLORS.critical }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', gap:0.5 }}>
                        <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => navigate(`/admin/students/${s.id}`)}><Visibility fontSize="small"/></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" sx={{ color: COLORS.moderate }} onClick={() => openEdit(s)}><Edit fontSize="small"/></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" sx={{ color: COLORS.critical }} onClick={() => handleDelete(s)}><Delete fontSize="small"/></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── ADD DIALOG ── */}
      <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle sx={{ fontWeight:700, pb:0 }}>
          👨‍🎓 Add New Student
          <Typography variant="body2" color="text.secondary" mt={0.5}>Student can login immediately with these credentials.</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={6}><TextField fullWidth label="Username *" size="small" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} helperText="Used to login"/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Password *" size="small" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} helperText="Default: campusiq@1234"/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Full Name *" size="small" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email *" size="small" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Enrollment Number" size="small" value={form.enrollmentNumber} onChange={e=>setForm(p=>({...p,enrollmentNumber:e.target.value}))} placeholder="23BQ1A1268"/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" size="small" value={form.phoneNumber} onChange={e=>setForm(p=>({...p,phoneNumber:e.target.value}))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Department" size="small" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}/></Grid>
          </Grid>
          <Box sx={{ mt:2, p:1.5, bgcolor:'#f0fdf4', borderRadius:2, border:'1px solid #bbf7d0' }}>
            <Typography variant="caption" color={COLORS.excellent}>✅ Saved directly to database. Student can login right away.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p:2.5, pt:0 }}>
          <Button onClick={()=>setAddOpen(false)} disabled={saving} sx={{ borderRadius:2 }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={saving} sx={{ borderRadius:2, bgcolor:COLORS.primary, minWidth:140 }}>
            {saving ? <CircularProgress size={18} color="inherit"/> : 'Create Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle sx={{ fontWeight:700 }}>✏️ Edit Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Full Name" size="small" value={editForm.name||''} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email" size="small" value={editForm.email||''} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Enrollment Number" size="small" value={editForm.enrollmentNumber||''} onChange={e=>setEditForm(p=>({...p,enrollmentNumber:e.target.value}))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" size="small" value={editForm.phoneNumber||''} onChange={e=>setEditForm(p=>({...p,phoneNumber:e.target.value}))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Department" size="small" value={editForm.department||''} onChange={e=>setEditForm(p=>({...p,department:e.target.value}))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="New Password (blank = keep existing)" size="small" value={editForm.password||''} onChange={e=>setEditForm(p=>({...p,password:e.target.value}))}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2.5, pt:0 }}>
          <Button onClick={()=>setEditOpen(false)} disabled={saving} sx={{ borderRadius:2 }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={saving} sx={{ borderRadius:2, bgcolor:COLORS.primary, minWidth:120 }}>
            {saving ? <CircularProgress size={18} color="inherit"/> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}