import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { COLORS } from '../../theme/theme';

export default function StatCard({ icon, label, value, sub, color = COLORS.primary, trend, loading }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : TrendingFlat;
  const trendColor = trend > 0 ? COLORS.excellent : trend < 0 ? COLORS.critical : COLORS.textMuted;

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', bgcolor: `${color}10`
      }} />
      <CardContent sx={{ p: 2.5 }}>
        {loading ? (
          <>
            <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton width="60%" height={40} />
            <Skeleton width="80%" />
          </>
        ) : (
          <>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2, bgcolor: `${color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
            }}>
              <Box sx={{ color }}>{icon}</Box>
            </Box>
            <Typography variant="h4" fontWeight={800} color={COLORS.textPrimary} sx={{ lineHeight: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
            {(sub || trend !== undefined) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend !== undefined && <TrendIcon sx={{ fontSize: 14, color: trendColor }} />}
                <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>{sub}</Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
