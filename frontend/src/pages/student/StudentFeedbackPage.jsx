import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentFeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Student Feedback & Continuous Improvement"
        subtitle="Institutional suggestions for academic environment, labs, amenities, and campus student life"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Feedback' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>Thank you! Your feedback has been recorded for IQAC review.</Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 1 }}>Submit Feedback / Suggestion</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 3 }}>All constructive suggestions are directly evaluated by the Internal Quality Assurance Cell (IQAC).</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Your Suggestions / Observations"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share constructive feedback for infrastructure, syllabus, coding labs, sports, etc..."
              multiline
              rows={4}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
              Submit Feedback
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
}
