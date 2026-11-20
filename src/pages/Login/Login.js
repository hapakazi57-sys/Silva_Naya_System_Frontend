import { api, setToken } from '../../utils/api';
import { SW, ok, info } from '../../utils/alerts';
import React, { useEffect, useRef, useState } from 'react';
import './Login.css';


/* =========================================================
   MIPANGILIO (badilisha hapa)
   Picha ziwekwe kwenye: public/assets/
   ========================================================= */
const CONFIG = {
  COMPANY_NAME: 'SILVA NAYA COMPANY LTD',
  TAGLINE: 'SHIPPING & PROCUREMENT',
  ROUTE_BADGE: 'CHINA • DUBAI → TANZANIA • LIVE TRACKING',
  DESCRIPTION:
    'A management system for shipping and purchasing goods from China and Dubai to Tanzania.',

  LOGO: `${process.env.PUBLIC_URL}/assets/logo.jpg`, // juu ya kadi ya login
  LOGO_ICON: `${process.env.PUBLIC_URL}/assets/logo-icon.jpg`, // duara upande wa kushoto
  HERO_IMAGE: `${process.env.PUBLIC_URL}/assets/hero.jpg`, // background ya paneli ya kushoto
  CARD_BG: `${process.env.PUBLIC_URL}/assets/login-card-bg.jpg`, // background ya kadi ya login

  NETWORK: {
    MAX_NODES: 110,
    SPEED: 0.35,
    LINK_DISTANCE: 150,
    MOUSE_DISTANCE: 170,
    LINE_COLOR: '56, 189, 248',
    NODE_COLOR: '125, 220, 255',
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================================================
   Mandharinyuma: mtandao wa mistari unaotembea (canvas)
   ========================================================= */
function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const { MAX_NODES, SPEED, LINK_DISTANCE, MOUSE_DISTANCE, LINE_COLOR, NODE_COLOR } =
      CONFIG.NETWORK;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let nodes = [];
    const mouse = { x: null, y: null };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(35, Math.min(MAX_NODES, Math.round((width * height) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: Math.random() * 1.4 + 0.8,
        glow: Math.random() < 0.18,
      }));
    };

    const draw = (animate) => {
      ctx.clearRect(0, 0, width, height);

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;

          if (mouse.x !== null) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < MOUSE_DISTANCE && d > 1) {
              n.x += (dx / d) * 0.25;
              n.y += (dy / d) * 0.25;
            }
          }
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            const alpha = (1 - d / LINK_DISTANCE) * 0.5;
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm < MOUSE_DISTANCE) {
            const alpha = (1 - dm / MOUSE_DISTANCE) * 0.7;
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${NODE_COLOR}, ${n.glow ? 0.95 : 0.65})`;
        if (n.glow) {
          ctx.shadowColor = `rgba(${LINE_COLOR}, 0.95)`;
          ctx.shadowBlur = 12;
          ctx.arc(n.x, n.y, n.r + 1.2, 0, Math.PI * 2);
        } else {
          ctx.shadowBlur = 0;
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      draw(true);
      rafId = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      build();
      if (reduceMotion) draw(false);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    build();
    if (reduceMotion) draw(false);
    else loop();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="login-network" aria-hidden="true" />;
}

/* =========================================================
   Logo yenye placeholder (kama picha haipo)
   ========================================================= */
function LogoImage({ src, alt, className, placeholderClass, label, hint }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={placeholderClass}>
        <span>{label}</span>
        <small>{hint}</small>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}

/* Ujumbe wa hitilafu ya kuingia (Kiingereza) */
function loginErrorText(err) {
  const status = err && err.response && err.response.status;
  if (status === 401) return 'Incorrect email or password.';
  if (status === 403) return 'Your account is disabled. Please contact the System Administrator.';
  if (!err || !err.response) return 'Cannot reach the server. Check your connection and make sure the Backend is running.';
  return 'Something went wrong. Please try again.';
}

/* =========================================================
   UKURASA WA LOGIN
   ========================================================= */
export default function Login({ onLogin }) {
  const [f, setF] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next = { email: '', password: '' };
    const mail = f.email.trim();

    if (!mail) next.email = 'Enter your email address.';
    else if (!EMAIL_REGEX.test(mail)) next.email = 'Invalid email address. Example: name@silvanaya.co.tz';

    if (!f.password) next.password = 'Enter your password.';

    setErrors(next);
    return !next.email && !next.password;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: f.email.trim(),
        password: f.password,
      });
      setToken(data.token, f.remember);
      onLogin(data.user);
      ok(`Welcome, ${data.user.fullName}`);
    } catch (err) {
      SW.fire({ icon: 'error', title: 'Sign-in failed', text: loginErrorText(err), confirmButtonText: 'OK' });
    } finally {
      setBusy(false);
    }
  };

  const rootStyle = {
    '--hero-image': `url("${CONFIG.HERO_IMAGE}")`,
    '--card-bg': `url("${CONFIG.CARD_BG}")`,
  };

  return (
    <div className="login-page" style={rootStyle}>
      <NetworkBackground />

      <main className="login-shell">
       <div className="login-panel">
        {/* ===== KUSHOTO: PANELI YA KAMPUNI ===== */}
        <section className="login-hero">
          <div className="login-hero__top">
            <span className="login-badge">
              <i className="login-badge__dot" aria-hidden="true" />
              {CONFIG.ROUTE_BADGE}
            </span>
          </div>

          <div className="login-hero__brand">
            <div className="login-seal">
              <LogoImage
                src={CONFIG.LOGO_ICON}
                alt="Logo"
                className="login-seal__img"
                placeholderClass="login-seal__placeholder"
                label="LOGO"
                hint="logo-icon.jpg"
              />
            </div>
            <h2 className="login-hero__name">{CONFIG.COMPANY_NAME}</h2>
            <p className="login-hero__tagline">{CONFIG.TAGLINE}</p>
            <p className="login-hero__desc">{CONFIG.DESCRIPTION}</p>
            <ul className="login-points">
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 7.5L12 12.5l8.7-5" /><path d="M12 22V12.5" /><path d="M7.5 5.3l9 5" /></svg>
                Shipments &amp; tracking
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></svg>
                Invoices &amp; receipts
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6.5 15h3" /></svg>
                Payments &amp; debts
              </li>
            </ul>
          </div>

          <ul className="login-modes">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 17l1.5 3h15L21 17H3z" />
                <path d="M5 17v-6h14v6" />
                <path d="M9 11V7h6v4" />
                <path d="M12 7V4" />
              </svg>
              SEA
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
              </svg>
              AIR
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 6h13v10H1z" />
                <path d="M14 9h4l3 3v4h-7z" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
              ROAD
            </li>
          </ul>
        </section>

        {/* ===== KULIA: KADI YA LOGIN ===== */}
        <form className="login-card" onSubmit={submit} noValidate aria-labelledby="login-title">
          <div className="login-card__bg" aria-hidden="true" />

          <div className="login-card__content">
            <div className="login-logo">
              <LogoImage
                src={CONFIG.LOGO}
                alt="Company logo"
                className="login-logo__img"
                placeholderClass="login-logo__placeholder"
                label="YOUR LOGO HERE"
                hint="public/assets/logo.jpg"
              />
            </div>

            <h1 id="login-title" className="login-card__title">
              Sign in to the system
            </h1>
            <p className="login-card__sub">Use the email and password you were given.</p>

            {/* Barua pepe */}
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className={`login-input ${errors.email ? 'is-invalid' : ''}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoFocus
                  autoComplete="new-password"
                  placeholder="name@silvanaya.co.tz"
                  value={f.email}
                  aria-invalid={!!errors.email}
                  onChange={(e) => {
                    setF({ ...f, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && (
                <p className="login-field__error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Nenosiri */}
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className={`login-input ${errors.password ? 'is-invalid' : ''}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={f.password}
                  aria-invalid={!!errors.password}
                  onChange={(e) => {
                    setF({ ...f, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="login-input__toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6C3.9 9.3 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="login-field__error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Nikumbuke / Umesahau */}
            <div className="login-row">
              <label className="login-check">
                <input
                  type="checkbox"
                  checked={f.remember}
                  onChange={(e) => setF({ ...f, remember: e.target.checked })}
                />
                <span className="login-check__box" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="login-link"
                onClick={() =>
                  info(
                    'Forgot your password?',
                    'Contact the System Administrator to reset your password.',
                    'Got it'
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className={`login-btn ${busy ? 'is-loading' : ''}`} disabled={busy}>
              <span>{busy ? 'Please wait...' : 'SIGN IN'}</span>
              <span className="login-btn__spinner" aria-hidden="true" />
            </button>
          </div>
        </form>
       </div>
      </main>
    </div>
  );
}