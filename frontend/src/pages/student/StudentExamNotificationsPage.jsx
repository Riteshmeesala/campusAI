import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { NotificationsOutlined, Refresh } from '@mui/icons-material';
import { examAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentExamNotificationsPage() {
  const [exams, setExams] = useState([]);

  const loadExams = () => {
    examAPI.getAll()
      .then(res => setExams(res.data?.data || []))
      .catch(() => setExams([]));
  };

  useEffect(() => {
    loadExams();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Examination Notifications & Circulars"
        subtitle="Official institutional exam notices, hall ticket releases, and semester schedules"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Exam Notifications' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Active Examination Notices</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadExams}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {exams.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <NotificationsOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No active exam notifications</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Upcoming mid-term and semester final exam timetables will appear here when published.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {exams.map((exam) => (
              <Box key={exam.id} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{exam.examName || 'Semester Examination'}</Typography>
                  <Chip label={exam.examType || 'Official'} size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: 11 }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: '#475569' }}>Date: {exam.examDate} | Total Marks: {exam.totalMarks || 100}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
