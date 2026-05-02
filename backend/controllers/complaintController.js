const Complaint = require('../models/Complaint');
const Internship = require('../models/Internship');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

exports.createComplaint = async (req, res) => {
    try {
        const { content } = req.body;

        // Find active internship for this student
        const internship = await Internship.findOne({ student: req.user._id, status: 'active' });

        // Analyze sentiment
        const result = sentiment.analyze(content);

        const complaint = await Complaint.create({
            student: req.user._id,
            internship: internship ? internship._id : null,
            content,
            sentimentScore: result.score
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.student = req.user._id;
        } else if (req.user.role === 'university_supervisor') {
            // Get complaints from students assigned to this supervisor
            const internships = await Internship.find({ universitySupervisor: req.user._id });
            const studentIds = internships.map(i => i.student);
            query.student = { $in: studentIds };
        }
        // Coordinators see all

        const complaints = await Complaint.find(query)
            .populate('student', 'name email department')
            .populate({
                path: 'internship',
                populate: { path: 'industrySupervisor', select: 'name company' }
            })
            .sort('-createdAt');

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const { status, coordinatorComments } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status, coordinatorComments },
            { new: true }
        );
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
