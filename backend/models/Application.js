const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationName: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
