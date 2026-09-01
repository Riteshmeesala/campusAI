import React from 'react';
import { Box, Typography } from '@mui/material';
import { HotelOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentHostelPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Hostel & Residential Life"
        subtitle="Hostel room allocation, mess menu schedule, gate pass permissions, and warden contact"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Hostel' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <HotelOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Hostel Services & Resident Portal</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Room allocation, daily mess menu, and out-pass requests are managed here.</Typography>
      </Box>
    </Box>
  );
}
