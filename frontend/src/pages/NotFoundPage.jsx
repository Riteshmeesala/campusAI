import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../theme/theme';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      bgcolor: COLORS.bgBase, p: 3
    }}>
      <Typography fontSize="6rem" mb={2}>🎓</Typography>
      <Typography variant="h2" fontWeight={900} color={COLORS.primary} mb={1}>404</Typography>
      <Typography variant="h5" fontWeight={700} mb={1}>Page Not Found</Typography>
      <Typography color="text.secondary" mb={3} maxWidth={400}>
        The page you are looking for doesn't exist or you don't have permission to access it.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}
        sx={{ borderRadius: 2, bgcolor: COLORS.primary, px: 4 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
