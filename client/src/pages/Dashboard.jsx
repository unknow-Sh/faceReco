import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Share2, Trash2, Camera, ExternalLink, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', date: '', venue: '', clientName: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await API.get('/events');
            setEvents(data);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const createEvent = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/events', formData);
            setEvents([data, ...events]);
            setShowModal(false);
            setFormData({ name: '', date: '', venue: '', clientName: '' });
            toast.success('Event created successfully');
        } catch (err) {
            toast.error('Failed to create event');
        }
    };

    const deleteEvent = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this event? All photos will be lost.')) return;
        try {
            await API.delete(`/events/${id}`);
            setEvents(events.filter(ev => ev._id !== id));
            toast.success('Event deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const copyLink = (token, e) => {
        e.preventDefault();
        e.stopPropagation();
        const link = `${window.location.origin}/share/${token}`;
        navigator.clipboard.writeText(link);
        toast.success('Share link copied to clipboard!');
    };

    return (
        <div className="dashboard container section">
            <div className="dashboard-header">
                <div>
                    <span className="badge badge-gold">Photographer Dashboard</span>
                    <h1>Welcome, {user?.name.split(' ')[0]}</h1>
                    <p>Manage your events and guest photo portals.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Create New Event
                </button>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            ) : events.length > 0 ? (
                <div className="events-grid">
                    {events.map((event) => (
                        <Link to={`/event/${event._id}`} key={event._id} className="card event-card">
                            <div className="event-info">
                                <h3>{event.name}</h3>
                                <div className="event-meta">
                                    <span><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                    {event.venue && <span><MapPin size={14} /> {event.venue}</span>}
                                </div>
                                {event.clientName && (
                                    <div className="event-client">
                                        <Users size={14} /> Client: {event.clientName}
                                    </div>
                                )}
                            </div>

                            <div className="event-stats">
                                <div className="stat">
                                    <span className="num">{event.totalPhotos}</span>
                                    <span className="label">Photos</span>
                                </div>
                                <div className="status-badge">
                                    {event.status === 'ready' ? (
                                        <span className="badge badge-green">Ready</span>
                                    ) : event.status === 'processing' ? (
                                        <span className="badge badge-blue">Processing</span>
                                    ) : (
                                        <span className="badge">Draft</span>
                                    )}
                                </div>
                            </div>

                            <div className="event-actions">
                                <button className="btn btn-secondary btn-sm" onClick={(e) => copyLink(event.shareToken, e)}>
                                    <Share2 size={14} /> Copy Link
                                </button>
                                <button className="btn btn-danger btn-sm btn-icon" onClick={(e) => deleteEvent(event._id, e)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <Camera size={48} className="icon" />
                    <h3>No events found</h3>
                    <p>Create your first event to start uploading photos and using face recognition.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '20px' }}>
                        Get Started
                    </button>
                </div>
            )}

            {/* Modal Overlay */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            className="modal-content card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>New Event</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={createEvent}>
                                <div className="form-group">
                                    <label>Event Name *</label>
                                    <input className="input" placeholder="e.g. Rahul & Sneha Wedding" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input className="input" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Client Name</label>
                                        <input className="input" placeholder="Name of guest" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Venue</label>
                                    <input className="input" placeholder="e.g. Taj Hotel, Mumbai" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Event</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
