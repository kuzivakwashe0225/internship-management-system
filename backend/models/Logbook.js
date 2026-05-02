const mongoose = require('mongoose');

const logbookSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Logbook', logbookSchema);
