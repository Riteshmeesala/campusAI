import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { COLORS } from '../../theme/theme';
import { anim } from '../../theme/animations';

export default function EmptyState({ icon, title, subtitle, action, actionLabel, actionIcon }) {
  return (
    <Box sx={{
      textAlign: 'center', py: 6, px: 3,
      ...anim.fadeInUp(0.1),
    }}>
      <Box sx={{ ...anim.float, mb: 2 }}>
        {icon || (
          <Typography sx={{ fontSize: '3.5rem', opacity: 0.7 }}>📭</Typography>
        )}
      </Box>
      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} mb={0.5}>
        {title || 'Nothing here yet'}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
      {action && (
        <Button
          variant="outlined" onClick={action}
          startIcon={actionIcon}
          sx={{ mt: 2.5, borderRadius: 3, px: 3 }}
        >
          {actionLabel || 'Get Started'}
        </Button>
      )}
    </Box>
  );
}
