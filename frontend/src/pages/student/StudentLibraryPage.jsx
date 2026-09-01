import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, InputAdornment, Tab, Tabs
} from '@mui/material';
import {
  LocalLibrary, Search, OpenInNew, AutoStories, Refresh
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function StudentLibraryPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const [myBorrowedBooks, setMyBorrowedBooks] = useState([
    { acc: 'ACC-84920', title: 'Operating System Concepts (10th Edition)', author: 'Silberschatz et al.', issued: '10 Feb 2024', due: '10 Mar 2024', daysLeft: '8 Days', status: 'ACTIVE LOAN' },
    { acc: 'ACC-91024', title: 'Deep Learning with Python', author: 'François Chollet', issued: '15 Feb 2024', due: '01 Mar 2024', daysLeft: 'Due Tomorrow', status: 'DUE SOON' },
  ]);

  const handleRenew = (acc) => {
    toast.success(`Book ${acc} renewed for an additional 14 days!`);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Central Digital Library & OPAC"
        subtitle="Search institutional library catalog, track your borrowed physical books, manage loan renewals, and access IEEE Xplore"
        breadcrumbs={['Home', 'Student', 'Library']}
        action={
          <Button
            variant="contained"
            startIcon={<OpenInNew />}
            onClick={() => window.open('https://ieeexplore.ieee.org', '_blank')}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
          >
            IEEE Xplore Gateway
          </Button>
        }
      />

      <Paper elevation={0} sx={{ borderBottom: `1px solid ${COLORS.border}`, mb: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ px: 2 }}>
          <Tab icon={<LocalLibrary fontSize="small" />} iconPosition="start" label="My Borrowed Books (2 Active)" />
          <Tab icon={<Search fontSize="small" />} iconPosition="start" label="OPAC Book Catalog Search" />
          <Tab icon={<AutoStories fontSize="small" />} iconPosition="start" label="Subscribed E-Databases" />
        </Tabs>
      </Paper>

      {/* Tab 0: Borrowed Books */}
      {tab === 0 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle1" fontWeight={700}>Your Active Library Book Loans & Due Date Tracker</Typography>
              <Chip label="Quota: 2 / 4 Books Borrowed" color="primary" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Accession No.', 'Book Title', 'Author', 'Date Issued', 'Return Due Date', 'Status', 'Action'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myBorrowedBooks.map((b, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{b.acc}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{b.title}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{b.author}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{b.issued}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: b.status === 'DUE SOON' ? '#ea580c' : '#16a34a', fontSize: 12 }}>
                        {b.due} ({b.daysLeft})
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={b.status}
                          size="small"
                          sx={{
                            bgcolor: b.status === 'DUE SOON' ? '#fef3c7' : '#dcfce7',
                            color: b.status === 'DUE SOON' ? '#92400e' : '#166534',
                            fontWeight: 700,
                            fontSize: 10
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Refresh />}
                          onClick={() => handleRenew(b.acc)}
                          sx={{ fontSize: 10, textTransform: 'none', py: 0.1, bgcolor: COLORS.secondary }}
                        >
                          Renew (+14 Days)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Book Search */}
      {tab === 1 && (
        <Box>
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: `1px solid ${COLORS.border}`, bgcolor: '#ffffff' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search OPAC Catalog by Book Title, Author, ISBN, or Call Number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      {['Acc No.', 'Book Title & Edition', 'Authors', 'Publisher', 'Call Number', 'Shelf Location', 'Availability'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { acc: 'ACC-84920', title: 'Operating System Concepts (10th Edition)', author: 'Silberschatz, Galvin', pub: 'Wiley', call: '005.43 SIL', shelf: 'Rack C4 - Shelf 2', avail: '12 / 15 Available' },
                      { acc: 'ACC-91024', title: 'Artificial Intelligence: A Modern Approach (4th Edition)', author: 'Russell & Norvig', pub: 'Pearson', call: '006.3 RUS', shelf: 'Rack C5 - Shelf 1', avail: '8 / 10 Available' },
                      { acc: 'ACC-73819', title: 'Computer Networks: A Top-Down Approach (8th Edition)', author: 'Kurose & Ross', pub: 'Pearson', call: '004.6 KUR', shelf: 'Rack B2 - Shelf 3', avail: '14 / 20 Available' },
                    ].map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{row.acc}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.title}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{row.author}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{row.pub}</TableCell>
                        <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{row.call}</TableCell>
                        <TableCell sx={{ fontSize: 11, fontWeight: 600, color: COLORS.secondary }}>{row.shelf}</TableCell>
                        <TableCell><Chip label={row.avail} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 2: E-Resources */}
      {tab === 2 && (
        <Grid container spacing={2.5}>
          {[
            { title: 'IEEE Xplore Digital Library', desc: 'Full-text access to IEEE transactions, journals, and conference proceedings.', badge: 'Subscribed (IP Authenticated)' },
            { title: 'ScienceDirect / Elsevier', desc: 'Leading scientific database for engineering, computer science, and AI papers.', badge: 'Subscribed' },
            { title: 'SpringerLink Journals', desc: 'Access to millions of scientific documents across engineering and technology.', badge: 'Subscribed' },
            { title: 'ACM Digital Library', desc: 'Flagship computing literature archive and conference proceedings.', badge: 'Campus License' },
          ].map((r, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Chip label={r.badge} color="success" size="small" sx={{ fontWeight: 700, fontSize: 10, mb: 1.5 }} />
                  <Typography variant="h6" fontWeight={700} color="#0f172a" mb={0.5}>{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{r.desc}</Typography>
                  <Button variant="outlined" startIcon={<OpenInNew />} onClick={() => toast.success(`Opening ${r.title}`)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Launch Portal
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
