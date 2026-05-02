const mongoose = require('mongoose');

const industryFeedbackSchema = new mongoose.Schema({
    feedback_id: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    sentiment: { type: String, required: true },
    sentimentScore: { type: Number, default: 0 },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('IndustryFeedback', industryFeedbackSchema);
