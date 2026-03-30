const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { protect, photographerOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// @POST /api/photos/:eventId/upload — bulk photo upload
router.post('/:eventId/upload', protect, photographerOnly, upload.array('photos', 500), async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.eventId, photographer: req.user._id });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

        const photos = await Promise.all(req.files.map(async (file) => {
            const url = `/uploads/${req.params.eventId}/${file.filename}`;
            return Photo.create({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                url,
                size: file.size,
                mimetype: file.mimetype,
                event: event._id,
                photographer: req.user._id,
            });
        }));

        // Update event photo count
        await Event.findByIdAndUpdate(event._id, {
            $inc: { totalPhotos: photos.length },
            status: 'processing',
        });

        // Trigger background face encoding (non-blocking)
        triggerFaceEncoding(photos, event._id).catch(console.error);

        res.status(201).json({ message: `${photos.length} photos uploaded successfully`, count: photos.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Background face encoding trigger
async function triggerFaceEncoding(photos, eventId) {
    const BATCH_SIZE = 10;
    for (let i = 0; i < photos.length; i += BATCH_SIZE) {
        const batch = photos.slice(i, i + BATCH_SIZE);
        try {
            const response = await axios.post(`${process.env.FACE_SERVICE_URL}/encode`, {
                photos: batch.map(p => ({ id: p._id.toString(), path: p.path })),
            });

            const results = response.data.results || [];
            for (const result of results) {
                await Photo.findByIdAndUpdate(result.id, {
                    faceEncoded: true,
                    faceCount: result.face_count,
                    faceEncodings: result.encodings,
                });
            }

            const encodedCount = await Photo.countDocuments({ event: eventId, faceEncoded: true });
            const totalCount = await Photo.countDocuments({ event: eventId });
            await Event.findByIdAndUpdate(eventId, {
                encodedPhotos: encodedCount,
                status: encodedCount >= totalCount ? 'ready' : 'processing',
            });
        } catch (err) {
            console.error('Face encoding batch error:', err.message);
            for (const photo of batch) {
                await Photo.findByIdAndUpdate(photo._id, {
                    faceEncoded: false,
                    encodingError: err.message,
                });
            }
        }
    }
}

// @GET /api/photos/:eventId — get all photos for an event
router.get('/:eventId', protect, photographerOnly, async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.eventId, photographer: req.user._id });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        const photos = await Photo.find({ event: req.params.eventId }).select('-faceEncodings').sort({ createdAt: 1 });
        res.json(photos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/photos/:photoId — delete a photo
router.delete('/:photoId', protect, photographerOnly, async (req, res) => {
    try {
        const photo = await Photo.findOne({ _id: req.params.photoId, photographer: req.user._id });
        if (!photo) return res.status(404).json({ message: 'Photo not found' });
        // Delete file from disk
        if (fs.existsSync(photo.path)) fs.unlinkSync(photo.path);
        await Photo.findByIdAndDelete(photo._id);
        await Event.findByIdAndUpdate(photo.event, { $inc: { totalPhotos: -1 } });
        res.json({ message: 'Photo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
