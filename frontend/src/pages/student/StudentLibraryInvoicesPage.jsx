import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReceiptLongOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentLibraryInvoicesPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Library Invoice & Date Range Reports"
        subtitle="Book issue slips, return receipts, overdue fine settlement history, and clearance records"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Library Invoices' }]}
      />

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <ReceiptLongOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No Library Invoices or Overdue Fines</Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>All borrowed materials are cleared without pending overdue penalties.</Typography>
      </Box>
    </Box>
  );
}
