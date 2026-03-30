const express = require('express');
const Event = require('../models/Event');
const { protect, photographerOnly } = require('../middleware/auth');

const router = express.Router();

// @GET /api/events — get all events for logged-in photographer
router.get('/', protect, photographerOnly, async (req, res) => {
    try {
        const events = await Event.find({ photographer: req.user._id }).sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/events — create a new event
router.post('/', protect, photographerOnly, async (req, res) => {
    try {
        const { name, date, venue, clientName, description, tags } = req.body;
        if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });
        const event = await Event.create({
            name, date, venue, clientName, description, tags,
            photographer: req.user._id,
        });
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/events/share/:token — public route for clients (must be before /:id)
router.get('/share/:token', async (req, res) => {
    try {
        const event = await Event.findOne({ shareToken: req.params.token })
            .populate('photographer', 'name studio');
        if (!event) return res.status(404).json({ message: 'Event not found or invalid link' });
        res.json({
            _id: event._id,
            name: event.name,
            date: event.date,
            venue: event.venue,
            clientName: event.clientName,
            totalPhotos: event.totalPhotos,
            status: event.status,
            photographer: event.photographer,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/events/:id — get single event (photographer only)
router.get('/:id', protect, photographerOnly, async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, photographer: req.user._id });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/events/:id — update event
router.put('/:id', protect, photographerOnly, async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, photographer: req.user._id },
            req.body,
            { new: true }
        );
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/events/:id — delete event
router.delete('/:id', protect, photographerOnly, async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, photographer: req.user._id });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
