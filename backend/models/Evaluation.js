const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantitativeGrade: { type: Number, required: true, min: 0, max: 100 },
    qualitativeFeedback: { type: String, required: true },
    sentimentScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
