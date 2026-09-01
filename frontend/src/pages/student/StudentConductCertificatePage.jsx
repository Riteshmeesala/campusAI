import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { WorkspacePremiumOutlined, Send } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentConductCertificatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    setSubmitted(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Study & Conduct Certificate (SCC)"
        subtitle="Institutional character, conduct, bona-fide, and study verification certificate generator"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Conduct Certificate' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Study & Conduct Certificate application received. Digitally signed institutional certificate will be generated upon HOD approval.
        </Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 1 }}>Request Study & Conduct Certificate</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 3 }}>Official bona-fide certificate certifying current semester enrollment, branch, and institutional conduct.</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Purpose of Certificate"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. State Scholarship / Internship verification / Bus pass / Higher studies"
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" startIcon={<Send />} sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
              Submit Application
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
}
