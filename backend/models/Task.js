const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "HIT-300 First Assessment", "Logbook Week 3"
    description: { type: String },
    deadline: { type: Date, required: true },

    // Linkages
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usually University Supervisor

    // Submission
    status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
    submissionUrl: { type: String },
    feedback: { type: String },
    grade: { type: Number },

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
