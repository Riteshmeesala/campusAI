import React, { useState, useEffect } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button, Chip,
  LinearProgress, CircularProgress, Divider, Alert
} from '@mui/material';
import { AutoGraph, CheckCircle, Lightbulb, Schedule } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import PerformanceBadge from '../../components/shared/PerformanceBadge';
import { COLORS, getPerfColor, getPerfBg, getAttColor } from '../../theme/theme';

const STUDY_HOURS = { HIGH: 6, MEDIUM: 4, LOW: 2 };

export default function StudyPlanPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    aiAPI.getMyPerformance()
      .then(r => { 
        const raw = r.data.data;
        const normalized = {
          ...raw,
          averageMarksPercentage: parseFloat(raw?.overallPercentage || 0),
          overallAttendance: parseFloat(raw?.attendancePercentage || 0),
          subjectPerformances: (raw?.coursePerformances || []).map(cp => ({
            subjectCode: cp.courseCode,
            subjectName: cp.courseName,
            marksPercentage: parseFloat(cp.percentage || 0),
            grade: cp.grade,
          })),
          suggestions: raw?.suggestions || [],
          priorityAction: raw?.priorityAction,
        };
        setData(normalized); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <CircularProgress size={48} sx={{ color: COLORS.primary }} />
    </Box>
  );

  if (!data) return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>Could not load data.</Alert>
  );

  const highPriority   = data.subjectPerformances?.filter(s => s.priority === 'HIGH')   || [];
  const mediumPriority = data.subjectPerformances?.filter(s => s.priority === 'MEDIUM') || [];
  const lowPriority    = data.subjectPerformances?.filter(s => s.priority === 'LOW')    || [];

  const totalHours = STUDY_HOURS[data.riskLevel] || 4;

  const weekPlan = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, i) => {
    const subjects = [...highPriority, ...mediumPriority].slice(0, 3);
    const daySubj  = subjects[i % subjects.length];
    return { day, subject: daySubj?.subjectName || 'Review', hours: i < 5 ? totalHours : Math.max(2, totalHours - 2), type: i < 5 ? 'Study' : 'Revision' };
  });

  return (
    <Box>
      <PageHeader
        title="AI Study Plan"
        subtitle="Personalized schedule based on your performance analysis"
        breadcrumbs={['Home','Study Plan']}
      />

      <Grid container spacing={2.5}>
        {/* Performance context */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Your Profile</Typography>
              <PerformanceBadge percentage={data.averageMarksPercentage || 0} />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: COLORS.bgBase, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Daily Study Target</Typography>
                <Typography variant="h4" fontWeight={800} color={COLORS.primary}>{totalHours}h</Typography>
                <Typography variant="caption" color="text.secondary">Based on {data.riskLevel} risk level</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600} mb={1} color="text.secondary">Priority Subjects</Typography>
                {highPriority.map(s => (
                  <Chip key={s.subjectName} label={`🔴 ${s.subjectName}`} size="small"
                    sx={{ mr: 0.5, mb: 0.5, bgcolor: COLORS.criticalBg, color: COLORS.critical, fontSize: '0.72rem', fontWeight: 600 }} />
                ))}
                {mediumPriority.map(s => (
                  <Chip key={s.subjectName} label={`🟡 ${s.subjectName}`} size="small"
                    sx={{ mr: 0.5, mb: 0.5, bgcolor: COLORS.moderateBg, color: COLORS.moderate, fontSize: '0.72rem', fontWeight: 600 }} />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Lightbulb sx={{ color: COLORS.accent, fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700}>Smart Tips</Typography>
              </Box>
              {data.suggestions?.slice(0, 4).map((s, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                  <CheckCircle sx={{ fontSize: 16, color: COLORS.excellent, mt: 0.3, flexShrink: 0 }} />
                  <Typography variant="body2" color={COLORS.textPrimary} sx={{ lineHeight: 1.6 }}>{s}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly plan */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Schedule sx={{ color: COLORS.secondary }} />
                <Typography variant="h6" fontWeight={700}>7-Day Study Schedule</Typography>
              </Box>
              {weekPlan.map((day, i) => (
                <Box key={day.day} sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2,
                  borderRadius: 2, mb: 1.5,
                  bgcolor: i === new Date().getDay() - 1 ? `${COLORS.primary}08` : COLORS.bgBase,
                  border: `1px solid ${i === new Date().getDay() - 1 ? COLORS.primary + '25' : COLORS.border}`
                }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2, flexShrink: 0, textAlign: 'center',
                    bgcolor: i === new Date().getDay() - 1 ? COLORS.primary : COLORS.border,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Typography variant="caption" sx={{
                      color: i === new Date().getDay() - 1 ? '#fff' : COLORS.textSecond,
                      fontWeight: 700, fontSize: '0.65rem', lineHeight: 1
                    }}>{day.day.slice(0, 3).toUpperCase()}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} color={COLORS.textPrimary}>{day.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">{day.type} Session</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="h6" fontWeight={800} color={COLORS.primary}>{day.hours}h</Typography>
                    <Typography variant="caption" color="text.secondary">today</Typography>
                  </Box>
                  {i === new Date().getDay() - 1 && (
                    <Chip label="TODAY" size="small" sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
