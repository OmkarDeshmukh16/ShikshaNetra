import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import dashImg from '../assets/Dash.png';

/* ─────────────────────────────────────────────
   Inject keyframe styles once into <head>
───────────────────────────────────────────── */
const HERO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes hero-fade-up {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes hero-line-grow {
    from { width: 0; opacity: 0; }
    to   { width: 56px; opacity: 1; }
  }
  @keyframes hero-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-10px) rotate(0.5deg); }
    66%       { transform: translateY(-5px) rotate(-0.3deg); }
  }
  @keyframes hero-blob-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%       { transform: translate(30px, -20px) scale(1.08); }
  }
  @keyframes hero-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }
  @keyframes hero-scan-line {
    0%   { top: 0%; opacity: 0.6; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes hero-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes hero-count {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-card-slide {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hero-ring-pulse {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes hero-nav-drop {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-mobile-menu-open {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hero-animated-0 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.1s both; }
  .hero-animated-1 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.25s both; }
  .hero-animated-2 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.4s both; }
  .hero-animated-3 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.55s both; }
  .hero-animated-4 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.7s both; }
  .hero-animated-5 { animation: hero-fade-up 0.7s cubic-bezier(.22,.68,0,1.2) 0.85s both; }

  .hero-float  { animation: hero-float 7s ease-in-out infinite; }
  .hero-float2 { animation: hero-float 9s ease-in-out 1.5s infinite; }
  .hero-float3 { animation: hero-float 6s ease-in-out 3s infinite; }

  .hero-shimmer-text {
    background: linear-gradient(90deg, #c09a47 0%, #f5d98b 40%, #c09a47 60%, #e6c56d 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: hero-shimmer 4s linear infinite;
  }

  /* Hamburger lines */
  .hero-hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: #1a1a1a;
    margin: 4px 0;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  .hero-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
  .hero-hamburger.open span:nth-child(2) { opacity: 0; }
  .hero-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

  /* Responsive tweaks */
  @media (max-width: 768px) {
    .hero-title { font-size: clamp(2.4rem, 9vw, 3.6rem) !important; }
    .hero-content-grid { grid-template-columns: 1fr !important; padding-top: 90px !important; }
    .hero-right-col { display: none !important; }
    .hero-right-col-mobile { display: flex !important; }
    .hero-stats-row { gap: 20px !important; }
    .hero-cta-row { flex-direction: column !important; }
    .hero-cta-row a, .hero-cta-row button { width: 100% !important; justify-content: center !important; }
    .hero-trust-badges { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .hero-stats-row { flex-wrap: wrap; gap: 16px !important; }
  }
`;

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useCountUp(target, duration = 1600, delay = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = 50;
      const step = duration / steps;
      let current = 0;
      const timer = setInterval(() => {
        current++;
        setValue(Math.round((current / steps) * target));
        if (current >= steps) clearInterval(timer);
      }, step);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const Hero = ({ onWatchDemo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const students = useCountUp(500, 1500, 900);
  const schools = useCountUp(40, 1200, 1000);
  const hours = useCountUp(5, 1000, 1100);

  // Inject styles
  useEffect(() => {
    if (!document.getElementById('hero-keyframes')) {
      const style = document.createElement('style');
      style.id = 'hero-keyframes';
      style.textContent = HERO_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: '#0c0c0c',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── BACKGROUND MESH BLOBS ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        {/* Top-right amber glow */}
        <div style={{
          position: 'absolute', top: '-180px', right: '-180px',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(192,154,71,0.22) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'hero-blob-drift 12s ease-in-out infinite',
        }} />
        {/* Bottom-left warm glow */}
        <div style={{
          position: 'absolute', bottom: '-200px', left: '-120px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(192,154,71,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'hero-blob-drift 15s ease-in-out 3s infinite reverse',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
        {/* Noise grain */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }} />
        {/* Diagonal accent line */}
        <div style={{
          position: 'absolute', top: 0, right: '38%',
          width: '1px', height: '100%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(192,154,71,0.15) 30%, rgba(192,154,71,0.08) 70%, transparent 100%)',
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '22px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        animation: 'hero-nav-drop 0.6s ease both',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(12,12,12,0.6)',
      }}
        className="hero-nav"
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #c09a47, #f5d98b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MenuBookIcon style={{ fontSize: '18px', color: '#0c0c0c' }} />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: '1rem',
            letterSpacing: '2px', color: '#ffffff',
            textTransform: 'uppercase',
          }}>OM SAAS</span>
        </div>

        {/* Desktop Links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '36px',
        }} className="hero-desktop-nav">
          {['Features', 'Modules', 'Pricing', 'Contact'].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              fontSize: '0.8rem', letterSpacing: '1.5px',
              textTransform: 'uppercase', fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#c09a47'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >{label}</a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/choose" style={{
            color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
            fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase',
            fontWeight: 500, transition: 'color 0.2s',
            display: 'none',
          }}
            className="hero-nav-login"
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
          >Login</Link>

          <Link to="/request-demo" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#c09a47',
              color: '#0c0c0c',
              border: 'none',
              padding: '10px 24px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: '0.8rem',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: '4px 4px 0px rgba(192,154,71,0.3)',
            }}
              onMouseEnter={e => { e.target.style.background = '#d4a84e'; e.target.style.transform = 'translate(-1px,-1px)'; e.target.style.boxShadow = '6px 6px 0px rgba(192,154,71,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = '#c09a47'; e.target.style.transform = ''; e.target.style.boxShadow = '4px 4px 0px rgba(192,154,71,0.3)'; }}
            >Request Demo</button>
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className={`hero-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '72px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(12,12,12,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(192,154,71,0.2)',
          padding: '24px 32px',
          animation: 'hero-mobile-menu-open 0.25s ease both',
        }}>
          {['Features', 'Modules', 'Pricing', 'About Us', 'Contact'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', padding: '12px 0',
                fontSize: '0.9rem', letterSpacing: '2px',
                textTransform: 'uppercase', fontWeight: 500,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >{label}</a>
          ))}
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <Link to="/choose" style={{
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center',
            }}>Login</Link>
            <Link to="/request-demo" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', background: '#c09a47', color: '#0c0c0c',
                border: 'none', padding: '14px', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: "'Playfair Display', serif", fontSize: '0.85rem',
              }}>Request Demo</button>
            </Link>
          </div>
        </div>
      )}

      {/* ── CONTENT GRID ── */}
      <div
        className="hero-content-grid"
        style={{
          position: 'relative', zIndex: 10,
          maxWidth: '1320px', margin: '0 auto',
          padding: '0 48px',
          paddingTop: '130px', paddingBottom: '80px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Eyebrow */}
          <div className="hero-animated-0" style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px',
          }}>
            <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#c09a47',
                position: 'relative', zIndex: 1,
              }} />
              <div style={{
                position: 'absolute', inset: '-4px', borderRadius: '50%',
                border: '1px solid rgba(192,154,71,0.5)',
                animation: 'hero-ring-pulse 2s ease-out infinite',
              }} />
            </div>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.7rem', letterSpacing: '4px',
              textTransform: 'uppercase', color: '#c09a47', fontWeight: 500,
            }}>Smart School Management · Maharashtra</span>
          </div>

          {/* Headline */}
          <div className="hero-animated-1">
            <h1
              className="hero-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.8rem, 4.5vw, 5rem)',
                lineHeight: 1.05, fontWeight: 900,
                color: '#ffffff', margin: '0 0 8px 0',
                letterSpacing: '-1px',
              }}
            >
              Modern School
            </h1>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.8rem, 4.5vw, 5rem)',
              lineHeight: 1.05, fontWeight: 900,
              fontStyle: 'italic',
              margin: '0 0 8px 0',
              letterSpacing: '-1px',
              className: 'hero-title',
            }}
              className="hero-shimmer-text hero-title"
            >Management,</h1>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.8rem, 4.5vw, 5rem)',
              lineHeight: 1.05, fontWeight: 900,
              color: '#ffffff', margin: '0',
              letterSpacing: '-1px',
            }}
              className="hero-title"
            >Simplified.</h1>
          </div>

          {/* Accent rule */}
          <div className="hero-animated-2" style={{ margin: '24px 0' }}>
            <div style={{
              width: '56px', height: '3px',
              background: 'linear-gradient(90deg, #c09a47, transparent)',
              animation: 'hero-line-grow 0.8s ease 0.6s both',
            }} />
          </div>

          {/* Subheadline */}
          <p className="hero-animated-2" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.8, maxWidth: '480px', margin: '0 0 40px 0',
            fontWeight: 300,
          }}>
            Manage students, fees, reports, and certificates — all in one
            powerful platform built for Indian schools. No tech expertise needed.
          </p>

          {/* CTA Row */}
          <div className="hero-animated-3 hero-cta-row" style={{
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          }}>
            <Link to="/request-demo" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#c09a47', color: '#0c0c0c',
                border: 'none', padding: '16px 36px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: '0.85rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: '6px 6px 0px rgba(192,154,71,0.2)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '10px 10px 0px rgba(192,154,71,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0px rgba(192,154,71,0.2)'; }}
              >
                Request Demo <ArrowForwardIcon style={{ fontSize: '16px' }} />
              </button>
            </Link>

            <Link to="/choose" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'transparent', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)', padding: '16px 36px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: '0.85rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: '6px 6px 0px rgba(255, 255, 255, 0.05)',
              }}
                onMouseEnter={e => { 
                  e.currentTarget.style.borderColor = '#c09a47'; 
                  e.currentTarget.style.color = '#c09a47'; 
                  e.currentTarget.style.transform = 'translate(-2px,-2px)'; 
                  e.currentTarget.style.boxShadow = '10px 10px 0px rgba(192,154,71,0.15)'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; 
                  e.currentTarget.style.color = '#ffffff'; 
                  e.currentTarget.style.transform = ''; 
                  e.currentTarget.style.boxShadow = '6px 6px 0px rgba(255, 255, 255, 0.05)'; 
                }}
              >
                Login Portal
              </button>
            </Link>

            <button
              onClick={onWatchDemo}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '16px 28px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, fontSize: '0.85rem',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,154,71,0.4)'; e.currentTarget.style.color = '#c09a47'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            >
              <PlayCircleOutlineIcon style={{ fontSize: '18px' }} /> Watch Demo
            </button>
          </div>

          {/* Stats Row */}
          <div className="hero-animated-4 hero-stats-row" style={{
            display: 'flex', gap: '36px',
            marginTop: '52px', paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {[
              { value: `${students}+`, label: 'Students' },
              { value: `${schools}+`, label: 'Schools Active' },
              { value: `${hours}hrs`, label: 'Saved Daily' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2.2rem', color: '#ffffff',
                  fontWeight: 700, letterSpacing: '-1px',
                  lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase', letterSpacing: '2px',
                  marginTop: '6px',
                }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="hero-animated-5 hero-trust-badges" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginTop: '32px',
          }}>
            {[
              '✓  Trusted across Maharashtra',
              '✓  Zero tech setup needed',
              '✓  Bank-grade data security',
              '✓  WhatsApp-simple to use',
            ].map(badge => (
              <div key={badge} style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.5px', padding: '6px 0',
              }}>{badge}</div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN — Dashboard Visual ── */}
        <div
          className="hero-right-col"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Glow behind card */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px', height: '380px',
            background: 'radial-gradient(circle, rgba(192,154,71,0.12) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Main laptop frame */}
          <div className="hero-animated-2 hero-float" style={{
            position: 'relative', zIndex: 2,
            width: '100%', maxWidth: '540px',
          }}>
            {/* Browser chrome */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px 12px 0 0',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
                  <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                borderRadius: '4px', padding: '4px 12px',
                fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)',
                fontFamily: 'monospace', letterSpacing: '0.5px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ color: '#27c93f', fontSize: '8px' }}>●</span>
                app.omsaas.in/dashboard
              </div>
            </div>

            {/* Screen */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Scan line effect */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: '60px', zIndex: 5,
                background: 'linear-gradient(transparent, rgba(192,154,71,0.04), transparent)',
                animation: 'hero-scan-line 4s linear infinite',
                pointerEvents: 'none',
              }} />
              <img
                src={dashImg}
                alt="OM SAAS School Dashboard"
                style={{
                  width: '100%', display: 'block',
                  objectFit: 'cover', objectPosition: 'top',
                  aspectRatio: '16/10',
                }}
              />
            </div>

            {/* Laptop base */}
            <div style={{
              width: '106%', marginLeft: '-3%',
              height: '18px',
              background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
              borderRadius: '0 0 12px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '60px', height: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0 0 8px 8px',
              }} />
            </div>
          </div>

          {/* Floating stat card — top right */}
          <div className="hero-float2" style={{
            position: 'absolute', top: '4%', right: '-4%',
            background: 'rgba(20,20,20,0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(192,154,71,0.25)',
            padding: '14px 18px',
            zIndex: 10,
            animation: 'hero-card-slide 0.6s cubic-bezier(.22,.68,0,1.2) 0.8s both, hero-float2 9s ease-in-out 1.5s infinite',
            minWidth: '160px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#27c93f',
                animation: 'hero-pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>Live</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>96%</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '3px' }}>Attendance Today</div>
          </div>

          {/* Floating fee card — bottom left */}
          <div className="hero-float3" style={{
            position: 'absolute', bottom: '12%', left: '-8%',
            background: '#c09a47',
            padding: '14px 20px',
            zIndex: 10,
            animation: 'hero-card-slide 0.6s cubic-bezier(.22,.68,0,1.2) 1s both, hero-float3 6s ease-in-out 3s infinite',
            boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
            minWidth: '150px',
          }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', color: 'rgba(0,0,0,0.55)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>This Month</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: '#0c0c0c', fontWeight: 700 }}>₹2.4L</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', color: 'rgba(0,0,0,0.5)', letterSpacing: '1px', marginTop: '2px' }}>Fees Collected ↑</div>
          </div>

          {/* Floating report badge — bottom right */}
          <div style={{
            position: 'absolute', bottom: '6%', right: '-2%',
            background: 'rgba(20,20,20,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 16px',
            zIndex: 10,
            animation: 'hero-card-slide 0.6s cubic-bezier(.22,.68,0,1.2) 1.2s both',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(192,154,71,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>📄</div>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.68rem', color: '#fff', fontWeight: 500 }}>Report Generated</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>1-click · Just now</div>
            </div>
          </div>
        </div>

        {/* ── MOBILE — simplified visual ── */}
        <div
          className="hero-right-col-mobile"
          style={{
            display: 'none',
            flexDirection: 'column', alignItems: 'center',
            gap: '12px', marginTop: '8px',
          }}
        >
          {[
            { emoji: '📊', label: 'Attendance', value: '96% Today', color: '#27c93f' },
            { emoji: '💰', label: 'Fees Collected', value: '₹2.4L/mo', color: '#c09a47' },
            { emoji: '📄', label: 'Reports', value: '1-Click', color: '#7eb8ed' },
          ].map(({ emoji, label, value, color }) => (
            <div key={label} style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: `3px solid ${color}`,
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── SCROLL HINT ── */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        animation: 'hero-fade-in 1s ease 2s both',
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '0.6rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
        }}>Scroll</span>
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, rgba(192,154,71,0.5), transparent)',
        }} />
      </div>

      {/* Inline responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-right-col { display: none !important; }
          .hero-right-col-mobile { display: flex !important; }
          .hero-content-grid {
            grid-template-columns: 1fr !important;
            padding-top: 110px !important;
            padding-left: 32px !important;
            padding-right: 32px !important;
          }
        }
        @media (max-width: 600px) {
          .hero-content-grid {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 88px !important;
          }
          .hero-desktop-nav { display: none !important; }
          .hero-hamburger { display: block !important; }
          .hero-nav-login { display: none !important; }
          nav { padding: 16px 20px !important; }
        }
        @media (max-width: 768px) {
          .hero-stats-row { gap: 20px !important; flex-wrap: wrap !important; }
          .hero-cta-row { flex-direction: column !important; gap: 12px !important; }
          .hero-cta-row > * { width: 100% !important; }
          .hero-trust-badges { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Hero;