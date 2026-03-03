const Evaluation = require('../models/Evaluation');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

exports.createEvaluation = async (req, res) => {
    try {
        const { internshipId, quantitativeGrade, qualitativeFeedback } = req.body;

        // Analyze qualitative sentiment (-5 to +5 per word, aggregated score)
        const result = sentiment.analyze(qualitativeFeedback);

        const evaluation = await Evaluation.create({
            internship: internshipId,
            supervisor: req.user._id,
            quantitativeGrade,
            qualitativeFeedback,
            sentimentScore: result.score
        });

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEvaluations = async (req, res) => {
    try {
        // Coordinators can view all, supervisors view ones they authored
        let query = {};
        if (req.user.role === 'supervisor') query.supervisor = req.user._id;

        const evaluations = await Evaluation.find(query)
            .populate({ path: 'internship', populate: { path: 'student', select: 'name email department' } })
            .populate('supervisor', 'name email');
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
