import React, { useState } from 'react';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import PageHeader from '../../components/shared/PageHeader';

export default function StudentSatisfactionSurveyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [val1, setVal1] = useState('Excellent');
  const [val2, setVal2] = useState('Satisfactory');

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title="Student Satisfaction Survey (SSS)"
        subtitle="Institutional survey evaluating curriculum quality, campus infrastructure, and learning experience"
        breadcrumbs={[{ label: 'Dashboard', path: '/student/dashboard' }, { label: 'Satisfaction Survey' }]}
      />

      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>Thank you! Your feedback has been recorded anonymously.</Alert>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', mb: 2 }}>Institutional Survey Questionnaire</Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155', mb: 1 }}>1. How effectively does the syllabus meet modern industry standards?</Typography>
            <RadioGroup row value={val1} onChange={(e) => setVal1(e.target.value)}>
              <FormControlLabel value="Excellent" control={<Radio size="small" />} label="Excellent" />
              <FormControlLabel value="Good" control={<Radio size="small" />} label="Good" />
              <FormControlLabel value="Satisfactory" control={<Radio size="small" />} label="Satisfactory" />
            </RadioGroup>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155', mb: 1 }}>2. Satisfaction with digital library resources and laboratory computing infrastructure:</Typography>
            <RadioGroup row value={val2} onChange={(e) => setVal2(e.target.value)}>
              <FormControlLabel value="Excellent" control={<Radio size="small" />} label="Excellent" />
              <FormControlLabel value="Good" control={<Radio size="small" />} label="Good" />
              <FormControlLabel value="Satisfactory" control={<Radio size="small" />} label="Satisfactory" />
            </RadioGroup>
          </Box>

          <Button variant="contained" onClick={() => setSubmitted(true)} sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
            Submit Survey Response
          </Button>
        </Box>
      )}
    </Box>
  );
}
