const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['student', 'supervisor', 'university_supervisor', 'coordinator'], required: true },
    department: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);
