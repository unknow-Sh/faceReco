const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, trim: true },
    clientName: { type: String, trim: true },
    description: { type: String },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shareToken: { type: String, default: () => uuidv4(), unique: true },
    coverPhoto: { type: String },
    totalPhotos: { type: Number, default: 0 },
    encodedPhotos: { type: Number, default: 0 },
    status: { type: String, enum: ['processing', 'ready', 'draft'], default: 'draft' },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
