import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { COLORS } from '../../theme/theme';

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1, fontSize: '0.8rem' }}>
          {breadcrumbs.map((b, i) => i < breadcrumbs.length - 1
            ? <Link key={b} href="#" underline="hover" color="inherit" fontSize="0.8rem">{b}</Link>
            : <Typography key={b} fontSize="0.8rem" color="text.primary">{b}</Typography>
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={COLORS.textPrimary} sx={{ letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
