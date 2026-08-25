import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { COLORS } from '../../theme/theme';

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 13, color: COLORS.textMuted }} />}
          sx={{ mb: 0.75 }}
        >
          {breadcrumbs.map((b, i) => i < breadcrumbs.length - 1
            ? <Typography key={b} sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 500 }}>{b}</Typography>
            : <Typography key={b} sx={{ fontSize: '0.75rem', color: COLORS.textSecond, fontWeight: 600 }}>{b}</Typography>
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            fontSize: '1.35rem',
            letterSpacing: '-0.02em',
            color: COLORS.textPrimary,
            lineHeight: 1.25,
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{
              mt: 0.5,
              color: COLORS.textSecond,
              fontSize: '0.8125rem',
              fontWeight: 400,
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ flexShrink: 0 }}>{action}</Box>
        )}
      </Box>
    </Box>
  );
}
