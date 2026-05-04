const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    industry: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
