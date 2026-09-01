import React from 'react';
import { Box, Typography } from '@mui/material';
import { CalendarMonthOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentPlacementsCalendarPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Placements Schedule & Drive Calendar"
        subtitle="Pre-placement talks, online technical assessments, GD rounds, and HR interview slots"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Placements Calendar' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <CalendarMonthOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No Campus Drive Dates Scheduled</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Placement drives will appear here once finalized by the CDC cell.</Typography>
      </Box>
    </Box>
  );
}
