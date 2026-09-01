import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { SearchOutlined, LocalLibraryOutlined } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentLibrarySearchPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Library Book Search"
        subtitle="Search physical catalog and e-book repository across all engineering & sciences disciplines"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Library Search' }]}
      />

      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by Title, Author, ISBN, or Subject Keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
            size="small"
          />
          <Button variant="contained" onClick={() => setSearched(true)} sx={{ bgcolor: '#0284c7', textTransform: 'none', px: 3 }}>
            Search
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
        <LocalLibraryOutlined sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
          {searched ? 'No library titles matching your search criteria' : 'Enter keywords above to search central library titles'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
          Real-time rack availability and issue status will display here.
        </Typography>
      </Box>
    </Box>
  );
}
