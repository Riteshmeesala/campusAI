import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { AccessTimeOutlined, Refresh } from '@mui/icons-material';
import { examAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentExamRoutinePage() {
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
        title="Examination Routine & Timetable"
        subtitle="Detailed schedule for internal mid terms, lab evaluations, and final university examinations"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Exam Routine' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Exam Schedule Table</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadExams}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {exams.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <AccessTimeOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No exam routine published</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Session timetable and hall allotment will appear once exams are finalized.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Exam Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Type</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{e.examName}</td>
                    <td style={{ padding: '10px 12px' }}><Chip label={e.examType} size="small" /></td>
                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 600 }}>{e.examDate}</td>
                    <td style={{ padding: '10px 12px' }}>{e.totalMarks || 100}</td>
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
