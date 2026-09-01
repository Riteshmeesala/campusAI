import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { Send } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentTransferCertificatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitted(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Transfer Certificate (TC) Portal"
        subtitle="Apply for official College Transfer Certificate, view clearance requirements, and track registrar verification"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Transfer Certificate' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Transfer Certificate application submitted successfully. Academic Cell and Examination Registrar will process your application within 3-5 working days.
        </Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 1 }}>Apply for Transfer Certificate</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 3 }}>Ensure library clearance, hostel clearance, and tuition fee dues are settled before requesting TC.</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Reason for TC Request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Higher studies / Course completion / Relocation"
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" startIcon={<Send />} sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
              Submit TC Request
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
}
