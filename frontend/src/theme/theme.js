import { createTheme } from '@mui/material/styles';

// ── CampusIQ+ Design System ────────────────────────────────────────────
// Aesthetic: Refined, data-forward, premium SaaS
// Primary palette: Deep navy + electric blue + amber accent
export const COLORS = {
  // Brand
  primary:      '#0f2345',   // Deep navy
  primaryLight: '#1a3c6e',   // Royal blue
  primaryDark:  '#080f1e',   // Almost black navy
  secondary:    '#2563eb',   // Electric blue
  accent:       '#f59e0b',   // Amber gold
  accentDark:   '#d97706',   // Deep amber

  // Backgrounds
  bgBase:       '#f0f4fa',   // Cool off-white
  bgCard:       '#ffffff',
  bgSidebar:    '#0f2345',   // Navy sidebar
  bgSidebarHov: '#1a3c6e',
  bgDark:       '#080f1e',

  // Text
  textPrimary:  '#0f172a',   // Almost black
  textSecond:   '#475569',   // Slate
  textMuted:    '#94a3b8',   // Light slate
  textOnDark:   '#e2e8f0',
  textWhite:    '#ffffff',

  // Status / Performance
  excellent:    '#059669',   // 90-100% — emerald
  excellentBg:  '#d1fae5',
  strong:       '#2563eb',   // 75-89% — blue
  strongBg:     '#dbeafe',
  moderate:     '#d97706',   // 60-74% — amber
  moderateBg:   '#fef3c7',
  atRisk:       '#ea580c',   // 40-59% — orange
  atRiskBg:     '#ffedd5',
  critical:     '#dc2626',   // <40% — red
  criticalBg:   '#fee2e2',

  // Utility
  border:       '#e2e8f0',
  shadow:       'rgba(15,35,69,0.08)',
  shadowMd:     'rgba(15,35,69,0.14)',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: COLORS.primary,   light: COLORS.primaryLight, dark: COLORS.primaryDark, contrastText: '#fff' },
    secondary: { main: COLORS.secondary, contrastText: '#fff' },
    warning:   { main: COLORS.accent },
    success:   { main: COLORS.excellent },
    error:     { main: COLORS.critical },
    background:{ default: COLORS.bgBase, paper: COLORS.bgCard },
    text: {
      primary:   COLORS.textPrimary,
      secondary: COLORS.textSecond,
      disabled:  COLORS.textMuted,
    },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem',   letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem',  lineHeight: 1.5 },
    caption: { fontSize: '0.8125rem', color: COLORS.textMuted },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    `0 1px 3px ${COLORS.shadow}`,
    `0 2px 8px ${COLORS.shadow}`,
    `0 4px 16px ${COLORS.shadowMd}`,
    `0 8px 24px ${COLORS.shadowMd}`,
    ...Array(20).fill(`0 8px 24px ${COLORS.shadowMd}`),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bgBase}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.textMuted}; }
      `
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px', fontWeight: 600 },
        contained: {
          boxShadow: `0 2px 8px ${COLORS.shadowMd}`,
          '&:hover': { boxShadow: `0 4px 16px ${COLORS.shadowMd}` }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, border: `1px solid ${COLORS.border}`,
          boxShadow: `0 2px 8px ${COLORS.shadow}`,
          '&:hover': { boxShadow: `0 4px 16px ${COLORS.shadowMd}` },
          transition: 'box-shadow 0.2s ease'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } }
      }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: COLORS.bgBase, fontWeight: 700,
            color: COLORS.textPrimary, fontSize: '0.8125rem',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 8 }
      }
    }
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
