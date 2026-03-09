import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const C = {
  primary: '#1A237E', primaryDark: '#0D1757', primaryLight: '#3949AB',
  accent: '#FFB300', accentLight: '#FFD54F',
  text: '#0F172A', textSub: '#475569', textMuted: '#94A3B8',
  border: '#E2E8F0', surface: 'rgba(255,255,255,0.97)',
  success: '#2E7D32', danger: '#C62828',
};

const DASH = {
  ADMIN:   '/admin/dashboard',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOtp, pendingEmail, user, isAuthenticated, loading } = useAuth();

  const [step,    setStep]    = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [otp,     setOtp]     = useState('');
  const [otpUser, setOtpUser] = useState(pendingEmail || '');

  // Already logged in? Go to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(DASH[user.role] || '/', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Don't render the form while checking auth
  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #FFB300',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ fontWeight: 600 }}>Loading CampusIQ+...</p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
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
      // Navigate to dashboard — role comes from login() result
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
    width: '100%', padding: '13px 16px 13px 44px',
    border: `1.5px solid ${C.border}`, borderRadius: 10,
    fontSize: '0.95rem', outline: 'none', background: '#F8F9FC',
    fontFamily: 'inherit', boxSizing: 'border-box', color: C.text,
    transition: 'border-color 0.2s',
  };
  const btnPrimary = {
    width: '100%', padding: '13px', borderRadius: 10,
    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
    color: '#fff', fontWeight: 700, fontSize: '1rem',
    border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.7 : 1, fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: `linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 50%, ${C.primaryLight} 100%)`,
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>
      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.3rem', color: C.primary,
          }}>IQ</div>
          <span style={{ fontWeight: 800, fontSize: '1.8rem' }}>CampusIQ+</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
          Smart Campus,<br/>Smarter Futures.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
          AI-powered learning platform with real-time analytics, attendance tracking,
          exam management, and personalized insights.
        </p>
        {[
          ['🎓', 'AI Performance Analytics'],
          ['📊', 'Real-time Attendance Insights'],
          ['💬', 'Intelligent CampusMate Chatbot'],
          ['💳', 'Seamless Fee Management'],
        ].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{icon}</div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
        
      </div>

      {/* ── Right login card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, minWidth: 420,
      }}>
        <div style={{
          width: '100%', maxWidth: 420, background: C.surface,
          borderRadius: 20, padding: 36,
          boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
        }}>
          <div style={{ marginBottom: 24 }}>
            {step === 'otp' && (
              <button onClick={() => { setStep('login'); setError(''); setSuccess(''); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.primary, fontSize: '1.2rem', padding: '0 8px 0 0',
              }}>←</button>
            )}
            <h2 style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: '1.5rem' }}>
              {step === 'login' ? 'Sign In' : 'Verify OTP'}
            </h2>
            <p style={{ margin: '4px 0 0', color: C.textSub, fontSize: '0.875rem' }}>
              {step === 'login' ? 'Enter your username and password' : `OTP sent to your email`}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FFEBEE', border: `1px solid ${C.danger}40`,
              color: C.danger, padding: '10px 14px', borderRadius: 8,
              fontSize: '0.875rem', marginBottom: 16, fontWeight: 500,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>⚠️ {error}</span>
              <span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
            </div>
          )}

          {success && (
            <div style={{
              background: '#E8F5E9', border: '1px solid #A5D6A7',
              color: C.success, padding: '10px 14px', borderRadius: 8,
              fontSize: '0.875rem', marginBottom: 16, fontWeight: 500,
            }}>
              ✅ {success}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
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

              <div style={{ position: 'relative', marginBottom: 24 }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: C.textMuted, fontSize: '1.1rem',
                }}>🔒</span>
                <input
                  style={{ ...inputStyle, paddingRight: 44 }}
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
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: C.textMuted,
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>

              <button type="submit" disabled={busy} style={btnPrimary}>
                {busy ? 'Signing in…' : 'Sign In →'}
              </button>

              {/* Demo quick-fill */}
              <div style={{ margin: '20px 0 8px', textAlign: 'center', color: C.textMuted, fontSize: '0.78rem' }}>
                ── Quick Login (all password: campusiq@1234) ──
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'Admin',   un: 'admin'     },
                  { label: 'Faculty', un: 'faculty1'  },
                  { label: 'Student', un: 'ravi2268'  },
                ].map(({ label, un }) => (
                  <button
                    key={un}
                    type="button"
                    onClick={() => fillDemo(un)}
                    style={{
                      flex: 1, padding: '9px 4px',
                      border: `1px solid ${C.border}`, borderRadius: 8,
                      background: '#F8F9FC', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 600, color: C.textSub,
                      fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                    onMouseOver={e => e.target.style.background = '#EEF2FF'}
                    onMouseOut={e => e.target.style.background = '#F8F9FC'}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtp}>
              <div style={{
                background: '#EEF2FF', border: '1px solid #C7D2FE',
                borderRadius: 10, padding: '14px 16px', marginBottom: 20,
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: C.primary }}>🔑 Two-Factor Auth</p>
                <p style={{ margin: '4px 0 0', color: C.textSub, fontSize: '0.8rem' }}>
                  Check your email for the 6-digit code
                </p>
              </div>
              <input
                style={{
                  ...inputStyle, paddingLeft: 16, letterSpacing: '0.4em',
                  fontSize: '1.5rem', textAlign: 'center', marginBottom: 20,
                }}
                type="text" inputMode="numeric" maxLength={6}
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
              <button type="submit" disabled={busy || otp.length !== 6}
                style={{ ...btnPrimary, opacity: (busy || otp.length !== 6) ? 0.6 : 1 }}>
                {busy ? 'Verifying…' : 'Verify & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        input:focus { border-color: #1A237E !important; background: #fff !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoginPage;
