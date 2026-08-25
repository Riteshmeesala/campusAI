import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getPerfColor, getPerfBg, getPerfLabel, COLORS } from '../../theme/theme';
import { keyframes as kf } from '../../theme/animations';

function RadialGauge({ percentage, size = 120, strokeWidth = 10 }) {
  const color = getPerfColor(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (Math.min(percentage, 100) / 100) * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={`${color}15`} strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }}
        />
        {/* Glow */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth + 6}
          strokeLinecap="round" opacity={0.08}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)', filter: 'blur(4px)' }}
        />
      </svg>
      {/* Center text */}
      <Box sx={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: size * 0.2, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {percentage.toFixed(0)}
        </Typography>
        <Typography sx={{ fontSize: size * 0.085, color: COLORS.textMuted, fontWeight: 500, mt: 0.2 }}>
          percent
        </Typography>
      </Box>
    </Box>
  );
}

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
        sx={{ bgcolor: bg, color, fontWeight: 700, border: `1px solid ${color}30`, fontSize: '0.75rem' }}
      />
    );
  }

  return (
    <Box sx={{
      p: 2.5, borderRadius: 4, bgcolor: bg, border: `1px solid ${color}20`,
      ...kf.fadeIn,
      animation: 'fadeIn 0.5s ease both',
    }}>
      <RadialGauge percentage={percentage} size={showBar ? 130 : 100} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
        <Typography fontSize="1.3rem">{icon}</Typography>
        {showLabel && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontWeight={700} sx={{ color, lineHeight: 1, fontSize: '0.95rem' }}>{label}</Typography>
            <Typography variant="caption" color="text.secondary">Performance</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
