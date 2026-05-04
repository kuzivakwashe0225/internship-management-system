const Message = require('../models/Message');
const Internship = require('../models/Internship');
const User = require('../models/User');

exports.getConversationUsers = async (req, res) => {
    try {
        let userIds = new Set();

        if (req.user.role === 'student') {
            // Get supervisors from their active internship
            const internship = await Internship.findOne({
                student: req.user._id,
                status: 'active'
            });
            if (internship) {
                if (internship.industrySupervisor) userIds.add(internship.industrySupervisor.toString());
                if (internship.universitySupervisor) userIds.add(internship.universitySupervisor.toString());
            }
        } else if (req.user.role === 'supervisor' || req.user.role === 'university_supervisor') {
            // Get all students assigned to them
            const internships = await Internship.find({
                $or: [
                    { industrySupervisor: req.user._id },
                    { universitySupervisor: req.user._id }
                ]
            });
            internships.forEach(i => userIds.add(i.student.toString()));
        } else if (req.user.role === 'coordinator') {
            // Get all other users
            const allUsers = await User.find({ _id: { $ne: req.user._id } }, '_id');
            allUsers.forEach(u => userIds.add(u._id.toString()));
        }

        const users = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('_id name email role')
            .sort('name');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { from: req.user._id, to: userId },
                { from: userId, to: req.user._id }
            ]
        })
            .populate('from', 'name')
            .populate('to', 'name')
            .sort('createdAt');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { toId, content } = req.body;

        if (!toId || !content) {
            return res.status(400).json({ message: 'Recipient and message content are required' });
        }

        const message = await Message.create({
            from: req.user._id,
            to: toId,
            content
        });

        const populated = await message.populate('from', 'name').populate('to', 'name');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Message.updateMany(
            { from: userId, to: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            to: req.user._id,
            read: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
