import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, User, Download, RefreshCw, XCircle, ImageIcon } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';
import './ClientPortal.css';

export default function ClientPortal() {
    const { token } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [selfie, setSelfie] = useState(null);
    const [results, setResults] = useState(null);

    useEffect(() => {
        fetchEvent();
    }, [token]);

    const fetchEvent = async () => {
        try {
            const { data } = await API.get(`/events/share/${token}`);
            setEvent(data);
        } catch (err) {
            toast.error('Invalid link or event expired');
        } finally {
            setLoading(false);
        }
    };

    const handleSelfieChange = (e) => {
        if (e.target.files[0]) setSelfie(e.target.files[0]);
    };

    const startScanning = async () => {
        if (!selfie) return toast.error('Please upload your photo first');

        setScanning(true);
        setResults(null);
        const formData = new FormData();
        formData.append('selfie', selfie);

        try {
            const { data } = await API.post(`/faces/search/${token}`, formData);
            setResults(data);
            if (data.matches.length > 0) {
                toast.success(`Found ${data.matches.length} photos of you!`);
            } else {
                toast('No matches found. Try a clearer photo.', { icon: '🔍' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Face matching failed');
        } finally {
            setScanning(false);
        }
    };

    if (loading) return <div className="flex-center section"><div className="spinner"></div></div>;
    if (!event) return <div className="container section empty-state"><XCircle size={48} className="icon" color="var(--accent-red)" /><h2>Event Not Found</h2><p>This share link may be invalid or expired.</p></div>;

    return (
        <div className="client-portal container section">
            <div className="portal-hero">
                <span className="badge badge-gold">Client Portal</span>
                <h1>{event.name}</h1>
                <p>By <strong>{event.photographer?.studio || event.photographer?.name}</strong> • {new Date(event.date).toLocaleDateString()}</p>
            </div>

            <div className="search-section card">
                {!results ? (
                    <div className="search-setup">
                        <div className="search-info">
                            <h3>Find Your Photos Instantly</h3>
                            <p>Upload a clear selfie, and our AI will find every photo you appear in within this event gallery.</p>
                        </div>

                        <div className="selfie-dropzone" onClick={() => document.getElementById('selfie-input').click()}>
                            {selfie ? (
                                <div className="selfie-preview">
                                    <img src={URL.createObjectURL(selfie)} alt="Your selfie" />
                                    <div className="selfie-badge"><User size={14} /> Ready to scan</div>
                                </div>
                            ) : (
                                <div className="selfie-placeholder">
                                    <Camera size={48} />
                                    <span>Click to upload selfie</span>
                                    <p>Clear, front-facing photos work best</p>
                                </div>
                            )}
                            <input type="file" id="selfie-input" hidden accept="image/*" onChange={handleSelfieChange} />
                        </div>

                        <button className="btn btn-primary btn-lg" onClick={startScanning} disabled={scanning || !selfie} style={{ width: '100%' }}>
                            {scanning ? <><RefreshCw size={20} className="spin" /> Scanning {event.totalPhotos} photos...</> : <><Search size={20} /> Find My Photos</>}
                        </button>
                    </div>
                ) : (
                    <div className="results-header">
                        <div>
                            <h3>Results Found</h3>
                            <p>We found {results.matches.length} photos of you out of {results.totalScanned} scanned.</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setResults(null); setSelfie(null); }}>
                            Search Again
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {results && (
                    <motion.div className="results-gallery" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        {results.matches.length > 0 ? (
                            <div className="photo-grid">
                                {results.matches.map((photo) => (
                                    <div key={photo._id} className="photo-item">
                                        <img src={`http://localhost:5000${photo.url}`} alt="Matched face" />
                                        <div className="photo-overlay">
                                            <a href={`http://localhost:5000${photo.url}`} download className="btn btn-primary btn-sm btn-icon">
                                                <Download size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <ImageIcon size={48} className="icon" />
                                <h3>No Matches Found</h3>
                                <p>We couldn't find your face in this album. Try uploading a different selfie with better lighting.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="portal-footer">
                <p>Powered by FaceSnap AI • Secure & Private Face Recognition</p>
            </div>
        </div>
    );
}
