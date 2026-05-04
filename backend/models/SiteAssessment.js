const mongoose = require('mongoose');

const siteAssessmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    universitySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    course: { type: String, required: true },
    visitDate: { type: Date, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    comments: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteAssessment', siteAssessmentSchema);
