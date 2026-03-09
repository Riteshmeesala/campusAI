import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { COLORS } from '../../theme/theme';

export default function SectionCard({ title, subtitle, children, action, noPadding }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: noPadding ? 0 : 2.5, '&:last-child': { pb: noPadding ? 0 : 2.5 } }}>
        {(title || action) && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: noPadding ? 2.5 : 0, pb: noPadding ? 0 : 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>{title}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
              </Box>
              {action}
            </Box>
            {noPadding && <Divider />}
          </>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
