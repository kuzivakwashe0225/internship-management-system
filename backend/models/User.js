const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'supervisor', 'university_supervisor', 'coordinator'],
        default: 'student'
    },

    // Verification & Auth
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    // --- Student Specific Fields ---
    studentId: { type: String },
    department: { type: String },
    cvUrl: { type: String },
    skills: { type: [String], default: [] },
    isEmployed: { type: Boolean, default: false },

    // --- Industry Supervisor Specific Fields ---
    company: { type: String },
    isCompanyApproved: { type: Boolean, default: false }, // Must be approved by Coordinator
    allocatedDepartments: { type: [String], default: [] } // Departments they are allowed to hire from
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
