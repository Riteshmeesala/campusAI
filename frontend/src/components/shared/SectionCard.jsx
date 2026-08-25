import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { COLORS } from '../../theme/theme';

export default function SectionCard({ title, children, action, icon, sx = {} }) {
  return (
    <Card sx={{
      overflow: 'hidden',
      ...sx,
    }}>
      <CardContent sx={{ p: 2.5 }}>
        {(title || action) && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mb: 2.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon && (
                <Box sx={{
                  width: 32, height: 32, borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.secondary}15, ${COLORS.secondary}05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </Box>
              )}
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>{title}</Typography>
            </Box>
            {action}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
