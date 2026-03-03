const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, studentId, department, company } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name, email, password, role,
            studentId, department, company,
            verificationToken
        });

        console.log(`Attempting to send verification email to: ${user.email}`);
        await sendVerificationEmail(user.email, verificationToken);
        console.log(`Email dispatch function completed for ${user.email}`);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
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
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};