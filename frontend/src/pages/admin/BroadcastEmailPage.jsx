import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert,
  CircularProgress, Chip, Divider
} from '@mui/material';
import { Send, Email, Campaign } from '@mui/icons-material';
import { notificationAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

/**
 * ✅ NEW: Admin Broadcast Email Page
 *
 * Admin writes a subject + message → clicks Send → ALL students receive:
 *  - In-app notification (visible instantly in notification bell)
 *  - Email to their registered email address
 *
 * Subject keywords auto-detect type:
 *  - "holiday" → HOLIDAY type
 *  - "event" / "fest" / "seminar" → EVENT type
 *  - anything else → GENERAL
 */
export default function BroadcastEmailPage() {
  const [subject,    setSubject]    = useState('');
  const [message,    setMessage]    = useState('');
  const [targetRole, setTargetRole] = useState('STUDENTS');
  const [sending,    setSending]    = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const templates = [
    {
      label: '🏖️ Holiday Notice',
      subject: 'Holiday Announcement',
      message: 'Dear Students,\n\nWe wish to inform you that the college will remain closed on [DATE] due to [REASON].\n\nAll exams/classes scheduled on that day will be rescheduled. Further details will be communicated shortly.\n\nWarm Regards,\nPrincipal Office',
    },
    {
      label: '🎉 Event Invitation',
      subject: 'Upcoming College Event – [EVENT NAME]',
      message: 'Dear Students,\n\nWe are excited to announce [EVENT NAME] on [DATE] at [VENUE].\n\nAll students are encouraged to participate. Registration details will follow.\n\nLooking forward to your enthusiastic participation!\n\nWarm Regards,\nStudent Affairs Committee',
    },
    {
      label: '📢 Exam Circular',
      subject: 'Important: Exam Schedule Update',
      message: 'Dear Students,\n\nThis is to inform you about important updates regarding the upcoming examination schedule.\n\nPlease check the Exams section on your CampusIQ+ portal for the latest schedule.\n\nEnsure you are prepared and report to the examination hall 15 minutes before the scheduled time.\n\nBest Regards,\nExamination Cell',
    },
    {
      label: '📋 General Notice',
      subject: 'Important Notice for Students',
      message: 'Dear Students,\n\nThis is an important announcement from the college administration.\n\n[WRITE YOUR MESSAGE HERE]\n\nFor any queries, please contact the college office during working hours.\n\nRegards,\nAdministration',
    },
  ];

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setMessage(t.message);
    toast.info('Template applied. Edit as needed before sending.');
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.warning('Subject is required'); return; }
    if (!message.trim()) { toast.warning('Message is required'); return; }
    if (message.includes('[DATE]') || message.includes('[WRITE YOUR MESSAGE HERE]')) {
      toast.warning('Please fill in the placeholder text before sending');
      return;
    }
    setSending(true);
    try {
      const res = await notificationAPI.broadcast({ subject, message, targetRole });
      const data = res.data.data;
      setLastResult({ count: data.notified, subject: data.subject });
      toast.success(`✅ Broadcast sent! ${data.notified} users notified via email + app.`);
      setSubject('');
      setMessage('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  // Detect type from subject
  const getType = () => {
    const lower = subject.toLowerCase();
    if (lower.includes('holiday') || lower.includes('leave')) return { label: 'Holiday', color: '#f97316', bg: '#fff7ed' };
    if (lower.includes('event') || lower.includes('fest') || lower.includes('seminar')) return { label: 'Event', color: '#8b5cf6', bg: '#f5f3ff' };
    if (lower.includes('exam') || lower.includes('result')) return { label: 'Exam Notice', color: '#2563eb', bg: '#eff6ff' };
    return { label: 'General', color: '#64748b', bg: '#f8fafc' };
  };

  const typeInfo = getType();

  return (
    <Box>
      <PageHeader
        title="Broadcast Email"
        subtitle="Send announcements, holiday notices, or event invitations to all students in one click"
        breadcrumbs={['Home', 'Admin', 'Broadcast Email']}
      />

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        📧 Each recipient receives <strong>both an email</strong> to their registered address <strong>and an in-app notification</strong> in real-time.
      </Alert>

      {lastResult && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setLastResult(null)}>
          ✅ "<strong>{lastResult.subject}</strong>" was sent to <strong>{lastResult.count} users</strong> successfully!
        </Alert>
      )}

      {/* Quick Templates */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1.5}>📋 Quick Templates</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click a template to pre-fill the form, then edit before sending.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {templates.map((t, i) => (
              <Button key={i} variant="outlined" size="small"
                onClick={() => applyTemplate(t)}
                sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>
                {t.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Compose */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Email sx={{ color: COLORS.primary }} />
            <Typography variant="h6" fontWeight={700}>Compose Broadcast</Typography>
            {subject && (
              <Chip label={typeInfo.label} size="small"
                sx={{ ml: 1, bgcolor: typeInfo.bg, color: typeInfo.color, fontWeight: 700, fontSize: 11 }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Subject *"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              size="small"
              placeholder="e.g., Holiday Announcement — Republic Day"
              helperText="Include 'holiday' or 'event' in subject for auto-classification"
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Send To</InputLabel>
              <Select value={targetRole} label="Send To"
                onChange={e => setTargetRole(e.target.value)}>
                <MenuItem value="STUDENTS">Students Only</MenuItem>
                <MenuItem value="FACULTY">Faculty Only</MenuItem>
                <MenuItem value="ALL">All (Students + Faculty)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={8}
            label="Message *"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your announcement here..."
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 2 }} />

          {/* Preview */}
          {subject && message && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                📧 EMAIL PREVIEW
              </Typography>
              <Typography variant="body2" fontWeight={700}>Subject: [CampusIQ+] {subject}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', fontSize: 13 }}>
                Dear [Student Name],{'\n\n'}{message}{'\n\nRegards,\nCampusIQ+ Team'}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
              disabled={sending || !subject.trim() || !message.trim()}
              onClick={handleSend}
              sx={{ borderRadius: 2, bgcolor: COLORS.primary, px: 4, minWidth: 200 }}
            >
              {sending ? 'Sending...' : `Send to ${targetRole === 'ALL' ? 'Everyone' : targetRole}`}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
