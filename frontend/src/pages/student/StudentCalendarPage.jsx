import React from 'react';
import { Box, Typography } from '@mui/material';
import { CalendarMonthOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentCalendarPage() {
  const events = [
    { date: '15 Sep 2026', title: 'National Engineers Day Technical Symposium', type: 'Campus Event' },
    { date: '02 Oct 2026', title: 'Institutional Holiday (Gandhi Jayanti)', type: 'Holiday' },
    { date: '19 Oct 2026', title: 'Mid-Semester Examinations Commencement', type: 'Academic' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Institutional Academic Calendar"
        subtitle="Semester schedule, examination slots, holidays, technical fests, and sports meets"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Calendar' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 2 }}>Upcoming Scheduled Events</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.map((ev, idx) => (
            <Box key={idx} sx={{ p: 2, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{ev.title}</Typography>
                <Typography sx={{ fontSize: 12.5, color: '#0284c7', fontWeight: 600 }}>{ev.type}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#475569' }}>{ev.date}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
