import React, { useState, useRef } from 'react';

/* ─────────────────────────────────────────────
   COFFEINE – AI Coffee Fruit Grading System
   Dark premium UI inspired by the reference
   ───────────────────────────────────────────── */

// ── Inline SVG icon helpers ───────────────────
// eslint-disable-next-line no-unused-vars
const AlertIcon = ({ size, className }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Colour helpers ────────────────────────────
const GRADE_CONFIG = {
  A: {
    bg: '#22c55e', label: 'Premium Dry', sub: 'Fully Dried', dryness: '85–100%',
    price: '₹120 – ₹200/kg', desc: 'Fully dried coffee fruit. Dark brown/black color. Optimal for market.',
    border: '#22c55e'
  },
  B: {
    bg: '#84cc16', label: 'Well Dried', sub: 'Partially Dried', dryness: '55–84%',
    price: '₹80 – ₹140/kg', desc: 'Mostly dried with minor reddish tones. Good quality.',
    border: '#84cc16'
  },
  C: {
    bg: '#f59e0b', label: 'Partially Dried', sub: 'Mixed', dryness: '25–54%',
    price: '₹45 – ₹85/kg', desc: 'Mixed coloration with significant reddish/yellow tones.',
    border: '#f59e0b'
  },
  D: {
    bg: '#ef4444', label: 'Fresh / Undried', sub: 'Fresh', dryness: '0–24%',
    price: '₹20 – ₹65/kg', desc: 'Green/red fresh fruit. Requires full drying process.',
    border: '#ef4444'
  },
};

// ── Nav ───────────────────────────────────────
function Navbar({ view, setView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { id: 'grade', label: 'Grade' },
    { id: 'guide', label: 'Guide' },
    { id: 'how', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'history', label: 'History' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(18,12,8,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64
      }}>
        {/* Logo */}
        <button onClick={() => setView('home')} style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'none',
          border: 'none', cursor: 'pointer', color: '#fff'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#c9833a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>☕</div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            Coffeine
          </span>
        </button>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          className="nav-desktop">
          {links.map(l => (
            <button key={l.id} onClick={() => setView(l.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: view === l.id ? '#c9833a' : 'rgba(255,255,255,0.7)',
              fontWeight: 500, fontSize: 14, padding: '6px 14px', borderRadius: 8,
              transition: 'color .2s',
              fontFamily: 'Inter, sans-serif',
            }}
              onMouseEnter={e => { if (view !== l.id) e.target.style.color = '#fff' }}
              onMouseLeave={e => { if (view !== l.id) e.target.style.color = 'rgba(255,255,255,0.7)' }}
            >{l.label}</button>
          ))}
          <button onClick={() => setView('grade')} style={{
            background: '#c9833a', border: 'none', borderRadius: 999, cursor: 'pointer',
            color: '#fff', fontWeight: 600, padding: '9px 22px', fontSize: 14,
            fontFamily: 'Inter, sans-serif', transition: 'opacity .2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >Start Grading</button>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 22
        }}>☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#1a1008', borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 24px 20px',
        }}>
          {links.map(l => (
            <button key={l.id} onClick={() => { setView(l.id); setMenuOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              color: view === l.id ? '#c9833a' : 'rgba(255,255,255,0.8)',
              padding: '10px 0', fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 500,
            }}>{l.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

// ── Hero / Home ───────────────────────────────
function HeroSection({ setView }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '90px 24px 60px',
      background: 'radial-gradient(ellipse at 70% 40%, rgba(100,50,10,0.28) 0%, transparent 65%)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap'
      }}>

        {/* Left */}
        <div style={{ flex: '1 1 340px', maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,131,58,0.15)', border: '1px solid rgba(201,131,58,0.35)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 28,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9833a' }} />
            <span style={{ color: '#c9833a', fontSize: 13, fontWeight: 500 }}>
              AI-Powered Coffee Fruit Grading
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px,5vw,62px)', fontWeight: 800, lineHeight: 1.1,
            color: '#fff', marginBottom: 22
          }}>
            Know Your<br />
            <span style={{ color: '#c9833a' }}>Coffee Fruit</span><br />
            Quality
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
            Upload a photo of your coffee fruits and our machine learning model will
            instantly analyze the dryness level, assign a quality grade, and provide
            current Indian market pricing.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => setView('grade')} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#c9833a', border: 'none', borderRadius: 999,
              color: '#fff', fontWeight: 700, padding: '14px 28px', fontSize: 15,
              cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
              boxShadow: '0 4px 24px rgba(201,131,58,0.35)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,131,58,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,131,58,0.35)'; }}
            >
              <span style={{ fontSize: 18 }}>☕</span> Start Grading
            </button>
            <button onClick={() => setView('guide')} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999, color: '#fff', fontWeight: 600, padding: '14px 28px',
              fontSize: 15, cursor: 'pointer', transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >Learn More</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 52, flexWrap: 'wrap' }}>
            {[
              { val: '4', sub: 'Quality Grades' },
              { val: 'A–D', sub: 'Dryness Scale' },
              { val: '₹/kg', sub: 'Market Pricing' },
            ].map(s => (
              <div key={s.val}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – demo card */}
        <div style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 280, background: 'rgba(60,30,10,0.7)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
            padding: 20, backdropFilter: 'blur(12px)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              height: 220, background: 'rgba(40,20,5,0.6)', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 64, marginBottom: 16, position: 'relative',
            }}>
              ☕
              <div style={{
                position: 'absolute', top: 14, right: 14,
                background: '#22c55e', color: '#fff', fontWeight: 800,
                fontSize: 18, width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>A</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Premium Dry Cherry</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Grade A · 95% Dryness</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>₹195</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>per kg</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Grade (Upload & Predict) ──────────────────
function GradeSection() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const gradeMap = { Fully_dried: 'A', Partially_dried: 'B', Mixed: 'C', Fresh: 'D' };

  const analyze = async () => {
    if (!imageFile) { setError('Please upload an image first'); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await fetch('http://localhost:5000/predict', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      // Use grade from backend (derived from CNN label) — fallback to gradeMap if older backend
      const grade = data.grade || gradeMap[data.class] || 'D';
      setResult({
        label: data.class, grade,
        pricePerKg: data.price_per_kg, daysToDry: data.drying_days,
        recommendation: data.recommendation,
        originalImg: data.original_image, claheImg: data.clahe_image,
        minPrice: data.min_price, maxPrice: data.max_price,
      });
    } catch {
      setError('Backend error. Make sure Flask is running on port 5000.');
    } finally { setLoading(false); }
  };

  const cfg = result ? GRADE_CONFIG[result.grade] : null;

  return (
    <section style={{ padding: '100px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(201,131,58,0.2)',
            border: '1px solid rgba(201,131,58,0.4)', borderRadius: 999,
            padding: '5px 18px', color: '#c9833a', fontSize: 12,
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
          }}>AI-POWERED ANALYSIS</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            Grade Your <span style={{ color: '#c9833a' }}>Coffee Fruit</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Upload a photo of your coffee fruits and our AI will analyze the color
            distribution to determine the dryness level and quality grade.
          </p>
        </div>

        {/* Drop zone */}
        {!imagePreview && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{
              border: '2px dashed rgba(201,131,58,0.4)',
              borderRadius: 20, padding: '60px 24px', textAlign: 'center',
              cursor: 'pointer', background: 'rgba(201,131,58,0.04)',
              transition: 'border-color .2s, background .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9833a'; e.currentTarget.style.background = 'rgba(201,131,58,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,131,58,0.4)'; e.currentTarget.style.background = 'rgba(201,131,58,0.04)'; }}
          >
            <div style={{
              width: 72, height: 72, background: 'rgba(201,131,58,0.15)',
              borderRadius: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: 30,
            }}>📷</div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Upload Coffee Fruit Image</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>
              Drag &amp; drop your image here, or <span style={{ color: '#c9833a', textDecoration: 'underline' }}>browse files</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {['JPG', 'PNG', 'WEBP', 'MAX 10MB'].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: 6,
                  padding: '3px 10px', color: 'rgba(255,255,255,0.4)', fontSize: 11,
                }}>{t}</span>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          </div>
        )}

        {/* Preview + Analyze */}
        {imagePreview && !result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
              <img src={imagePreview} alt="Preview" style={{
                maxWidth: '100%', maxHeight: 400, borderRadius: 16,
                border: '2px solid rgba(201,131,58,0.3)',
              }} />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
            <br />
            <button onClick={analyze} disabled={loading} style={{
              background: loading ? 'rgba(201,131,58,0.4)' : '#c9833a',
              border: 'none', borderRadius: 999, color: '#fff', fontWeight: 700,
              padding: '16px 48px', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform .2s', display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              {loading ? (
                <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Analyzing…</>
              ) : '⚡ Analyze & Get Price'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center',
            gap: 12, marginTop: 24, color: '#f87171',
          }}>
            <AlertIcon size={20} /> {error}
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div style={{ marginTop: 32 }}>
            {/* Grade banner */}
            <div style={{
              background: `linear-gradient(135deg, rgba(${cfg.bg === '#22c55e' ? '34,197,94' : cfg.bg === '#84cc16' ? '132,204,22' : cfg.bg === '#f59e0b' ? '245,158,11' : '239,68,68'},0.15) 0%, rgba(40,20,5,0.6) 100%)`,
              border: `1px solid ${cfg.bg}44`, borderRadius: 20, padding: '28px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: 32,
                }}>{result.grade}</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{cfg.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    {cfg.sub} · {cfg.dryness} Dryness
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 28 }}>₹{result.pricePerKg}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>estimated per kg</div>
              </div>
            </div>

            {/* Images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Original Image', src: result.originalImg },
                { label: 'CLAHE Enhanced', src: result.claheImg },
              ].map(({ label, src }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600
                  }}>{label}</div>
                  <img src={`data:image/jpeg;base64,${src}`} alt={label} style={{ width: '100%' }} />
                </div>
              ))}
            </div>

            {/* Drying recommendation */}
            <div style={{
              background: 'rgba(201,131,58,0.08)', border: '1px solid rgba(201,131,58,0.25)',
              borderRadius: 14, padding: '20px 24px', marginBottom: 20,
            }}>
              <div style={{ color: '#c9833a', fontWeight: 700, marginBottom: 10 }}>🗓 Drying Recommendation</div>
              <div style={{
                color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75,
                whiteSpace: 'pre-wrap'
              }}>{result.recommendation}</div>
              <div style={{ marginTop: 12, color: '#fff', fontSize: 14 }}>
                Days to full drying: <strong style={{ color: '#c9833a' }}>{result.daysToDry}</strong>
              </div>
            </div>

            {/* Price guide */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10,
            }}>
              {Object.entries(GRADE_CONFIG).map(([g, c]) => (
                <div key={g} style={{
                  background: g === result.grade ? `${c.bg}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${g === result.grade ? c.bg + '55' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: c.bg,
                      color: '#fff', fontWeight: 800, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{g}</div>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                  </div>
                  <div style={{ color: '#c9833a', fontSize: 13, fontWeight: 700 }}>{c.price}</div>
                </div>
              ))}
            </div>

            <button onClick={() => { setImageFile(null); setImagePreview(null); setResult(null); setError(null); }}
              style={{
                marginTop: 24, width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                color: '#fff', padding: '14px', fontSize: 15, cursor: 'pointer',
                fontWeight: 600, transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >Analyze Another Image</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}

// ── Guide ─────────────────────────────────────
function GuideSection() {
  return (
    <section style={{ padding: '100px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(201,131,58,0.2)',
            border: '1px solid rgba(201,131,58,0.4)', borderRadius: 999,
            padding: '5px 18px', color: '#c9833a', fontSize: 12,
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
          }}>QUALITY STANDARDS</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Coffee Fruit <span style={{ color: '#c9833a' }}>Grading Guide</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 580, margin: '0 auto', lineHeight: 1.65 }}>
            Understanding the four quality grades of coffee fruit based on dryness level and
            color characteristics, with current Indian market pricing.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
          {Object.entries(GRADE_CONFIG).map(([g, c]) => (
            <div key={g} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '24px 22px', position: 'relative', overflow: 'hidden',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${c.bg}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.bg }} />
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 26, marginBottom: 16,
              }}>{g}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{c.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>Dryness: {c.dryness}</div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>{c.desc}</p>
              <div style={{ color: '#c9833a', fontWeight: 700, fontSize: 14 }}>{c.price}</div>
            </div>
          ))}
        </div>

        {/* Grading methodology */}
        <div style={{
          marginTop: 56, background: 'rgba(201,131,58,0.07)',
          border: '1px solid rgba(201,131,58,0.2)', borderRadius: 20, padding: '36px 36px',
        }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
            🔬 How the System Grades Your Coffee
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>
            The grading process uses a custom-trained <strong style={{ color: '#c9833a' }}>Convolutional Neural Network (CNN)</strong> that
            analyzes visual color and texture features of coffee fruit images.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {[
              { step: '01', title: 'CLAHE Enhancement', body: 'The image contrast is adaptively enhanced using CLAHE (Contrast Limited Adaptive Histogram Equalization) to normalize lighting conditions — essential for accurate color analysis.' },
              { step: '02', title: 'CNN Classification', body: 'A 4-layer convolutional network (32→64→128→256 filters) trained on hundreds of coffee images classifies the fruit into Fresh, Mixed, Partially Dried, or Fully Dried.' },
              { step: '03', title: 'Color & Texture Analysis', body: 'The CNN detects pixel-level color distributions: dark brown/black indicates high dryness (Grade A), while red/green tones indicate freshness (Grade D).' },
              { step: '04', title: 'Market Pricing', body: 'Each classification maps to current Indian market rates. Fully dried cherry commands ₹195/kg vs ₹60/kg for fresh — a 3× difference that directly impacts farmer income.' },
            ].map(s => (
              <div key={s.step} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '18px 20px',
              }}>
                <div style={{ color: 'rgba(201,131,58,0.6)', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{s.step}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{s.title}</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: '01', title: 'Upload Image',
      body: 'Take a clear photo of your coffee fruits and upload it through our drag-and-drop interface. Works with JPG, PNG, and WebP formats.',
    },
    {
      num: '02', title: 'AI Analysis',
      body: 'Our machine learning engine applies CLAHE contrast enhancement, then runs a CNN model to analyze color and texture patterns across the image.',
    },
    {
      num: '03', title: 'Get Results',
      body: 'Receive your grade (A–D), dryness percentage, current Indian market pricing, and expert recommendations for optimal processing.',
    },
  ];

  const techDetails = [
    { icon: '🧠', title: 'Deep CNN', desc: '4 convolutional layers (32→64→128→256 filters) trained on labeled coffee imagery via TensorFlow/Keras' },
    { icon: '🎨', title: 'CLAHE Preprocessing', desc: 'Adaptive histogram equalization on the LAB lightness channel for exposure-invariant classification' },
    { icon: '⚡', title: 'Real-time Inference', desc: 'Sub-second prediction on 224×224 normalized images — no cloud compute needed for classification' },
    { icon: '📊', title: 'SQLite History', desc: 'Every analysis is logged with timestamp, grade, price, and recommendation for farmer record-keeping' },
    { icon: '🌐', title: 'Flask REST API', desc: 'Python backend exposes /predict and /history endpoints consumed by the React frontend' },
    { icon: '🔍', title: 'Image Validation', desc: 'Gemini AI acts as a lightweight gatekeeper to reject non-coffee images before inference' },
  ];

  return (
    <section style={{ padding: '100px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(201,131,58,0.2)',
            border: '1px solid rgba(201,131,58,0.4)', borderRadius: 999,
            padding: '5px 18px', color: '#c9833a', fontSize: 12,
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
          }}>SIMPLE PROCESS</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            How <span style={{ color: '#c9833a' }}>Coffeine</span> Works
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Three simple steps to get professional-grade coffee fruit quality assessment
            with market-ready pricing information.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 60 }}>
          {steps.map(s => (
            <div key={s.num} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '30px 26px', textAlign: 'center',
              transition: 'transform .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(201,131,58,0.2)', border: '2px solid rgba(201,131,58,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#c9833a', fontWeight: 800, fontSize: 16, margin: '0 auto 20px',
              }}>{s.num}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 12 }}>{s.title}</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Tech details */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 24, textAlign: 'center' }}>
            Technical Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {techDetails.map(t => (
              <div key={t.title} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.title}</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.65 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────
function AboutSection() {
  return (
    <section style={{ padding: '100px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(201,131,58,0.2)',
            border: '1px solid rgba(201,131,58,0.4)', borderRadius: 999,
            padding: '5px 18px', color: '#c9833a', fontSize: 12,
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
          }}>ABOUT THE PROJECT</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            The <span style={{ color: '#c9833a' }}>Coffeine</span> Story
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
            Built to empower Indian coffee farmers with AI-driven quality assessment — cutting
            out middlemen and ensuring fair, data-backed pricing.
          </p>
        </div>

        {/* Mission */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,131,58,0.12), rgba(40,20,5,0.5))',
          border: '1px solid rgba(201,131,58,0.25)', borderRadius: 20,
          padding: '36px 40px', marginBottom: 32,
        }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 14 }}>☕ The Problem We Solve</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: 15 }}>
            Coffee that is properly dried sells for <strong style={{ color: '#c9833a' }}>3× more money (₹195 vs ₹60 per kg)</strong>.
            Many small-scale farmers in Kerala and Coorg lack the technical expertise to accurately
            judge drying stages, making them vulnerable to unfair pricing by middlemen who
            exploit the information gap. Coffeine bridges this gap with instant, objective,
            AI-powered grading which is easily accessible.
          </p>
        </div>

        {/* Tech stack */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '28px 28px',
          }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🎨 Frontend</h3>
            {['React.js — UI framework', 'Tailwind CSS — styling', 'Lucide React — icons'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9833a', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '28px 28px',
          }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>⚙️ Backend</h3>
            {['Flask — Python web server', 'TensorFlow / Keras — CNN model', 'OpenCV — CLAHE preprocessing', 'SQLite — history database'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9833a', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CNN Architecture */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18, padding: '28px 32px', marginBottom: 32,
        }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>🧠 CNN Model Architecture</h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            The classification backbone is a custom CNN trained from scratch on a labeled dataset
            of coffee fruit images across four drying stages. Trained for <strong style={{ color: '#c9833a' }}>20 epochs</strong> with
            Adam optimizer and sparse categorical cross-entropy loss.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Input', val: '224×224×3' },
              { label: 'Conv2D', val: '32 filters' },
              { label: 'Conv2D', val: '64 filters' },
              { label: 'Conv2D', val: '128 filters' },
              { label: 'Conv2D', val: '256 filters' },
              { label: 'Dense', val: '256 neurons' },
              { label: 'Dropout', val: '50%' },
              { label: 'Dense', val: '128 neurons' },
              { label: 'Dropout', val: '30%' },
              { label: 'Softmax', val: '4 classes' },
            ].map((l, i) => (
              <React.Fragment key={i}>
                <div style={{
                  background: 'rgba(201,131,58,0.12)', border: '1px solid rgba(201,131,58,0.25)',
                  borderRadius: 10, padding: '8px 14px', textAlign: 'center',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600 }}>{l.label}</div>
                  <div style={{ color: '#c9833a', fontSize: 13, fontWeight: 700 }}>{l.val}</div>
                </div>
                {i < 9 && <div style={{ color: 'rgba(255,255,255,0.2)', alignSelf: 'center', fontSize: 18 }}>→</div>}
              </React.Fragment>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 14 }}>
            Each Conv2D block includes Batch Normalization + MaxPooling. Data augmentation (random flip, rotation ±10%, zoom ±10%) and CLAHE preprocessing are applied during training.
          </p>
        </div>

        {/* CLAHE explanation */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18, padding: '28px 32px', marginBottom: 32,
        }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 14 }}>🎨 CLAHE Image Enhancement</h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75 }}>
            Before prediction, every uploaded image passes through <strong style={{ color: '#c9833a' }}>CLAHE
              (Contrast Limited Adaptive Histogram Equalization)</strong>. The image is converted
            from RGB to LAB color space; the Lightness (L) channel is divided into 8×8 tiles
            and adaptively equalized with a clip limit of 2.0 — improving local contrast without
            amplifying noise. This makes the model robust to photos taken in poor or uneven
            lighting, which is common in field conditions.
          </p>
        </div>

        {/* Gemini note */}
        <div style={{
          background: 'rgba(66,133,244,0.07)', border: '1px solid rgba(66,133,244,0.2)',
          borderRadius: 14, padding: '20px 24px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>
            <strong style={{ color: '#60a5fa' }}>ℹ️ Note on Google Gemini:</strong> The system optionally
            integrates Gemini AI as a lightweight image validator — it checks that uploaded photos
            actually show coffee fruit before the CNN runs. If the API is unavailable, the system
            falls back gracefully to the local CNN model alone.
          </div>
        </div>
      </div>
    </section>
  );
}

// ── History ────────────────────────────────────
function HistorySection() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch('/history')
      .then(r => r.json())
      .then(d => { setHistory(d); setLoading(false); })
      .catch(() => { setHistory([]); setLoading(false); });
  }, []);

  return (
    <section style={{ padding: '100px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(201,131,58,0.2)',
            border: '1px solid rgba(201,131,58,0.4)', borderRadius: 999,
            padding: '5px 18px', color: '#c9833a', fontSize: 12,
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
          }}>RECORDS</span>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Analysis <span style={{ color: '#c9833a' }}>History</span>
          </h2>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '60px 0', fontSize: 15 }}>
            Loading history…
          </div>
        )}

        {history && history.length === 0 && (
          <div style={{
            textAlign: 'center', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '80px 24px',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🕐</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
              No history yet. Start analyzing coffee fruits!
            </p>
          </div>
        )}

        {history && history.length > 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            {history.map(item => {
              const cfg = GRADE_CONFIG[item.grade] || GRADE_CONFIG['D'];
              return (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '20px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 16, transition: 'border-color .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,131,58,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 900, fontSize: 20, flexShrink: 0,
                    }}>{item.grade}</div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                        {(item.class_name || '').replace('_', ' ')}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        🕐 {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#c9833a', fontWeight: 800, fontSize: 20 }}>₹{item.price_per_kg}/kg</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{item.drying_days}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────
function Footer({ setView }) {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(10,6,3,0.8)', padding: '40px 24px',
      textAlign: 'center',
    }}>
      <button onClick={() => setView('home')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 10,
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, background: '#c9833a',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>☕</span>
        Coffeine
      </button>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '4px 0' }}>
        AI-Powered Coffee Fruit Grading · Kerala &amp; Coorg Market Rates
      </p>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 6 }}>
        Prices are estimates based on standard agriculture board rates.
      </p>
    </footer>
  );
}

// ── App Shell ─────────────────────────────────
export default function CoffeeGradingApp() {
  const [view, setView] = useState('home');

  const content = {
    home: <HeroSection setView={setView} />,
    grade: <GradeSection />,
    guide: <GuideSection />,
    how: <HowItWorksSection />,
    about: <AboutSection />,
    history: <HistorySection />,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#120c08',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#fff',
    }}>
      <Navbar view={view} setView={setView} />
      <main>
        {content[view] || content['home']}
      </main>
      <Footer setView={setView} />
    </div>
  );
}