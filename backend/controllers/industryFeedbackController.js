const IndustryFeedback = require('../models/IndustryFeedback');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

exports.createIndustryFeedback = async (req, res) => {
    try {
        const { studentId, description } = req.body;

        const feedback_id = "FB-" + Date.now().toString().slice(-6);
        const result = sentiment.analyze(description);
        let sentimentLabel = 'Neutral';
        if (result.score > 0) sentimentLabel = 'Positive';
        if (result.score < 0) sentimentLabel = 'Negative';

        const feedback = await IndustryFeedback.create({
            feedback_id,
            student: studentId,
            supervisor: req.user._id,
            description,
            sentiment: sentimentLabel,
            sentimentScore: result.score
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getIndustryFeedback = async (req, res) => {
    try {
        let query = {};

        // Industry supervisors see only their own feedback
        if (req.user.role === 'supervisor') {
            query.supervisor = req.user._id;
        }
        // Coordinators and University supervisors see all feedback

        const feedback = await IndustryFeedback.find(query)
            .populate('student', 'name email department')
            .populate('supervisor', 'name company')
            .sort('-createdAt');
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
