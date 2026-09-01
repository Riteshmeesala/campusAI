import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  TextField, InputAdornment, Paper, Stack, Divider
} from '@mui/material';
import {
  Download, Search, CloudDownload
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';
import { subscribeToDataSync } from '../../services/dataSync';

export default function StudentStudyMaterialPage() {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('campusiq_study_materials');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Operating System Concepts (Silberschatz, Galvin & Gagne - 10th Ed)', type: 'Standard Textbook', code: 'CS401', size: '18.4 MB', author: 'Silberschatz et al.', year: 'R22 Core' },
      { id: 2, title: 'Artificial Intelligence: A Modern Approach (Stuart Russell & Peter Norvig)', type: 'Standard Textbook', code: 'CS403', size: '24.2 MB', author: 'Russell & Norvig', year: 'R22 Core' },
      { id: 3, title: 'Full Stack Modern Web Development with React, Spring Boot & Docker', type: 'Lab Reference Guide', code: 'CS405', size: '8.5 MB', author: 'Department Faculty Team', year: 'Lab Manual' },
      { id: 4, title: 'CS401: Previous 5 Years University End-Sem Question Papers (2019-2023)', type: 'Question Bank', code: 'CS401', size: '5.1 MB', author: 'Exam Cell Archive', year: 'Model Solutions Included' },
      { id: 5, title: 'CS403: 200 Important Concept Questions with Step-by-Step Solutions', type: 'Question Bank', code: 'CS403', size: '6.8 MB', author: 'Dr. S. K. Sharma', year: 'Mid-term 1 & 2' },
      { id: 6, title: 'Distributed Systems: Concepts and Design (Coulouris, Dollimore)', type: 'Reference E-Book', code: 'CS401', size: '14.0 MB', author: 'George Coulouris', year: 'Reference Book' },
    ];
  });

  useEffect(() => {
    const unsubscribe = subscribeToDataSync((event) => {
      if (event.type === 'STUDY_MATERIAL_UPLOADED') {
        setMaterials(prev => [event.payload.material, ...prev]);
        toast.info(`New study material uploaded by faculty: ${event.payload.material.title}`);
      }
    });
    return unsubscribe;
  }, []);

  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    const matchQ = m.title.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || m.author.toLowerCase().includes(q);
    const matchCourse = selectedCourse === 'ALL' || m.code === selectedCourse;
    return matchQ && matchCourse;
  });

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Course Study Material & Question Banks"
        subtitle="Access and download subject lecture notes, standard e-textbooks, lab reference guides, and previous question papers uploaded by faculty"
        breadcrumbs={['Home', 'Student', 'Study Material']}
        action={
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => toast.success('Downloading Master Question Bank (ZIP)')}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
          >
            Download All (ZIP)
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${COLORS.border}`, bgcolor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by topic, book title, author, or subject code..."
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
          </Grid>
          <Grid item xs={12} sm={5}>
            <Stack direction="row" spacing={1} overflow="auto">
              {['ALL', 'CS401', 'CS403', 'CS405'].map(c => (
                <Chip
                  key={c}
                  label={c === 'ALL' ? 'All Subjects' : c}
                  clickable
                  color={selectedCourse === c ? 'primary' : 'default'}
                  onClick={() => setSelectedCourse(c)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filtered.map(mat => (
          <Grid item xs={12} sm={6} md={4} key={mat.id}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={mat.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label={mat.type} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={0.5}>
                    {mat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Faculty / Author: <strong>{mat.author}</strong>
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {mat.size} • {mat.year}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => toast.success(`Downloading ${mat.title}`)}
                      sx={{ textTransform: 'none', fontSize: 11, bgcolor: COLORS.secondary, borderRadius: 1 }}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
