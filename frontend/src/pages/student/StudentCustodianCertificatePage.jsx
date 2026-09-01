import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { WorkspacePremiumOutlined, Send } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentCustodianCertificatePage() {
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
        title="Custodian Certificate Portal"
        subtitle="Request institutional custodian certificate for original certificates held by the college"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Custodian Certificate' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Custodian Certificate request submitted successfully. Principal & Registrar office will verify and issue the document.
        </Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 1 }}>Request Custodian Certificate</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 3 }}>Used for passport verification, education loan processing, and competitive exam verification.</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Purpose / Authority Requesting Certificate"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Bank Education Loan / Passport Seva Kendra / Visa Processing"
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" startIcon={<Send />} sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
              Submit Request
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
}
