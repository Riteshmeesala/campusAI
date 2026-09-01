import React from 'react';
import { Box, Typography } from '@mui/material';
import { DirectionsBusOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentBusTrackingPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Check My Bus & Transport Routes"
        subtitle="Real-time campus transport GPS tracking, driver details, stop schedules, and bus passes"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Check My Bus' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <DirectionsBusOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Campus Transport Tracking</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Real-time GPS tracking for institutional buses and route stops is active during transit hours.</Typography>
      </Box>
    </Box>
  );
}
