import React from 'react';
import { Box, Typography } from '@mui/material';
import { SchoolOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentPlacementsPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Training & Placement Cell (T&P)"
        subtitle="On-campus placement opportunities, corporate recruiter listings, and eligibility criteria"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Placements' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <SchoolOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No Active Placement Drives</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Recruitment drives and eligibility notices from corporate partners will appear here.</Typography>
      </Box>
    </Box>
  );
}
