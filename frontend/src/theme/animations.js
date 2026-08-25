// ── CampusIQ+ Animation System ──────────────────────────────────────────────
// Shared keyframes, animation utilities, and transition wrappers.
// All durations kept subtle (150-400ms) so they enhance without blocking.

// ── Keyframe definitions (for MUI sx / inline styles) ───────────────────────
export const keyframes = {
  fadeInUp: {
    '@keyframes fadeInUp': {
      '0%':   { opacity: 0, transform: 'translateY(18px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  fadeIn: {
    '@keyframes fadeIn': {
      '0%':   { opacity: 0 },
      '100%': { opacity: 1 },
    },
  },
  slideInLeft: {
    '@keyframes slideInLeft': {
      '0%':   { opacity: 0, transform: 'translateX(-20px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
  slideInRight: {
    '@keyframes slideInRight': {
      '0%':   { opacity: 0, transform: 'translateX(20px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
  scaleIn: {
    '@keyframes scaleIn': {
      '0%':   { opacity: 0, transform: 'scale(0.92)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  },
  shimmer: {
    '@keyframes shimmer': {
      '0%':   { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
  float: {
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%':      { transform: 'translateY(-6px)' },
    },
  },
  pulseGlow: {
    '@keyframes pulseGlow': {
      '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.3)' },
      '50%':      { boxShadow: '0 0 12px 4px rgba(37,99,235,0.15)' },
    },
  },
  breathe: {
    '@keyframes breathe': {
      '0%, 100%': { opacity: 0.7 },
      '50%':      { opacity: 1 },
    },
  },
  gradientShift: {
    '@keyframes gradientShift': {
      '0%':   { backgroundPosition: '0% 50%' },
      '50%':  { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  },
  countUp: {
    '@keyframes countUp': {
      '0%':   { opacity: 0, transform: 'translateY(8px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  bellShake: {
    '@keyframes bellShake': {
      '0%':   { transform: 'rotate(0)' },
      '15%':  { transform: 'rotate(14deg)' },
      '30%':  { transform: 'rotate(-14deg)' },
      '45%':  { transform: 'rotate(10deg)' },
      '60%':  { transform: 'rotate(-8deg)' },
      '75%':  { transform: 'rotate(4deg)' },
      '100%': { transform: 'rotate(0)' },
    },
  },
};

// ── Animation presets (use directly in sx prop) ─────────────────────────────
export const anim = {
  fadeInUp:     (delay = 0) => ({
    ...keyframes.fadeInUp,
    animation: `fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  }),
  fadeIn:       (delay = 0) => ({
    ...keyframes.fadeIn,
    animation: `fadeIn 0.35s ease ${delay}s both`,
  }),
  slideInLeft:  (delay = 0) => ({
    ...keyframes.slideInLeft,
    animation: `slideInLeft 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  }),
  slideInRight: (delay = 0) => ({
    ...keyframes.slideInRight,
    animation: `slideInRight 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  }),
  scaleIn:      (delay = 0) => ({
    ...keyframes.scaleIn,
    animation: `scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  }),
  float: {
    ...keyframes.float,
    animation: 'float 3s ease-in-out infinite',
  },
  pulseGlow: {
    ...keyframes.pulseGlow,
    animation: 'pulseGlow 2.5s ease-in-out infinite',
  },
  breathe: {
    ...keyframes.breathe,
    animation: 'breathe 3s ease-in-out infinite',
  },
  shimmer: {
    ...keyframes.shimmer,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.8s infinite',
  },
  gradientBg: {
    ...keyframes.gradientShift,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 12s ease infinite',
  },
  bellShake: {
    ...keyframes.bellShake,
    animation: 'bellShake 0.6s ease',
  },
};

// ── Stagger helper — returns delay for the nth item ─────────────────────────
export const stagger = (index, baseDelay = 0.06) => baseDelay * index;

// ── Glass effect tokens ─────────────────────────────────────────────────────
export const glass = {
  light: {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  dark: {
    background: 'rgba(15,35,69,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  subtle: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
};

// ── Hover presets ────────────────────────────────────────────────────────────
export const hoverLift = {
  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px rgba(15,35,69,0.12)',
  },
};

export const hoverScale = {
  transition: 'transform 0.2s ease',
  '&:hover': { transform: 'scale(1.04)' },
};

export const hoverGlow = (color = '#2563eb') => ({
  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 24px ${color}20, 0 0 0 1px ${color}15`,
  },
});

// ── Shimmer skeleton bg ─────────────────────────────────────────────────────
export const shimmerBg = {
  ...keyframes.shimmer,
  background: 'linear-gradient(90deg, #f0f4fa 25%, #e8edf5 50%, #f0f4fa 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.8s ease-in-out infinite',
  borderRadius: 2,
};
