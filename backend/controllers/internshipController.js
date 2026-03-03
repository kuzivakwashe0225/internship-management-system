const Internship = require('../models/Internship');
const User = require('../models/User');
const { sendInterviewInviteEmail } = require('../services/emailService');

// For Students: Upload CV and set their status to ready for placement.
exports.uploadStudentCV = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const student = await User.findById(req.user._id);
        student.cvUrl = `/uploads/cvs/${req.file.filename}`;

        // Optional: save string skills sent in body
        if (req.body.skills) student.skills = JSON.parse(req.body.skills);

        await student.save();
        res.json({ message: 'CV uploaded successfully', user: student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// For Industry Supervisors: Browse available students matching their allocated departments
exports.getAvailableCandidates = async (req, res) => {
    try {
        const supervisor = await User.findById(req.user._id);
        const candidates = await User.find({
            role: 'student',
            isEmployed: false,
            cvUrl: { $exists: true, $ne: null },
            department: { $in: supervisor.allocatedDepartments }
        }).select('-password');

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// For Industry Supervisors: Trigger an Interview Invite / Candidate Selection
exports.selectCandidate = async (req, res) => {
    try {
        const { studentId } = req.body;
        const student = await User.findById(studentId);
        const supervisor = await User.findById(req.user._id);

        // Creates an internship record pending Coordinator Final approval
        const internship = await Internship.create({
            student: studentId,
            industrySupervisor: supervisor._id,
            company: supervisor.company,
            startDate: new Date(), // Provisional
            status: 'interview_invite'
        });

        // Fire and forget Email
        sendInterviewInviteEmail(student.email, supervisor.company);

        res.status(201).json({ message: 'Candidate invited. Awaiting coordinator final approval.', internship });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Universal: Get viewing specific internships
exports.getInternships = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') query.student = req.user._id;
        if (req.user.role === 'supervisor') query.industrySupervisor = req.user._id;
        if (req.user.role === 'university_supervisor') query.universitySupervisor = req.user._id;

        // Coordinators see all within their department. For MVP we just return all.
        const internships = await Internship.find(query)
            .populate('student', 'name email department cvUrl')
            .populate('industrySupervisor', 'name email company')
            .populate('universitySupervisor', 'name email');

        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// For Coordinator: Finalize an internship placement and link a University Supervisor
exports.approvePlacement = async (req, res) => {
    try {
        const { universitySupervisorId } = req.body;

        const internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { universitySupervisor: universitySupervisorId, status: 'active' },
            { new: true }
        );

        // Update student to employed to remove CV from pool
        await User.findByIdAndUpdate(internship.student, { isEmployed: true });

        res.json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
