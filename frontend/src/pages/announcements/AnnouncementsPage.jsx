import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Alert, CircularProgress, Chip, Divider
} from '@mui/material';
import { Send } from '@mui/icons-material';
import api from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

// Inline API — avoids "announcementAPI not found" export error
const announcementAPI = {
  sendToAll:        (data) => api.post('/announcements/send', data),
  sendHoliday:      (data) => api.post('/announcements/send/holiday', data),
  sendExamReminder: (data) => api.post('/announcements/send/exam', data),
  sendEvent:        (data) => api.post('/announcements/send/event', data),
};

const TYPES = [
  { value: 'GENERAL', label: '📢 General' },
  { value: 'HOLIDAY', label: '🏖️ Holiday' },
  { value: 'EXAM',    label: '📝 Exam'    },
  { value: 'EVENT',   label: '🎉 Event'   },
  { value: 'RESULT',  label: '📋 Result'  },
];

function QuickBtn({ icon, label, color, description, loading, onClick }) {
  return (
    <Card sx={{ cursor: 'pointer', transition: '0.15s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
      onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontSize: 28 }}>{icon}</Typography>
          <Typography fontWeight={700} fontSize={14}>{label}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" fontSize={12} mb={1.5}>{description}</Typography>
        <Button size="small" variant="outlined" disabled={loading}
          startIcon={loading ? <CircularProgress size={13} /> : <Send fontSize="small" />}
          sx={{ borderRadius: 2, borderColor: color, color, fontSize: 11 }}>
          {loading ? 'Sending...' : 'Quick Send'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AnnouncementsPage() {
  const [subject,  setSubject]  = useState('');
  const [body,     setBody]     = useState('');
  const [type,     setType]     = useState('GENERAL');
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [ql,       setQl]       = useState('');

  const customSend = async () => {
    if (!subject.trim()) { toast.warning('Please enter a subject'); return; }
    if (!body.trim())    { toast.warning('Please enter a message body'); return; }
    setSending(true);
    try {
      const res = await announcementAPI.sendToAll({ subject, body, type, sendEmail: true, saveNotification: true });
      setResult(res.data?.data);
      toast.success(`Sent to ${res.data?.data?.totalStudents || 'all'} students!`);
      setSubject(''); setBody('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send. Is backend running?');
    } finally { setSending(false); }
  };

  const quickSend = async (apiFn, label, defaultSubject, defaultBody) => {
    setQl(label);
    try {
      const res = await apiFn({ subject: defaultSubject, body: defaultBody });
      toast.success(`${label} sent to ${res.data?.data?.sent || 'all'} students!`);
    } catch (e) {
      toast.error('Failed: ' + (e.response?.data?.message || e.message));
    } finally { setQl(''); }
  };

  return (
    <Box>
      <PageHeader title="📢 Announcements"
        subtitle="Send email + in-app notification to all students in one click"
        breadcrumbs={['Home', 'Announcements']} />

      <Typography variant="h6" fontWeight={700} mb={2}>Quick Send</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickBtn icon="🏖️" label="Holiday Notice" color="#0891b2"
            description="Notify all students about a holiday or college closure."
            loading={ql === 'Holiday'}
            onClick={() => quickSend(announcementAPI.sendHoliday, 'Holiday',
              'Holiday — College Closed Tomorrow',
              'Dear Students,\n\nThe college will remain closed tomorrow.\n\nRegards,\nCampusIQ+ Administration')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickBtn icon="📝" label="Exam Reminder" color="#d97706"
            description="Send exam reminder to all students."
            loading={ql === 'Exam'}
            onClick={() => quickSend(announcementAPI.sendExamReminder, 'Exam',
              'Upcoming Exam Reminder',
              'Dear Students,\n\nReminder: upcoming exams scheduled. Check the Exams page for details.\n\nBest of luck!\nCampusIQ+ Team')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickBtn icon="🎉" label="Event Notice" color="#059669"
            description="Announce college events to all students."
            loading={ql === 'Event'}
            onClick={() => quickSend(announcementAPI.sendEvent, 'Event',
              'Upcoming College Event',
              'Dear Students,\n\nWe are pleased to announce an upcoming college event. Check the portal for details.\n\nRegards,\nCampusIQ+ Administration')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickBtn icon="📢" label="Custom Notice" color={COLORS.primary}
            description="Use the form below to write a custom announcement."
            loading={false}
            onClick={() => document.getElementById('ann-subject')?.focus()} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={0.5}>Custom Announcement</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Send a personalized message to all students.
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          {result && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setResult(null)}>
              Announcement delivered! <strong>{result.emailsSent} emails</strong> sent,
              <strong> {result.notificationsSaved} in-app notifications</strong> saved.
              {result.failures > 0 && <span> ({result.failures} failures)</span>}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Type" value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField id="ann-subject" fullWidth size="small" label="Subject *"
                placeholder="e.g., College Closed — Republic Day Holiday"
                value={subject} onChange={e => setSubject(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" multiline rows={5} label="Message Body *"
                placeholder="Dear Students,

Write your announcement here...

Regards,
CampusIQ+ Administration"
                value={body} onChange={e => setBody(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="📧 Email all students"  size="small" sx={{ bgcolor: '#dcfce7', color: '#166534' }} />
                  <Chip label="🔔 In-app notification" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af' }} />
                  <Chip label="⚡ Instant delivery"    size="small" sx={{ bgcolor: '#fef9c3', color: '#92400e' }} />
                </Box>
                <Button variant="contained" onClick={customSend} disabled={sending}
                  startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
                  sx={{ borderRadius: 2, bgcolor: COLORS.primary, px: 3 }}>
                  {sending ? 'Sending...' : 'Send to All Students'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}