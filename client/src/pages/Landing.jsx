import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Camera, Upload, Search, Download, ArrowRight,
  Star, Shield, Zap, CheckCircle, ChevronRight,
  Clock, Award, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

/* ─── 3D Tilt Card ──────────────────────────────────────── */
function Card3D({ children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-60, 60], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ──────────────────────────────────────────────── */
const steps = [
  { icon: <Upload size={26} />, step: '01', title: 'Upload Photos', desc: 'Photographer uploads 100–2000+ event photos to a secure album in minutes.', color: '#6366f1' },
  { icon: <Zap size={26} />, step: '02', title: 'AI Face Scanning', desc: 'Our engine automatically scans and indexes every face in every photo.', color: '#8b5cf6' },
  { icon: <Search size={26} />, step: '03', title: 'Client Searches', desc: 'Client visits the shared link, uploads a selfie, and searches instantly.', color: '#22d3ee' },
  { icon: <Download size={26} />, step: '04', title: 'Download & Enjoy', desc: 'Client sees only their photos — downloads in one click. No more scrolling.', color: '#f59e0b' },
];

const features = [
  { icon: <Shield size={20} />, title: 'Secure & Private', desc: 'Photos are only accessible via private share links. Face data never leaves your server.', color: '#6366f1' },
  { icon: <Zap size={20} />, title: 'Blazing Fast', desc: 'AI processes your batch in background. Results delivered in under 5 seconds per search.', color: '#22d3ee' },
  { icon: <Star size={20} />, title: '99% Accuracy', desc: "Powered by dlib's face recognition model, the same tech trusted by researchers worldwide.", color: '#f59e0b' },
  { icon: <Camera size={20} />, title: 'Any Event Type', desc: 'Works for weddings, corporate events, school photos, sports meets — any large gathering.', color: '#8b5cf6' },
];

const stats = [
  { num: '500+', label: 'Photographers', sub: 'across India' },
  { num: '2M+', label: 'Photos Processed', sub: 'and growing' },
  { num: '99%', label: 'Accuracy Rate', sub: 'face recognition' },
  { num: '<5s', label: 'Search Time', sub: 'per query' },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Wedding Photographer, Mumbai', quote: 'FaceSnap transformed how I deliver photos. What used to take 3 hours now takes 3 minutes. My clients are amazed.', rating: 5 },
  { name: 'Priya Mehta', role: 'Event Studio, Bangalore', quote: 'The AI accuracy is incredible. I upload 1500 photos and every guest finds their pictures instantly. Game changer.', rating: 5 },
  { name: 'Arjun Patel', role: 'Corporate Photographer, Delhi', quote: 'My clients think I have a superpower now. FaceSnap makes our studio look incredibly professional and modern.', rating: 5 },
];

/* ─── Component ─────────────────────────────────────────── */
export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero-bg-mesh" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-grid-bg" />

        <div className="container">
          <div className="hero-layout">
            {/* Left content */}
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="hero-badge-wrap"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="badge badge-primary-glow">
                  <Zap size={12} /> AI-Powered Face Recognition
                </span>
              </motion.div>

              <h1 className="hero-title">
                Never Sort <span className="gold-text">2000 Photos</span>{' '}
                <br />Manually Again
              </h1>

              <p className="hero-desc">
                FaceSnap automatically finds every photo a person appears in — from
                massive event albums. Give your clients a personalized gallery in
                seconds, not hours.
              </p>

              <div className="hero-actions">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard <ArrowRight size={17} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      Start Free <ArrowRight size={17} />
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-proof">
                <div className="avatar-stack">
                  {['R', 'S', 'P', 'A', 'M'].map((l, i) => (
                    <div key={i} className="mini-avatar" style={{ '--i': i }}>{l}</div>
                  ))}
                </div>
                <div className="proof-text">
                  <span className="proof-highlight">500+ photographers</span> trust FaceSnap
                </div>
              </div>
            </motion.div>

            {/* Right — Hero Visual */}
            <motion.div
              className="hero-visual-wrap"
              initial={{ opacity: 0, x: 60, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="hero-visual">
                <div className="visual-card main-card">
                  <div className="scan-face-ui">
                    <div className="scan-ring ring-outer" />
                    <div className="scan-ring ring-mid" />
                    <div className="scan-ring ring-inner" />
                    <div className="scan-face-icon">
                      <Camera size={28} />
                    </div>
                    <div className="scan-lines">
                      <div className="scan-line" />
                    </div>
                  </div>
                  <div className="visual-card-footer">
                    <div className="vc-dot green" />
                    <span>Analyzing faces…</span>
                  </div>
                </div>

                <div className="visual-card float-card-1">
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span>24 matches found</span>
                </div>

                <div className="visual-card float-card-2">
                  <div className="mini-bar-row">
                    <div className="mini-bar" style={{ '--w': '85%', '--c': '#6366f1' }} />
                    <div className="mini-bar" style={{ '--w': '60%', '--c': '#8b5cf6' }} />
                    <div className="mini-bar" style={{ '--w': '40%', '--c': '#22d3ee' }} />
                  </div>
                  <span>99% accuracy</span>
                </div>

                <div className="visual-card float-card-3">
                  <Clock size={14} style={{ color: '#f59e0b' }} />
                  <span>3.2s scan time</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <motion.div
            className="stats-row"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-num gold-text">{s.num}</span>
                <span className="stat-label">{s.label}</span>
                <span className="stat-sub">{s.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">How It Works</span>
            <h2>From 2000 photos to <span className="gold-text">your photos</span></h2>
            <p>A simple 4-step process that saves your studio hours every week.</p>
          </div>

          <div className="steps-grid">
            {steps.map((s, i) => (
              <Card3D key={i} className="step-card-wrapper">
                <motion.div
                  className="step-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  style={{ '--step-color': s.color }}
                >
                  <div className="step-number">{s.step}</div>
                  <div className="step-icon" style={{ background: `${s.color}1a`, color: s.color }}>
                    {s.icon}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="step-arrow">
                    <ChevronRight size={16} style={{ color: s.color }} />
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">Why FaceSnap</span>
            <h2>Built for <span className="gold-text">professional studios</span></h2>
            <p>Everything you need to deliver an extraordinary client experience.</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <Card3D key={i} className="feature-card-wrapper">
                <motion.div
                  className="card feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  style={{ '--feat-color': f.color }}
                >
                  <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3>{f.title}</h3>
                    <p style={{ marginTop: 8 }}>{f.desc}</p>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">Testimonials</span>
            <h2>Loved by <span className="gold-text">photographers</span></h2>
            <p>See what studio owners across India are saying about FaceSnap.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="testimonial-card card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="stars">
                  {Array(t.rating).fill(0).map((_, si) => (
                    <Star key={si} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            className="cta-box"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cta-orb cta-orb-1" />
            <div className="cta-orb cta-orb-2" />
            <div className="cta-inner">
              <span className="badge badge-gold" style={{ marginBottom: 24, display: 'inline-flex' }}>
                <Award size={12} /> Join 500+ Photographers
              </span>
              <h2>Ready to transform your photography business?</h2>
              <p>Join thousands of photographers who've already saved thousands of hours with FaceSnap.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary">
                  Get Started — It's Free <ArrowRight size={17} />
                </Link>
                <div className="cta-trust">
                  <Lock size={14} />
                  <span>No credit card required · Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-logo">
              <div className="logo-icon-sm">
                <Camera size={16} />
              </div>
              <span>FaceSnap</span>
            </div>
            <p className="footer-copy">© 2024 FaceSnap. Built for photographers, powered by AI.</p>
            <div className="footer-links">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
