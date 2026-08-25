import { createTheme } from '@mui/material/styles';

// ── CampusIQ+ Institutional Enterprise Design System ──────────────────────────
// Refined, corporate-grade Academic ERP / SIS interface (Workday / Linear aesthetic)
export const COLORS = {
  // Institutional Slate & Corporate Blue
  primary:        '#0f172a', // Slate 900
  primaryLight:   '#1e293b', // Slate 800
  primaryDark:    '#020617', // Slate 950
  secondary:      '#2563eb', // Enterprise Royal Blue
  secondaryLight: '#3b82f6',
  accent:         '#d97706', // Corporate Amber
  accentDark:     '#b45309',

  // Clean Neutral Canvas
  bgBase:         '#f8fafc', // Slate 50
  bgCard:         '#ffffff',
  bgSidebar:      '#ffffff',
  bgSidebarHov:   '#f1f5f9',
  bgDark:         '#f8fafc',

  // Typography
  textPrimary:    '#0f172a',
  textSecond:     '#475569', // Slate 600
  textMuted:      '#64748b', // Slate 500
  textOnDark:     '#f8fafc',
  textWhite:      '#ffffff',

  // Status & Performance (Enterprise Tints)
  excellent:      '#047857', // Emerald 700
  excellentBg:    '#f0fdf4',
  greenBg:        '#f0fdf4',
  strong:         '#1d4ed8', // Blue 700
  strongBg:       '#eff6ff',
  moderate:       '#b45309', // Amber 700
  moderateBg:     '#fffbeb',
  atRisk:         '#c2410c', // Orange 700
  atRiskBg:       '#fff7ed',
  critical:       '#b91c1c', // Red 700
  criticalBg:     '#fef2f2',

  // Architectural Borders & Subtle Elevation
  border:         '#e2e8f0', // Slate 200
  borderLight:    '#f1f5f9', // Slate 100
  borderDark:     '#cbd5e1', // Slate 300
  shadow:         'rgba(15, 23, 42, 0.04)',
  shadowMd:       'rgba(15, 23, 42, 0.08)',
  shadowLg:       'rgba(15, 23, 42, 0.12)',

  // Clean Corporate Accents (No playful flashy neons)
  gradPrimary:    'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  gradBlue:       'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
  gradAccent:     'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
  gradSuccess:    'linear-gradient(180deg, #059669 0%, #047857 100%)',
  gradDanger:     'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
  gradSidebar:    '#ffffff',
  gradCard:       '#ffffff',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: COLORS.primary,   light: COLORS.primaryLight, dark: COLORS.primaryDark, contrastText: '#ffffff' },
    secondary: { main: COLORS.secondary, light: COLORS.secondaryLight, contrastText: '#ffffff' },
    warning:   { main: COLORS.accent },
    success:   { main: COLORS.excellent },
    error:     { main: COLORS.critical },
    background:{ default: COLORS.bgBase, paper: COLORS.bgCard },
    text: {
      primary:   COLORS.textPrimary,
      secondary: COLORS.textSecond,
      disabled:  COLORS.textMuted,
    },
    divider: COLORS.border,
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em', color: COLORS.textPrimary },
    h2: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.015em',  color: COLORS.textPrimary },
    h3: { fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.01em', color: COLORS.textPrimary },
    h4: { fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.005em',  color: COLORS.textPrimary },
    h5: { fontWeight: 700, fontSize: '1rem',      letterSpacing: '0', color: COLORS.textPrimary },
    h6: { fontWeight: 700, fontSize: '0.875rem',  color: COLORS.textPrimary },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: COLORS.textPrimary },
    body2: { fontSize: '0.875rem', lineHeight: 1.55, color: COLORS.textSecond },
    caption: { fontSize: '0.8125rem', color: COLORS.textMuted, lineHeight: 1.4 },
    button: { fontWeight: 700, textTransform: 'none', fontSize: '0.875rem', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 2 },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    ...Array(19).fill('0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: ${COLORS.bgBase};
          color: ${COLORS.textPrimary};
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        }

        /* Enforce sharp, clean architectural lines */
        .MuiCard-root, .MuiPaper-root, .MuiButton-root, .MuiChip-root, 
        .MuiInputBase-root, .MuiOutlinedInput-root, .MuiDialog-paper, 
        .MuiAlert-root, .MuiMenu-paper, .MuiToggleButton-root, 
        .MuiTableContainer-root, .MuiTabs-root, .MuiTab-root {
          border-radius: 2px !important;
        }

        /* Subtle, precision scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Crisp text selection */
        ::selection {
          background: #dbeafe;
          color: #1e3a8a;
        }
      `
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '7px 16px',
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          letterSpacing: '0.01em',
          transition: 'background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        },
        containedPrimary: {
          backgroundColor: COLORS.primary,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.primaryLight,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        containedSecondary: {
          backgroundColor: COLORS.secondary,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderColor: COLORS.borderDark,
          color: COLORS.textPrimary,
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f8fafc',
          },
        },
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            '& fieldset': {
              borderColor: COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: COLORS.borderDark,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.secondary,
              borderWidth: '1.5px',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.84rem',
            color: COLORS.textSecond,
          },
        },
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 2,
          fontSize: '0.72rem',
          height: 22,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: '#f8fafc',
          color: COLORS.textPrimary,
        },
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#f8fafc',
            fontWeight: 700,
            color: COLORS.textSecond,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${COLORS.border}`,
            borderTop: `1px solid ${COLORS.border}`,
            padding: '10px 14px',
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc !important',
          },
        },
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.borderLight}`,
          padding: '11px 14px',
          fontSize: '0.8125rem',
          color: COLORS.textPrimary,
        },
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: 6,
          backgroundColor: '#e2e8f0',
        },
        bar: {
          borderRadius: 0,
        },
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontSize: '0.8125rem',
          border: '1px solid',
          padding: '8px 14px',
          '&.MuiAlert-standardWarning': {
            borderColor: '#fde68a',
            backgroundColor: '#fffbeb',
            color: '#92400e',
          },
          '&.MuiAlert-standardError': {
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
          },
          '&.MuiAlert-standardInfo': {
            borderColor: '#bfdbfe',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
          },
          '&.MuiAlert-standardSuccess': {
            borderColor: '#bbf7d0',
            backgroundColor: '#f0fdf4',
            color: '#166534',
          },
        },
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 2,
          fontSize: '0.72rem',
          fontWeight: 500,
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: 2,
        },
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontSize: '0.75rem',
          padding: '4px 10px',
          textTransform: 'none',
          borderColor: COLORS.border,
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '& .MuiToggleButtonGroup-grouped': {
            borderRadius: '2px !important',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.border,
        },
      }
    },
  }
});

// ── Performance helpers ─────────────────────────────────────────────────
export function getPerfColor(pct) {
  if (pct >= 90) return COLORS.excellent;
  if (pct >= 75) return COLORS.strong;
  if (pct >= 60) return COLORS.moderate;
  if (pct >= 40) return COLORS.atRisk;
  return COLORS.critical;
}
export function getPerfBg(pct) {
  if (pct >= 90) return COLORS.excellentBg;
  if (pct >= 75) return COLORS.strongBg;
  if (pct >= 60) return COLORS.moderateBg;
  if (pct >= 40) return COLORS.atRiskBg;
  return COLORS.criticalBg;
}
export function getPerfLabel(pct) {
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Strong';
  if (pct >= 60) return 'Moderate';
  if (pct >= 40) return 'At Risk';
  return 'Critical';
}
export function getAttColor(pct) {
  if (pct >= 75) return COLORS.excellent;
  if (pct >= 60) return COLORS.moderate;
  return COLORS.critical;
}
export function getAttStatus(pct) {
  if (pct >= 75) return 'Good';
  if (pct >= 60) return 'Warning';
  return 'Critical';
}
