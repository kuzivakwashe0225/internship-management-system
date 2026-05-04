const PendingUser = require('../models/PendingUser');

exports.createPendingUser = async (req, res) => {
    try {
        const { name, email, role, department } = req.body;

        if (await PendingUser.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ message: 'User email already pending' });
        }

        const pendingUser = await PendingUser.create({
            name,
            email: email.toLowerCase(),
            role,
            department
        });

        res.status(201).json(pendingUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await PendingUser.find().sort('-createdAt');
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePendingUser = async (req, res) => {
    try {
        await PendingUser.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pending user deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
