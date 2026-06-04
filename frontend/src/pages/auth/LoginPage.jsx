/* ═══════════════════════════════════════════════════════════════════════════
   LoginPage — Split-panel login with demo credentials
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME } from '../../utils/helpers';
import styles from './auth.module.css';

/* University-themed SVG illustration */
function UniversityIllustration() {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.decoIllustration}
      aria-hidden="true"
    >
      {/* Building base */}
      <rect x="60" y="100" width="200" height="130" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Columns */}
      {[90,130,170,210].map((x,i) => (
        <rect key={i} x={x} y="110" width="14" height="115" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      ))}
      {/* Pediment (triangle roof) */}
      <polygon points="50,100 160,52 270,100" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      {/* Door */}
      <rect x="142" y="175" width="36" height="55" rx="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      {/* Windows */}
      {[[88,130],[128,130],[168,130],[208,130]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="18" height="22" rx="3" fill="rgba(147,197,253,0.2)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      ))}
      {/* Mortar board */}
      <ellipse cx="160" cy="30" rx="38" ry="6" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <rect x="148" y="10" width="24" height="20" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      {/* Tassel */}
      <line x1="198" y1="30" x2="210" y2="48" stroke="rgba(251,191,36,0.7)" strokeWidth="2"/>
      <circle cx="210" cy="50" r="3" fill="rgba(251,191,36,0.7)"/>
      {/* Stars */}
      {[[30,60],[290,80],[45,180],[285,160]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.4)"/>
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(ROLE_HOME[user.role] || '/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const DEMOS = [
    { lb: 'مسؤول', email: 'admin@fci.tanta.edu.eg', pw: 'Admin@2026!', c: '#7c3aed', b: 'ADM' },
    { lb: 'دكتور', email: 'dr.ahmed@fci.tanta.edu.eg', pw: 'Doctor@2026!', c: '#0891b2', b: 'DR' },
    { lb: 'طالب', email: 's.2024cs001@fci.tanta.edu.eg', pw: 'Student@2026!', c: '#059669', b: 'STD' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user: u } = await login(email, pw);
      toast.success('مرحباً، ' + (u.fullNameAr || u.fullNameEn || 'مستخدم') + '!', { id: 'login-toast', duration: 1500 });
      navigate(u.mustChangePw ? '/change-password' : (ROLE_HOME[u.role] || '/admin'), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.splitShell} dir="rtl">

      {/* ── Left decorative panel ─────────────────────────── */}
      <div className={styles.decoPanel} aria-hidden="true">
        <div className={styles.decoShape1} />
        <div className={styles.decoShape2} />
        <div className={styles.decoShape3} />

        <div className={styles.decoBrand}>
          <div className={styles.decoBrandIcon}>
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
            </svg>
          </div>
          <span className={styles.decoBrandName}>UniSmart</span>
        </div>

        <UniversityIllustration />

        <p className={styles.decoTagline}>
          نظام إدارة أكاديمي متكامل<br />لكلية الحاسبات والمعلومات<br />جامعة طنطا
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>

          <div className={styles.formBranding}>
            <div className={styles.formBrandIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
              </svg>
            </div>
            <span className={styles.formBrandName}>UniSmart</span>
          </div>

          <h1 className={styles.title}>مرحباً بك</h1>
          <p className={styles.subtitle}>سجّل دخولك للمتابعة</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email */}
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="البريد الإلكتروني"
                className={styles.authInput}
                aria-label="البريد الإلكتروني"
              />
            </div>

            {/* Password */}
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                required
                placeholder="كلمة المرور"
                className={styles.authInput}
                aria-label="كلمة المرور"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className={styles.eyeBtn}
                aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" disabled={busy} className={styles.submitBtn}>
              {busy ? 'جاري…' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className={styles.forgotLink}>
            <Link to="/forgot">نسيت كلمة المرور؟</Link>
          </div>

          <div className={styles.demoSection}>
            <div className={styles.demoTitle}>دخول تجريبي سريع</div>
            <div className={styles.demoGrid}>
              {DEMOS.map(d => (
                <button
                  key={d.lb}
                  onClick={() => { setEmail(d.email); setPw(d.pw); }}
                  className={styles.demoBtn}
                  style={{ borderColor: d.c + '33' }}
                  aria-label={`دخول بحساب ${d.lb}`}
                >
                  <div className={styles.demoBadge} style={{ background: d.c + '18', color: d.c }}>{d.b}</div>
                  <div className={styles.demoLabel} style={{ color: d.c }}>{d.lb}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
