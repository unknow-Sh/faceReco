const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { uploadTemp } = require('../middleware/upload');

const router = express.Router();

// @POST /api/faces/search/:shareToken — client face search (public route)
router.post('/search/:shareToken', uploadTemp.single('selfie'), async (req, res) => {
    let selfiePath = null;
    try {
        const event = await Event.findOne({ shareToken: req.params.shareToken });
        if (!event) return res.status(404).json({ message: 'Invalid share link' });

        if (!req.file) return res.status(400).json({ message: 'Please upload a selfie photo' });
        selfiePath = req.file.path;

        // Get all encoded photos for this event
        const photos = await Photo.find({ event: event._id, faceEncoded: true });
        if (photos.length === 0) {
            return res.json({ matches: [], message: 'Photos are still being processed. Please try again later.' });
        }

        // Call Python face service
        const response = await axios.post(`${process.env.FACE_SERVICE_URL}/search`, {
            selfie_path: selfiePath,
            photos: photos.map(p => ({ id: p._id.toString(), encodings: p.faceEncodings })),
        });

        const matchedIds = response.data.matched_ids || [];
        const matchedPhotos = await Photo.find({ _id: { $in: matchedIds } }).select('-faceEncodings');

        res.json({
            matches: matchedPhotos.map(p => ({ _id: p._id, url: p.url, originalName: p.originalName })),
            totalScanned: photos.length,
            found: matchedPhotos.length,
        });
    } catch (err) {
        console.error('Face search error:', err.message);
        res.status(500).json({ message: 'Face recognition service error. Please try again.' });
    } finally {
        // Clean up selfie temp file
        if (selfiePath && fs.existsSync(selfiePath)) {
            try { fs.unlinkSync(selfiePath); } catch (_) { }
        }
    }
});

// @GET /api/faces/status/:eventId — encoding progress (photographer)
router.get('/status/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        const total = await Photo.countDocuments({ event: req.params.eventId });
        const encoded = await Photo.countDocuments({ event: req.params.eventId, faceEncoded: true });
        res.json({ total, encoded, status: event.status, percentage: total > 0 ? Math.round((encoded / total) * 100) : 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/faces/encode/:eventId — manually re-trigger encoding
router.post('/encode/:eventId', async (req, res) => {
    try {
        const unencoded = await Photo.find({ event: req.params.eventId, faceEncoded: false });
        if (unencoded.length === 0) return res.json({ message: 'All photos already encoded' });

        res.json({ message: `Re-encoding ${unencoded.length} photos in background...` });

        // Non-blocking re-encoding
        (async () => {
            for (const photo of unencoded) {
                try {
                    const response = await axios.post(`${process.env.FACE_SERVICE_URL}/encode`, {
                        photos: [{ id: photo._id.toString(), path: photo.path }],
                    });
                    const result = response.data.results?.[0];
                    if (result) {
                        await Photo.findByIdAndUpdate(photo._id, {
                            faceEncoded: true, faceCount: result.face_count, faceEncodings: result.encodings,
                        });
                    }
                } catch (e) { console.error(e.message); }
            }
            const encoded = await Photo.countDocuments({ event: req.params.eventId, faceEncoded: true });
            const total = await Photo.countDocuments({ event: req.params.eventId });
            await Event.findByIdAndUpdate(req.params.eventId, {
                encodedPhotos: encoded, status: encoded >= total ? 'ready' : 'processing',
            });
        })();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
