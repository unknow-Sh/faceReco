import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, Search, Download, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const steps = [
    { icon: <Upload size={28} />, step: '01', title: 'Upload Photos', desc: 'Photographer uploads 100–2000+ event photos to a secure album in minutes.' },
    { icon: <Zap size={28} />, step: '02', title: 'AI Face Scanning', desc: 'Our face recognition engine automatically scans and indexes every face in every photo.' },
    { icon: <Search size={28} />, step: '03', title: 'Client Searches', desc: 'Your client visits the shared link, uploads a selfie, and searches instantly.' },
    { icon: <Download size={28} />, step: '04', title: 'Download & Enjoy', desc: 'Client sees only their photos — downloads in one click. No more endless scrolling.' },
];

const features = [
    { icon: <Shield size={22} />, title: 'Secure & Private', desc: 'Photos are only accessible via private share links. Face data never leaves your server.' },
    { icon: <Zap size={22} />, title: 'Blazing Fast', desc: 'AI processes your batch in background. Results delivered in under 5 seconds per search.' },
    { icon: <Star size={22} />, title: '99% Accuracy', desc: 'Powered by dlib\'s face recognition model, the same tech trusted by researchers worldwide.' },
    { icon: <Camera size={22} />, title: 'Any Event Type', desc: 'Works for weddings, corporate events, school photos, sports meets — any large gathering.' },
];

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="landing">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="container">
                    <motion.div className="hero-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="hero-badge"><span className="badge badge-gold"><Zap size={13} /> AI-Powered Face Recognition</span></div>
                        <h1>Never Sort <span className="gold-text">2000 Photos</span><br />Manually Again</h1>
                        <p className="hero-desc">FaceSnap automatically finds every photo a person appears in — from massive event albums. Give your clients a personalized gallery in seconds, not hours.</p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-primary">Go to Dashboard <ArrowRight size={18} /></Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary">Start Free <ArrowRight size={18} /></Link>
                                    <Link to="/login" className="btn btn-secondary">Sign In</Link>
                                </>
                            )}
                        </div>
                        <div className="hero-proof">
                            <div className="avatar-stack">
                                {['R', 'S', 'P', 'A', 'M'].map((l, i) => <div key={i} className="mini-avatar">{l}</div>)}
                            </div>
                            <span>Trusted by <strong>500+</strong> photographers across India</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="badge badge-gold">How It Works</span>
                        <h2>From 2000 photos to <span className="gold-text">your photos</span></h2>
                        <p>A simple 4-step process that saves your studio hours every week.</p>
                    </div>
                    <div className="steps-grid">
                        {steps.map((s, i) => (
                            <motion.div key={i} className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="step-number">{s.step}</div>
                                <div className="step-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Built for <span className="gold-text">professional studios</span></h2>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <motion.div key={i} className="card feature-card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section cta-section">
                <div className="container">
                    <motion.div className="cta-box" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <h2>Ready to transform your photography business?</h2>
                        <p>Join 500+ photographers who've already saved thousands of hours with FaceSnap.</p>
                        <Link to="/register" className="btn btn-primary">Get Started — It's Free <ArrowRight size={18} /></Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-inner">
                        <div className="footer-logo"><Camera size={18} /><span>FaceSnap</span></div>
                        <p>© 2024 FaceSnap. Built for photographers, powered by AI.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
