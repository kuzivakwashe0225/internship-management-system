const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    industrySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    universitySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'interview_invite', 'approved_by_coordinator', 'active', 'completed'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
