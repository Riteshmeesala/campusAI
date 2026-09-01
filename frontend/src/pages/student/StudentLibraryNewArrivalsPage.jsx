import React from 'react';
import { Box, Typography } from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentLibraryNewArrivalsPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Library New Book Arrivals"
        subtitle="Newly procured textbooks, reference volumes, research journals, and laboratory manuals"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Library New Arrivals' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <MenuBook sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No New Book Arrivals This Week</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Newly accessioned volumes will be cataloged and showcased here.</Typography>
      </Box>
    </Box>
  );
}
