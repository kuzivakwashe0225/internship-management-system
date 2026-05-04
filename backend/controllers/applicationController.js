const Application = require('../models/Application');

exports.createApplication = async (req, res) => {
    try {
        const { organizationName, address, role } = req.body;

        if (!organizationName || !address || !role) {
            return res.status(400).json({ message: 'Organization name, address, and role are required' });
        }

        const application = await Application.create({
            student: req.user._id,
            organizationName,
            address,
            role
        });

        const populated = await application.populate('student', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            query.student = req.user._id;
        }
        // Coordinators see all

        const applications = await Application.find(query)
            .populate('student', 'name email studentId department')
            .sort('-createdAt');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('student', 'name email');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
