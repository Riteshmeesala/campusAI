import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Paper, Stack, Avatar, Divider
} from '@mui/material';
import {
  MenuBook, Download, AutoStories, Edit, Visibility,
  Star, Share, ThumbUp
} from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function VOVMagazinePage() {
  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="VOV Magazine & Research Publications"
        subtitle="Voices of Vision (VOV) institutional magazine, faculty technical columns, campus spotlights, and student editions"
        breadcrumbs={['Home', 'Faculty', 'VOV Magazine']}
        action={
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => toast.info('Article submission portal opened. Please attach your draft.')}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
          >
            Submit Article for Next Issue
          </Button>
        }
      />

      <Grid container spacing={3}>
        {[
          { title: 'VOV Tech Pulse — Volume 14 (Spring 2024 Issue)', desc: 'Special feature on Quantum Machine Learning, Edge AI in Smart Cities, and student campus startups.', author: 'Edited by Department Editorial Board', date: 'February 2024', reads: 840, cover: 'Edition 14' },
          { title: 'VOV Annual Research Spectrum — Vol 13', desc: 'Compilation of peer-reviewed IEEE and Scopus papers authored by faculty and research scholars.', author: 'Dean of R&D and Editorial Committee', date: 'December 2023', reads: 1250, cover: 'Research Special' },
          { title: 'Campus Voices & Cultural Chronicles — Vol 12', desc: 'Spotlight on student innovation hackathons, cultural festivals, sports championships, and alumni milestones.', author: 'Student Literary Club', date: 'October 2023', reads: 960, cover: 'Cultural Issue' },
        ].map((mag, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ height: 140, bgcolor: '#0f172a', p: 3, color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Chip label={mag.cover} color="primary" size="small" sx={{ width: 'fit-content', fontWeight: 700 }} />
                <Typography variant="h6" fontWeight={800} color="#f8fafc">
                  VOICES OF VISION
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={1}>
                    {mag.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {mag.desc}
                  </Typography>
                </Box>
                <Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {mag.author} • {mag.date}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="#2563eb">
                      {mag.reads} Reads
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => toast.success(`Downloading ${mag.title}`)}
                      sx={{ textTransform: 'none' }}
                    >
                      Read PDF
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
