import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, IconButton, Tooltip
} from '@mui/material';
import { EmojiEventsOutlined, Add, Refresh } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getSharedAchievements, saveSharedAchievement, DATA_SYNC_EVENTS, subscribeToDataSync } from '../../services/dataSync';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentAchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Hackathon & Competitions',
    org: '',
    date: '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  const loadAchievements = () => {
    setAchievements(getSharedAchievements());
  };

  useEffect(() => {
    loadAchievements();
    const unsub = subscribeToDataSync(DATA_SYNC_EVENTS.ACHIEVEMENT_SUBMITTED, () => loadAchievements());
    return () => unsub();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.org.trim()) return;

    const newAch = {
      id: Date.now(),
      studentName: user?.name || 'Student',
      rollNo: user?.username || '24CS001',
      title: form.title.trim(),
      category: form.category,
      org: form.org.trim(),
      date: form.date || new Date().toISOString().split('T')[0],
      status: 'Verified'
    };

    saveSharedAchievement(newAch);
    setAchievements(getSharedAchievements());
    setOpenModal(false);
    setForm({ title: '', category: 'Hackathon & Competitions', org: '', date: '' });
    setSuccessMsg('Achievement submitted and recorded successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Student Achievements & Honors"
        subtitle="Record hackathon victories, research publications, competitive coding milestones, and institutional awards"
        breadcrumbs={[
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Achievements' }
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, textTransform: 'none', fontWeight: 600 }}
          >
            Add Achievement
          </Button>
        }
      />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Verified Honors & Awards
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadAchievements}><Refresh fontSize="small" /></IconButton>
          </Tooltip>
        </Box>

        {achievements.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <EmojiEventsOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No achievements recorded</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8', mb: 2 }}>Add your hackathon wins, research papers, or certifications.</Typography>
            <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setOpenModal(true)} sx={{ textTransform: 'none' }}>
              Add Your First Achievement
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {achievements.map((ach) => (
              <Box key={ach.id} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ach.title}</Typography>
                  <Chip label={ach.status || 'Verified'} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11 }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: '#0284c7', fontWeight: 600, mb: 0.5 }}>{ach.category}</Typography>
                <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>Issuing Authority / Org: <strong>{ach.org}</strong></Typography>
                <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: 0.5 }}>Date: {ach.date}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a' }}>Add New Achievement</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Achievement / Award Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 1st Place - National Smart India Hackathon"
              required
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              size="small"
            >
              <MenuItem value="Hackathon & Competitions">Hackathon & Competitions</MenuItem>
              <MenuItem value="Research Publication">Research Publication</MenuItem>
              <MenuItem value="Academic Excellence">Academic Excellence Award</MenuItem>
              <MenuItem value="Sports & Extracurricular">Sports & Extracurricular</MenuItem>
            </TextField>
            <TextField
              label="Issuing Organization / Authority"
              value={form.org}
              onChange={(e) => setForm({ ...form, org: e.target.value })}
              placeholder="e.g. Ministry of Education / IEEE / ACM"
              required
              fullWidth
              size="small"
            />
            <TextField
              type="date"
              label="Achievement Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
              Save Achievement
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
