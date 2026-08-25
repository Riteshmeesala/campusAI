import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const C = {
  primary: '#0f2345', primaryDark: '#080f1e', primaryLight: '#1a3c6e',
  secondary: '#2563eb', secondaryLight: '#3b82f6',
  accent: '#f59e0b', accentLight: '#fbbf24',
  text: '#0f172a', textSub: '#475569', textMuted: '#94a3b8',
  border: '#e2e8f0', surface: 'rgba(255,255,255,0.85)',
  success: '#059669', danger: '#dc2626',
};

const DASH = {
  ADMIN: '/admin/dashboard',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  useLocation();
  const { login, verifyOtp, pendingEmail, user, isAuthenticated, loading } = useAuth();

  const [step, setStep] = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpUser, setOtpUser] = useState(pendingEmail || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(DASH[user.role] || '/', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary}, ${C.primaryLight})`,
        backgroundSize: '400% 400%',
        animation: 'gradShift 8s ease infinite',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.2rem', color: C.primary,
            margin: '0 auto 20px', boxShadow: `0 8px 24px ${C.accent}50`,
            animation: 'pulseScale 1.5s ease infinite',
          }}>IQ</div>
          <p style={{ fontWeight: 600, opacity: 0.8 }}>Loading CampusIQ+...</p>
        </div>
        <style>{`
          @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
          @keyframes pulseScale { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        `}</style>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Enter username and password');
      return;
    }
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await login(form.username.trim(), form.password);
      if (result.twoFactorRequired) {
        setOtpUser(form.username.trim());
        setStep('otp');
        setSuccess('OTP sent to your registered email.');
        return;
      }
      const dest = DASH[result.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Invalid username or password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await verifyOtp(otpUser, otp);
      navigate(DASH[result.role] || '/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (username) => {
    setForm({ username, password: 'campusiq@1234' });
    setError('');
    setSuccess('');
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 48px',
    border: `1.5px solid rgba(226,232,240,0.6)`, borderRadius: 14,
    fontSize: '0.92rem', outline: 'none',
    background: 'rgba(248,250,252,0.6)',
    fontFamily: "'Inter', system-ui, sans-serif", boxSizing: 'border-box',
    color: C.text, transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
    backdropFilter: 'blur(8px)',
  };

  const btnPrimary = {
    width: '100%', padding: '14px', borderRadius: 14,
    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
    border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.7 : 1, fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
    boxShadow: `0 4px 16px ${C.primary}40`,
    letterSpacing: '-0.01em',
    position: 'relative', overflow: 'hidden',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: `linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 40%, ${C.primaryLight} 70%, ${C.secondary} 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradShift 15s ease infinite',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%', width: 300, height: 300,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%)',
        animation: 'floatOrb1 8s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 60%)',
        animation: 'floatOrb2 10s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '45%', width: 180, height: 180,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)',
        animation: 'floatOrb3 12s ease-in-out infinite', pointerEvents: 'none',
      }} />

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px',
        color: '#fff', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.3rem', color: C.primary,
            boxShadow: `0 8px 32px ${C.accent}40`,
          }}>IQ</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em' }}>CampusIQ+</span>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: 2 }}>
              SMART CAMPUS PLATFORM
            </div>
          </div>
        </div>

        <h1 style={{
          fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15,
          marginBottom: 20, letterSpacing: '-0.03em',
        }}>
          Smart Campus,<br />Smarter Futures.
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 420, marginBottom: 40,
          fontSize: '1.05rem',
        }}>
          AI-powered learning platform with real-time analytics, attendance tracking,
          exam management, and personalized insights.
        </p>

        {[
          ['🎓', 'AI Performance Analytics'],
          ['📊', 'Real-time Attendance Insights'],
          ['💬', 'Intelligent CampusMate Chatbot'],
          ['💳', 'Seamless Fee Management'],
        ].map(([icon, label], i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: `all 0.5s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.1}s`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>{icon}</div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '0.95rem' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Right login card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, minWidth: 440, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 430,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24, padding: 40,
          boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s',
        }}>
          <div style={{ marginBottom: 28 }}>
            {step === 'otp' && (
              <button onClick={() => { setStep('login'); setError(''); setSuccess(''); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.secondary, fontSize: '1.1rem', padding: '0 8px 0 0',
                transition: 'transform 0.2s',
              }}>←</button>
            )}
            <h2 style={{
              margin: 0, fontWeight: 800, color: C.text, fontSize: '1.6rem',
              letterSpacing: '-0.03em',
            }}>
              {step === 'login' ? 'Welcome back' : 'Verify OTP'}
            </h2>
            <p style={{ margin: '6px 0 0', color: C.textSub, fontSize: '0.88rem' }}>
              {step === 'login' ? 'Sign in to your CampusIQ+ account' : `OTP sent to your email`}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: `1px solid ${C.danger}20`,
              color: C.danger, padding: '12px 16px', borderRadius: 12,
              fontSize: '0.85rem', marginBottom: 18, fontWeight: 500,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              animation: 'shakeX 0.4s ease',
            }}>
              <span>⚠️ {error}</span>
              <span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem' }}>✕</span>
            </div>
          )}

          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac50',
              color: C.success, padding: '12px 16px', borderRadius: 12,
              fontSize: '0.85rem', marginBottom: 18, fontWeight: 500,
            }}>
              ✅ {success}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: C.textMuted, fontSize: '1.1rem',
                }}>👤</span>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Username (e.g. admin, ravi2268)"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div style={{ position: 'relative', marginBottom: 28 }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: C.textMuted, fontSize: '1.1rem',
                }}>🔒</span>
                <input
                  style={{ ...inputStyle, paddingRight: 48 }}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: C.textMuted,
                    transition: 'color 0.2s',
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>

              <button type="submit" disabled={busy} style={btnPrimary}
                onMouseOver={e => { if (!busy) e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 28px ${C.primary}50`; }}
                onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 16px ${C.primary}40`; }}
              >
                {busy ? 'Signing in…' : 'Sign In →'}
              </button>

              {/* Demo quick-fill */}
              <div style={{
                margin: '24px 0 10px', textAlign: 'center', color: C.textMuted,
                fontSize: '0.72rem', letterSpacing: '0.04em',
              }}>
                QUICK LOGIN — password: campusiq@1234
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: '👨‍💼 Admin', un: 'admin' },
                  { label: '👨‍🏫 Faculty', un: 'faculty1' },
                  { label: '🎓 Student', un: 'ravi2268' },
                ].map(({ label, un }) => (
                  <button
                    key={un}
                    type="button"
                    onClick={() => fillDemo(un)}
                    style={{
                      flex: 1, padding: '10px 4px',
                      border: `1.5px solid rgba(226,232,240,0.6)`, borderRadius: 12,
                      background: 'rgba(248,250,252,0.5)', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 600, color: C.textSub,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                      backdropFilter: 'blur(4px)',
                    }}
                    onMouseOver={e => {
                      e.target.style.background = `${C.secondary}10`;
                      e.target.style.borderColor = `${C.secondary}40`;
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.color = C.secondary;
                    }}
                    onMouseOut={e => {
                      e.target.style.background = 'rgba(248,250,252,0.5)';
                      e.target.style.borderColor = 'rgba(226,232,240,0.6)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.color = C.textSub;
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtp} style={{
              animation: 'slideInR 0.4s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div style={{
                background: `${C.secondary}08`, border: `1px solid ${C.secondary}20`,
                borderRadius: 14, padding: '16px 18px', marginBottom: 22,
                backdropFilter: 'blur(4px)',
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: C.secondary, fontSize: '0.9rem' }}>🔑 Two-Factor Auth</p>
                <p style={{ margin: '4px 0 0', color: C.textSub, fontSize: '0.8rem' }}>
                  Check your email for the 6-digit code
                </p>
              </div>
              <input
                style={{
                  ...inputStyle, paddingLeft: 16, letterSpacing: '0.4em',
                  fontSize: '1.5rem', textAlign: 'center', marginBottom: 22,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                type="text" inputMode="numeric" maxLength={6}
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
              <button type="submit" disabled={busy || otp.length !== 6}
                style={{ ...btnPrimary, opacity: (busy || otp.length !== 6) ? 0.5 : 1 }}>
                {busy ? 'Verifying…' : 'Verify & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes floatOrb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes floatOrb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
        @keyframes floatOrb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,15px)} }
        @keyframes slideInR { 0%{opacity:0;transform:translateX(20px)} 100%{opacity:1;transform:translateX(0)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: ${C.secondary} !important; background: rgba(255,255,255,0.9) !important; box-shadow: 0 0 0 3px ${C.secondary}15 !important; }
        @media (max-width: 768px) {
          div[style*="flex: 1"][style*="padding: 64px"] { display: none !important; }
          div[style*="minWidth: 440"] { min-width: auto !important; width: 100%; padding: 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
