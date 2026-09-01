import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { AccessTimeOutlined, Refresh } from '@mui/icons-material';
import { timetableAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentClassRoutinePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    timetableAPI.getMy()
      .then(res => setSlots(res.data?.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Class Routine & Weekly Timetable"
        subtitle="Daily lecture periods, lab sessions, room allotments, and instructor schedules"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Class Routine' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Weekly Course Schedule</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadData}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {slots.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <AccessTimeOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No timetable slots assigned</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Weekly section routine will populate once semester courses are finalized.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {slots.map((s, idx) => (
              <Box key={idx} sx={{ p: 2, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{s.course?.courseName || 'Class'}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: '#0284c7', fontWeight: 600 }}>{s.course?.courseCode} | Room: {s.roomNumber || 'Main Block'}</Typography>
                </Box>
                <Chip label={`${s.dayOfWeek} (${s.startTime} - ${s.endTime})`} size="small" sx={{ fontWeight: 600 }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
