const Logbook = require('../models/Logbook');
const Internship = require('../models/Internship');

exports.createLogbookEntry = async (req, res) => {
    try {
        const { content, weekNumber } = req.body;

        // Find active internship for the student
        const internship = await Internship.findOne({ student: req.user._id, status: 'active' });
        if (!internship) return res.status(404).json({ message: 'No active internship found for logbook submission' });

        // Check if student already submitted an entry today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingEntry = await Logbook.findOne({
            student: req.user._id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existingEntry) {
            return res.status(400).json({ message: 'You have already submitted a logbook entry for today. Please try again tomorrow.' });
        }

        const entry = await Logbook.create({
            student: req.user._id,
            internship: internship._id,
            content,
            weekNumber: weekNumber ? parseInt(weekNumber) : null
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLogbookEntries = async (req, res) => {
    try {
        let filter = {};
        
        if (req.user.role === 'student') {
            filter = { student: req.user._id };
        } else if (req.user.role === 'supervisor') {
            // Find internships where this user is supervisor
            const internships = await Internship.find({ supervisor: req.user._id });
            filter = { internship: { $in: internships.map(i => i._id) } };
        } else if (req.user.role === 'university_supervisor') {
            // Logic for assigned students
            const internships = await Internship.find({ universitySupervisor: req.user._id });
            filter = { internship: { $in: internships.map(i => i._id) } };
        }

        const entries = await Logbook.find(filter)
            .populate('student', 'name email')
            .sort({ date: -1 });
            
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
