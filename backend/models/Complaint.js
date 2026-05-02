const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
    content: { type: String, required: true },
    sentimentScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    coordinatorComments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
