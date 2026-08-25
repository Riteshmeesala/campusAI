import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { COLORS } from '../../theme/theme';

function AnimatedValue({ value, duration = 600 }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const target = typeof value === 'string' ? value : value;
    const numTarget = parseFloat(String(target).replace(/[^0-9.-]/g, ''));
    const numPrev   = parseFloat(String(prev.current).replace(/[^0-9.-]/g, ''));

    if (isNaN(numTarget) || isNaN(numPrev)) {
      setDisplay(value);
      prev.current = value;
      return;
    }

    const prefix = String(target).match(/^[^0-9.-]*/)?.[0] || '';
    const suffix = String(target).match(/[^0-9.]*$/)?.[0] || '';
    const isFloat = String(target).includes('.');
    const decimals = isFloat ? (String(target).split('.')[1]?.replace(/[^0-9]/g, '')?.length || 1) : 0;

    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numPrev + (numTarget - numPrev) * eased;
      setDisplay(`${prefix}${isFloat ? current.toFixed(decimals) : Math.round(current)}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    prev.current = value;
  }, [value, duration]);

  return <>{display}</>;
}

export default function StatCard({ icon, label, value, sub, color = COLORS.primary, trend, loading }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : TrendingFlat;
  const trendColor = trend > 0 ? COLORS.excellent : trend < 0 ? COLORS.critical : COLORS.textMuted;

  return (
    <Card sx={{
      height: '100%',
      backgroundColor: '#ffffff',
      border: `1px solid ${COLORS.border}`,
      position: 'relative',
      borderRadius: 0.5,
    }}>
      {/* Precision indicator stripe */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 3,
        bottom: 0,
        backgroundColor: color,
      }} />

      <CardContent sx={{ p: 2, pl: 2.5, '&:last-child': { pb: 2 } }}>
        {loading ? (
          <>
            <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="60%" height={32} />
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: COLORS.textMuted,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mt: 0.5,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <AnimatedValue value={value} />
              </Typography>
              {(sub || trend !== undefined) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                  {trend !== undefined && <TrendIcon sx={{ fontSize: 13, color: trendColor }} />}
                  <Typography variant="caption" sx={{ color: trendColor, fontWeight: 500, fontSize: '0.72rem' }}>
                    {sub}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 0.5,
                backgroundColor: `${color}10`,
                border: `1px solid ${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
