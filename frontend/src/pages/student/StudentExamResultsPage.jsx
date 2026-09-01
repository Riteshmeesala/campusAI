import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { MenuBookOutlined, Refresh } from '@mui/icons-material';
import { resultAPI, gpaAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentExamResultsPage() {
  const [results, setResults] = useState([]);
  const [gpa, setGpa] = useState(null);

  const loadData = () => {
    Promise.allSettled([
      resultAPI.getMyResults(),
      gpaAPI.getMyGpa()
    ]).then(([res, gpaRes]) => {
      if (res.status === 'fulfilled') setResults(res.value.data?.data || []);
      if (gpaRes.status === 'fulfilled') setGpa(gpaRes.value.data?.data || null);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Examination Results & Academic Performance"
        subtitle="Official semester SGPA/CGPA evaluation cards, subject grades, and credits earned"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Exam Results' }]}
      />

      {/* GPA Summary Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Overall Cumulative GPA (CGPA)</Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#1e40af', mt: 0.5 }}>{gpa?.cgpa ? gpa.cgpa.toFixed(2) : 'N/A'}</Typography>
          <Typography sx={{ fontSize: 12, color: '#60a5fa' }}>Synchronized source of truth</Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Current Semester GPA (SGPA)</Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#166534', mt: 0.5 }}>{gpa?.sgpa ? gpa.sgpa.toFixed(2) : 'N/A'}</Typography>
          <Typography sx={{ fontSize: 12, color: '#4ade80' }}>Latest semester evaluation</Typography>
        </Box>
      </Box>

      {/* Results Table Card */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Subject-Wise Exam Grades</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadData}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {results.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <MenuBookOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No examination results published</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Marks will appear once results are released by the examination authority.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Subject Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Exam</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Marks Obtained</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Grade</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{r.course?.courseCode || 'SUB'}</td>
                    <td style={{ padding: '10px 12px' }}>{r.exam?.examName || 'Term Exam'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{r.marksObtained} / {r.exam?.totalMarks || 100}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0284c7' }}>{r.grade || 'A'}</td>
                    <td style={{ padding: '10px 12px' }}><Chip label={r.status || 'PASSED'} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11 }} /></td>
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
