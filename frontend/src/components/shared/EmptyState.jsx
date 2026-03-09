import React from 'react';
import { Box, Typography } from '@mui/material';
import { COLORS } from '../../theme/theme';

export default function EmptyState({ icon, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
      <Typography fontSize="3rem" mb={1.5}>{icon || '📭'}</Typography>
      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} mb={0.5}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
  );
}
