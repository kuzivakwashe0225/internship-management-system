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
// For Coordinator: Manually place a student into a company
exports.coordinatorPlaceStudent = async (req, res) => {
    try {
        const { studentId, companyId, universitySupervisorId } = req.body;

        const student = await User.findById(studentId);
        if (!student) return res.status(400).json({ message: 'Student not found' });
        if (!student.cvUrl) return res.status(400).json({ message: 'Student has not uploaded a CV yet. Students must submit a CV before being placed.' });

        const company = await User.findById(companyId);
        if (!company || company.role !== 'supervisor') return res.status(400).json({ message: 'Invalid company selected' });

        const internship = await Internship.create({
            student: studentId,
            industrySupervisor: companyId,
            company: company.company,
            universitySupervisor: universitySupervisorId,
            startDate: new Date(),
            status: 'active'
        });

        // Mark student as employed
        await User.findByIdAndUpdate(studentId, { isEmployed: true });

        res.status(201).json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// For Coordinator: See all students and their CV status
exports.getAllStudentsForCoordinator = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUniversitySupervisors = async (req, res) => {
    try {
        const supervisors = await User.find({ role: 'university_supervisor' }).select('-password');
        res.json(supervisors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Smart suggestion: Find best-fit university supervisors for a student
exports.suggestUniversitySupervisor = async (req, res) => {
    try {
        const { internshipId } = req.query;

        const internship = await Internship.findById(internshipId).populate('student');
        if (!internship) return res.status(400).json({ message: 'Internship not found' });

        const student = internship.student;

        // Find supervisors in the same department
        const supervisors = await User.find({
            role: 'university_supervisor',
            department: student.department
        }).select('_id name department email');

        // For each, count their active students
        const suggestions = await Promise.all(
            supervisors.map(async (sup) => {
                const count = await Internship.countDocuments({
                    universitySupervisor: sup._id,
                    status: 'active'
                });
                return { ...sup.toObject(), activeStudentCount: count };
            })
        );

        // Sort by load (ascending) — lowest load first
        suggestions.sort((a, b) => a.activeStudentCount - b.activeStudentCount);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
