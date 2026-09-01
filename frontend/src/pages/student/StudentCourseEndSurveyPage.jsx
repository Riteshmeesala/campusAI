import React, { useState } from 'react';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentCourseEndSurveyPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Course End Survey (CES)"
        subtitle="End-of-semester course outcome (CO) and program outcome (PO) attainment assessment"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Course End Survey' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>Thank you! Your course end evaluation has been recorded.</Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 2 }}>Course Outcome Evaluation</Typography>
          <Typography sx={{ fontSize: 14, color: '#475569', mb: 2 }}>Evaluate the level of proficiency achieved for your current semester theory and laboratory courses.</Typography>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#334155', mb: 1 }}>Course Outcome Attainment Level (CO1 - CO5):</Typography>
            <RadioGroup row defaultValue="High">
              <FormControlLabel value="High" control={<Radio size="small" />} label="High (>=80%)" />
              <FormControlLabel value="Moderate" control={<Radio size="small" />} label="Moderate (60-79%)" />
              <FormControlLabel value="Low" control={<Radio size="small" />} label="Low (<60%)" />
            </RadioGroup>
          </Box>
          <Button variant="contained" onClick={() => setSubmitted(true)} sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
            Submit CES Assessment
          </Button>
        </Box>
      )}
    </Box>
  );
}
