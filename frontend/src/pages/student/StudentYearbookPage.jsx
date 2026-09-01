import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentYearbookPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Institutional YearBook & Graduation Memories"
        subtitle="Batch alumni profiles, campus photo memoirs, graduating batch gallery, and department archives"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'YearBook' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <Inventory2Outlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Graduation YearBook Archive</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Yearbook releases and batch memories will be published for graduating semesters.</Typography>
      </Box>
    </Box>
  );
}
