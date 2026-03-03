const Task = require('../models/Task');
const User = require('../models/User');
const { sendDeadlineReminderEmail } = require('../services/emailService');

// University Supervisor / Coordinator explicitly setting a Task (e.g., HIT-300)
exports.createTask = async (req, res) => {
    try {
        const { title, description, deadline, studentId } = req.body;
        const student = await User.findById(studentId);

        const task = await Task.create({
            title,
            description,
            deadline,
            student: studentId,
            assignedBy: req.user._id
        });

        // Fire and forget reminder email
        sendDeadlineReminderEmail(student.email, title, deadline);

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Students view their assigned Tasks
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ student: req.user._id }).populate('assignedBy', 'name role');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Univ Supervisors view Tasks they assigned
exports.getAssignedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedBy: req.user._id }).populate('student', 'name email department');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Students upload their reports (Multer handles writing file, we grab URL)
exports.submitTask = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const task = await Task.findByIdAndUpdate(req.params.id, {
            status: 'submitted',
            submissionUrl: `/uploads/tasks/${req.file.filename}`
        }, { new: true });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Univ Supervisor reviews and grades the report
exports.gradeTask = async (req, res) => {
    try {
        const { feedback, grade } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {
            status: 'graded',
            feedback,
            grade
        }, { new: true });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
