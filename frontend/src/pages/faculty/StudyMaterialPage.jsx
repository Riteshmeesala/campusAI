import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Divider, Tooltip
} from '@mui/material';
import {
  MenuBook, Download, AutoStories, PictureAsPdf, Link,
  QuestionAnswer, LibraryBooks, CloudDownload, Add, CloudUpload,
  Delete, Edit
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';
import { broadcastDataChange, subscribeToDataSync, DATA_SYNC_EVENTS } from '../../services/dataSync';

export default function StudyMaterialPage() {
  const [open, setOpen] = useState(false);
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

  const [form, setForm] = useState({
    title: '',
    code: 'CS401',
    type: 'Lecture Notes / PPT',
    author: 'Prof. S. K. Sharma',
    size: '4.2 MB',
    year: 'Unit 2 Notes'
  });

  const handleUpload = () => {
    if (!form.title.trim()) {
      toast.error('Material title is required');
      return;
    }
    const newEntry = { ...form, id: Date.now() };
    const updated = [newEntry, ...materials];
    setMaterials(updated);
    localStorage.setItem('campusiq_study_materials', JSON.stringify(updated));
    broadcastDataChange('STUDY_MATERIAL_UPLOADED', { material: newEntry, allMaterials: updated });
    toast.success(`Study material "${form.title}" uploaded and published to Student Portals!`);
    setOpen(false);
    setForm({ title: '', code: 'CS401', type: 'Lecture Notes / PPT', author: 'Prof. S. K. Sharma', size: '4.2 MB', year: 'Unit 2 Notes' });
  };

  const handleDelete = (id) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    localStorage.setItem('campusiq_study_materials', JSON.stringify(updated));
    toast.info('Study material removed.');
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Study Material & Question Bank Repository"
        subtitle="Upload and manage subject lecture notes, reference e-books, model question banks, and previous question papers"
        breadcrumbs={['Home', 'Academic Management', 'Study Material', 'Upload Study Material']}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={() => toast.success('Downloading Master Question Bank 2024 (ZIP)')}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Download All (ZIP)
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
            >
              Upload Study Material
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {materials.map((mat) => (
          <Grid item xs={12} sm={6} md={4} key={mat.id}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={mat.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip label={mat.type} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      <IconButton size="small" color="error" onClick={() => handleDelete(mat.id)}>
                        <Delete fontSize="small" sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={0.5}>
                    {mat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Author / Source: <strong>{mat.author}</strong>
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

      {/* Upload Material Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Study Material & Notes</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Course" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}>
                  <MenuItem value="CS401">CS401: Operating Systems</MenuItem>
                  <MenuItem value="CS403">CS403: Artificial Intelligence</MenuItem>
                  <MenuItem value="CS405">CS405: Web Applications Lab</MenuItem>
                  <MenuItem value="CS407">CS407: Computer Networks</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Material Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <MenuItem value="Lecture Notes / PPT">Lecture Notes / PPT</MenuItem>
                  <MenuItem value="Standard Textbook">Standard Textbook</MenuItem>
                  <MenuItem value="Question Bank">Question Bank</MenuItem>
                  <MenuItem value="Lab Reference Guide">Lab Reference Guide</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Document Title"
              placeholder="e.g. Unit 3 Virtual Memory and Page Replacement PPT"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <Paper
              sx={{
                p: 3,
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                bgcolor: '#f8fafc',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: COLORS.secondary }
              }}
              onClick={() => toast.info('File attachment selected (PDF / PPTX / ZIP)')}
            >
              <CloudUpload sx={{ fontSize: 36, color: COLORS.secondary, mb: 0.5 }} />
              <Typography variant="subtitle2" fontWeight={700}>Select PDF or Document File</Typography>
              <Typography variant="caption" color="text.secondary">Supports PDF, PPTX, DOCX, ZIP up to 50MB</Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} sx={{ bgcolor: COLORS.secondary, fontWeight: 700 }}>
            Upload & Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
