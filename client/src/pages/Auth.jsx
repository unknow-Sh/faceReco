import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', studio: '', phone: '' });

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.email, form.password);
                toast.success('Welcome back!');
            } else {
                await register(form);
                toast.success('Account created! Welcome to FaceSnap 🎉');
            }
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left art panel */}
            <div className="auth-art">
                <div className="auth-art-content">
                    <div className="auth-logo">
                        <div className="logo-icon"><Camera size={28} /></div>
                        <span>FaceSnap</span>
                    </div>
                    <h2>Find your moment<br />in every frame.</h2>
                    <p>The AI-powered platform that helps photographers deliver personalized photo galleries to every guest — automatically.</p>
                    <div className="auth-stats">
                        <div className="stat"><span className="stat-num">2000+</span><span>Photos sorted per event</span></div>
                        <div className="stat"><span className="stat-num">99%</span><span>Face recognition accuracy</span></div>
                        <div className="stat"><span className="stat-num">&lt;5s</span><span>Time to find your photos</span></div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-form-panel">
                <motion.div
                    className="auth-box"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-header">
                        <h3>{isLogin ? 'Welcome back' : 'Create account'}</h3>
                        <p>{isLogin ? 'Sign in to your studio dashboard' : 'Join thousands of photographers'}</p>
                    </div>

                    <form onSubmit={submit}>
                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label className="label">Full Name</label>
                                    <div className="input-icon"><User size={16} /><input className="input" name="name" value={form.name} onChange={handle} placeholder="Your full name" required /></div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Studio Name (optional)</label>
                                    <div className="input-icon"><Building2 size={16} /><input className="input" name="studio" value={form.studio} onChange={handle} placeholder="e.g. Sharma Photography" /></div>
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div className="input-icon"><Mail size={16} /><input className="input" name="email" type="email" value={form.email} onChange={handle} placeholder="you@studio.com" required /></div>
                        </div>
                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="input-icon">
                                <Lock size={16} />
                                <input className="input" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="••••••••" required />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> {isLogin ? 'Signing in...' : 'Creating account...'}</> : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
                            {isLogin ? 'Register' : 'Sign in'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
