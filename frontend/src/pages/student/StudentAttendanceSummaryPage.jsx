import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { MenuBookOutlined, Refresh } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentAttendanceSummaryPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    attendanceAPI.getMyAttendance()
      .then(res => {
        const records = res.data?.data || [];
        const total = records.length;
        const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        const pct = total > 0 ? (present / total) * 100 : 0;
        setSummary({ total, present, absent: total - present, pct });
      })
      .catch(() => setSummary({ total: 0, present: 0, absent: 0, pct: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Attendance Summary & Eligibility"
        subtitle="Semester cumulative attendance percentage, shortage tracking, and exam eligibility status"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Attendance Summary' }]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Overall Attendance</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: summary?.pct >= 75 ? '#16a34a' : '#dc2626', mt: 0.5 }}>
            {summary?.pct ? `${summary.pct.toFixed(1)}%` : '0.0%'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: summary?.pct >= 75 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {summary?.pct >= 75 ? 'Eligible for Exams' : 'Shortage Alert (<75%)'}
          </Typography>
        </Box>
        <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Sessions Conducted</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{summary?.total || 0}</Typography>
        </Box>
        <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Classes Attended</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0284c7', mt: 0.5 }}>{summary?.present || 0}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
