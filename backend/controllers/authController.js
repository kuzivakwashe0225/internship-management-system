const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, studentId, department, company } = req.body;

        // 1. Validation: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

        // 2. Validation: Password length
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

        // 3. Check if email exists in PendingUser
        const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
        if (!pendingUser) return res.status(403).json({ message: 'This email is not authorized to register. Please contact your administrator.' });

        // 4. Duplicate Email Check
        if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

        // 5. Create user with data from PendingUser, merged with registration input
        const user = await User.create({
            name: name || pendingUser.name,
            email,
            password,
            role: role || pendingUser.role,
            studentId,
            department: department || pendingUser.department,
            company,
            isVerified: true
        });

        // 6. Remove from PendingUser after successful registration
        await PendingUser.deleteOne({ _id: pendingUser._id });

        res.status(201).json({ message: 'Registration successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Please verify your email before logging in.' });
            }
            if (user.role === 'supervisor' && !user.isCompanyApproved) {
                return res.status(403).json({ message: 'Your company profile is pending approval by the University Coordinator.' });
            }

            res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body; // Changed from query to body for POST request
        const user = await User.findOne({ email, otpCode: otp });

        if (!user) return res.status(400).json({ message: 'Invalid OTP code' });

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired. Please register again or request a new one.' });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.suggestUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 1) return res.json([]);

        const suggestions = await PendingUser.find({
            name: { $regex: query, $options: 'i' }
        }).select('name email').limit(10);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};