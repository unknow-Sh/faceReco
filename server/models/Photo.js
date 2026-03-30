const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    mimetype: { type: String },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Face recognition data
    faceEncoded: { type: Boolean, default: false },
    faceCount: { type: Number, default: 0 },
    faceEncodings: { type: [[Number]], default: [] }, // Array of 128-d face encodings
    encodingError: { type: String },
    // Metadata
    width: { type: Number },
    height: { type: Number },
}, { timestamps: true });

photoSchema.index({ event: 1 });
photoSchema.index({ photographer: 1 });
photoSchema.index({ faceEncoded: 1 });

module.exports = mongoose.model('Photo', photoSchema);
