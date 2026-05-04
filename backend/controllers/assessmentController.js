const SiteAssessment = require('../models/SiteAssessment');
const Internship = require('../models/Internship');

exports.createAssessment = async (req, res) => {
    try {
        const { studentId, internshipId, course, visitDate, score, comments } = req.body;

        if (!studentId || !internshipId || !course || !visitDate || score === undefined || !comments) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (score < 0 || score > 100) {
            return res.status(400).json({ message: 'Score must be between 0 and 100' });
        }

        const assessment = await SiteAssessment.create({
            student: studentId,
            universitySupervisor: req.user._id,
            internship: internshipId,
            course,
            visitDate: new Date(visitDate),
            score,
            comments
        });

        const populated = await assessment.populate('student', 'name email').populate('universitySupervisor', 'name');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssessments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            query.student = req.user._id;
        } else if (req.user.role === 'university_supervisor') {
            query.universitySupervisor = req.user._id;
        }
        // Coordinators see all

        const assessments = await SiteAssessment.find(query)
            .populate('student', 'name email department')
            .populate('universitySupervisor', 'name email')
            .populate('internship', 'company')
            .sort('-visitDate');

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.downloadAssessmentsCSV = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'university_supervisor') {
            query.universitySupervisor = req.user._id;
        }
        // Coordinators get all

        const assessments = await SiteAssessment.find(query)
            .populate('student', 'name email department')
            .populate('universitySupervisor', 'name email')
            .sort('-visitDate');

        // Generate CSV
        let csv = 'Student Name,Email,Course,Date Assessed,Lecturer,Score,Comments\n';
        assessments.forEach(assessment => {
            const date = new Date(assessment.visitDate).toLocaleDateString();
            const content = (assessment.comments || '').replace(/"/g, '""').replace(/\n/g, ' ');
            csv += `"${assessment.student?.name || ''}","${assessment.student?.email || ''}","${assessment.course}","${date}","${assessment.universitySupervisor?.name || ''}","${assessment.score}","${content}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="assessments.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
