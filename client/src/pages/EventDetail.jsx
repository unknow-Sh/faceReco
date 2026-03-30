import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Trash2, Share2, ArrowLeft, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api';
import toast from 'react-hot-toast';
import './EventDetail.css';

export default function EventDetail() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchEventData();
        const interval = setInterval(fetchStatus, 5000); // Poll status every 5s
        return () => clearInterval(interval);
    }, [id]);

    const fetchEventData = async () => {
        try {
            const [eventRes, photosRes] = await Promise.all([
                API.get(`/events/${id}`),
                API.get(`/photos/${id}`)
            ]);
            setEvent(eventRes.data);
            setPhotos(photosRes.data);
        } catch (err) {
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatus = async () => {
        if (event?.status === 'ready') return;
        try {
            const { data } = await API.get(`/faces/status/${id}`);
            if (event) setEvent({ ...event, status: data.status, encodedPhotos: data.encoded, totalPhotos: data.total });
        } catch (err) { }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        setUploadProgress(10);
        const formData = new FormData();
        files.forEach(file => formData.append('photos', file));

        try {
            await API.post(`/photos/${id}/upload`, formData, {
                onUploadProgress: (p) => setUploadProgress(10 + Math.round((p.loaded / p.total) * 80))
            });
            toast.success('Upload complete! Faces are being processed.');
            fetchEventData();
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const deletePhoto = async (photoId) => {
        try {
            await API.delete(`/photos/${photoId}`);
            setPhotos(photos.filter(p => p._id !== photoId));
            toast.success('Photo deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const copyShareLink = () => {
        const link = `${window.location.origin}/share/${event.shareToken}`;
        navigator.clipboard.writeText(link);
        toast.success('Client share link copied!');
    };

    if (loading) return <div className="flex-center section"><div className="spinner"></div></div>;

    return (
        <div className="event-detail container section">
            <div className="detail-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Back to Events</Link>
                <div className="flex-between">
                    <div>
                        <h1>{event.name}</h1>
                        <p>{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={copyShareLink}><Share2 size={18} /> Share with Clients</button>
                        <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Photos'}
                        </button>
                        <input type="file" ref={fileInputRef} multiple onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
                    </div>
                </div>
            </div>

            {uploading && (
                <div className="upload-loader card">
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <span>Uploading your photos...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div></div>
                </div>
            )}

            <div className="status-grid grid-3">
                <div className="card status-card">
                    <div className="icon-box blue"><Clock size={24} /></div>
                    <div className="stat-content">
                        <span className="label">Total Photos</span>
                        <span className="value">{event.totalPhotos}</span>
                    </div>
                </div>
                <div className="card status-card">
                    <div className="icon-box gold"><RefreshCw size={24} className={event.status === 'processing' ? 'spin' : ''} /></div>
                    <div className="stat-content">
                        <span className="label">Encoded Faces</span>
                        <span className="value">{event.encodedPhotos} / {event.totalPhotos}</span>
                    </div>
                </div>
                <div className="card status-card">
                    <div className="icon-box green"><CheckCircle2 size={24} /></div>
                    <div className="stat-content">
                        <span className="label">Event Status</span>
                        <span className="value" style={{ textTransform: 'capitalize' }}>{event.status}</span>
                    </div>
                </div>
            </div>

            <div className="photo-gallery-section">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h2>Gallery</h2>
                    <span className="badge badge-gold">{photos.length} Total</span>
                </div>

                {photos.length > 0 ? (
                    <div className="photo-grid">
                        {photos.map((photo) => (
                            <motion.div key={photo._id} className="photo-item" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <img src={`http://localhost:5000${photo.url}`} alt={photo.originalName} loading="lazy" />
                                <div className="photo-overlay">
                                    {!photo.faceEncoded && <span className="encoding-tag"><Clock size={12} /> Processing</span>}
                                    <button className="delete-photo" onClick={() => deletePhoto(photo._id)}><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Upload size={48} className="icon" />
                        <p>No photos uploaded yet. Use the button above to upload event photos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
