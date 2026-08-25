import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../theme/theme';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, ${COLORS.primaryLight} 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradShift 12s ease infinite',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating orbs */}
      <Box sx={{
        position: 'absolute', top: '20%', left: '20%', width: 200, height: 200,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 60%)',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
      }} />
      <Box sx={{
        position: 'absolute', bottom: '20%', right: '15%', width: 150, height: 150,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 60%)',
        animation: 'float 8s ease-in-out infinite 1s',
      }} />

      <Box sx={{
        textAlign: 'center', position: 'relative', zIndex: 1, p: 4,
        animation: 'fadeInUp 0.6s ease both',
        '@keyframes fadeInUp': { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        '@keyframes gradShift': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
      }}>
        <Typography sx={{
          fontSize: '8rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
          background: `linear-gradient(135deg, rgba(255,255,255,0.9), ${COLORS.accent})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          mb: 2,
        }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
          Page Not Found
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, maxWidth: 400, mx: 'auto' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}
          sx={{
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
            color: COLORS.primary, fontWeight: 700, borderRadius: 3, px: 4, py: 1.3,
            boxShadow: `0 4px 20px ${COLORS.accent}40`,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${COLORS.accent}50` },
          }}>
          Go Home →
        </Button>
      </Box>
    </Box>
  );
}
