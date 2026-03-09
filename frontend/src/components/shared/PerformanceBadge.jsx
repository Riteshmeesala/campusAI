import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { getPerfColor, getPerfBg, getPerfLabel, COLORS } from '../../theme/theme';

export default function PerformanceBadge({ percentage, size = 'medium', showBar = true, showLabel = true }) {
  const color = getPerfColor(percentage);
  const bg    = getPerfBg(percentage);
  const label = getPerfLabel(percentage);

  const icon = percentage >= 90 ? '🏆' : percentage >= 75 ? '⭐' : percentage >= 60 ? '📘' : percentage >= 40 ? '⚠️' : '🚨';

  if (size === 'small') {
    return (
      <Chip
        label={`${icon} ${label} ${percentage.toFixed(0)}%`}
        size="small"
        sx={{ bgcolor: bg, color, fontWeight: 700, border: `1px solid ${color}40`, fontSize: '0.75rem' }}
      />
    );
  }

  return (
    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: bg, border: `1px solid ${color}30` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: showBar ? 1.5 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontSize="1.5rem">{icon}</Typography>
          {showLabel && (
            <Box>
              <Typography fontWeight={700} sx={{ color, lineHeight: 1 }}>{label}</Typography>
              <Typography variant="caption" color="text.secondary">Performance</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ color }}>{percentage.toFixed(1)}%</Typography>
      </Box>
      {showBar && (
        <LinearProgress
          variant="determinate" value={Math.min(percentage, 100)}
          sx={{ '& .MuiLinearProgress-bar': { bgcolor: color }, bgcolor: `${color}20` }}
        />
      )}
    </Box>
  );
}
