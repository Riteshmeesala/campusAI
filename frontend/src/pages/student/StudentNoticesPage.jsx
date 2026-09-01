import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { DescriptionOutlined, Refresh } from '@mui/icons-material';
import { notifAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState([]);

  const loadNotices = () => {
    notifAPI.getAll()
      .then(res => setNotices(res.data?.data || []))
      .catch(() => setNotices([]));
  };

  useEffect(() => {
    loadNotices();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Institutional Notices & Circulars"
        subtitle="Official campus circulars, holiday announcements, academic deadlines, and administrative orders"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Notices' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Latest Campus Bulletins</Typography>
          <Tooltip title="Refresh"><IconButton size="small" onClick={loadNotices}><Refresh fontSize="small" /></IconButton></Tooltip>
        </Box>

        {notices.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <DescriptionOutlined sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No notices published</Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Institutional announcements released by the Principal and Dean will appear here.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notices.map((n, idx) => (
              <Box key={idx} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{n.title}</Typography>
                  <Chip label={n.type || 'Notice'} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: '#475569' }}>{n.message}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
