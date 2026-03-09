import React from 'react';
import { Box, Typography, LinearProgress, Tooltip, Chip } from '@mui/material';
import { getAttColor, getAttStatus, COLORS } from '../../theme/theme';
import { Warning, CheckCircle, Error } from '@mui/icons-material';

export default function AttendanceBar({ subjectName, subjectCode, percentage, present, total, classesNeeded }) {
  const color  = getAttColor(percentage);
  const status = getAttStatus(percentage);
  const Icon   = percentage >= 75 ? CheckCircle : percentage >= 60 ? Warning : Error;

  return (
    <Box sx={{
      p: 2, borderRadius: 2, bgcolor: COLORS.bgCard,
      border: `1px solid ${COLORS.border}`, mb: 1.5
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="body2" fontWeight={700} color={COLORS.textPrimary}>{subjectName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{subjectCode}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">{present}/{total}</Typography>
          <Chip
            icon={<Icon sx={{ fontSize: '14px !important' }} />}
            label={`${percentage?.toFixed(1)}%`}
            size="small"
            sx={{
              bgcolor: `${color}18`, color, fontWeight: 700, fontSize: '0.75rem',
              border: `1px solid ${color}40`, '& .MuiChip-icon': { color: `${color} !important` }
            }}
          />
        </Box>
      </Box>
      <Tooltip title={status === 'Critical' ? `Need ${classesNeeded} more classes to reach 75%` : 'Attendance OK'}>
        <LinearProgress
          variant="determinate" value={Math.min(percentage || 0, 100)}
          sx={{
            height: 6, borderRadius: 3,
            bgcolor: `${color}20`,
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
          }}
        />
      </Tooltip>
      {status === 'Critical' && classesNeeded > 0 && (
        <Typography variant="caption" sx={{ color: COLORS.critical, mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
          ⚠️ Attend {classesNeeded} more classes to reach 75%
        </Typography>
      )}
    </Box>
  );
}
