import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Tooltip, Chip } from '@mui/material';
import { getAttColor, getAttStatus, COLORS } from '../../theme/theme';
import { Warning, CheckCircle, Error } from '@mui/icons-material';

export default function AttendanceBar({ subjectName, subjectCode, percentage, present, total, classesNeeded }) {
  const color  = getAttColor(percentage);
  const status = getAttStatus(percentage);
  const Icon   = percentage >= 75 ? CheckCircle : percentage >= 60 ? Warning : Error;

  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimPct(Math.min(percentage || 0, 100)), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Box sx={{
      p: 2, borderRadius: 3, bgcolor: COLORS.bgCard,
      border: `1px solid ${COLORS.border}`, mb: 1.5,
      transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      '&:hover': {
        borderColor: `${color}40`,
        boxShadow: `0 4px 16px ${color}10`,
        transform: 'translateX(4px)',
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: color,
            boxShadow: `0 0 8px ${color}50`,
          }} />
          <Box>
            <Typography variant="body2" fontWeight={700} color={COLORS.textPrimary}>{subjectName}</Typography>
            <Typography variant="caption" color="text.secondary"
              sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>{subjectCode}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {present}/{total}
          </Typography>
          <Chip
            icon={<Icon sx={{ fontSize: '14px !important' }} />}
            label={`${percentage?.toFixed(1)}%`}
            size="small"
            sx={{
              bgcolor: `${color}12`, color, fontWeight: 700, fontSize: '0.75rem',
              border: `1px solid ${color}25`, '& .MuiChip-icon': { color: `${color} !important` },
            }}
          />
        </Box>
      </Box>
      <Tooltip title={status === 'Critical' ? `Need ${classesNeeded} more classes to reach 75%` : 'Attendance OK'}>
        <LinearProgress
          variant="determinate" value={animPct}
          sx={{
            height: 7, borderRadius: 4,
            bgcolor: `${color}12`,
            '& .MuiLinearProgress-bar': {
              bgcolor: color, borderRadius: 4,
              transition: 'transform 1.2s cubic-bezier(0.22,1,0.36,1)',
            },
          }}
        />
      </Tooltip>
      {status === 'Critical' && classesNeeded > 0 && (
        <Typography variant="caption" sx={{
          color: COLORS.critical, mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.5,
          fontSize: '0.7rem', fontWeight: 600,
        }}>
          <Error sx={{ fontSize: 12 }} /> Attend {classesNeeded} more classes to reach 75%
        </Typography>
      )}
    </Box>
  );
}
