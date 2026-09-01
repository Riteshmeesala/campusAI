import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { BarChartOutlined, Refresh } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentMonthlyAttendancePage() {
  const [attendance, setAttendance] = useState([]);

  const loadData = () => {
    attendanceAPI.getMyAttendance()
      .then(res => setAttendance(res.data?.data || []))
      .catch(() => setAttendance([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Monthly Attendance Records"
        subtitle="Month-wise lecture attendance history, present counts, and session logs"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Monthly Attendance' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Session Logs & Attendance Status</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadData}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {attendance.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <BarChartOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No attendance logs found</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Session records will be displayed once attendance is marked by faculty.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Course Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 600 }}>{a.attendanceDate}</td>
                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 600 }}>{a.course?.courseCode || 'COURSE'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: a.status === 'PRESENT' ? '#16a34a' : '#dc2626' }}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
