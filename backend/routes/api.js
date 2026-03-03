const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail } = require('../controllers/authController');
const { uploadStudentCV, getAvailableCandidates, selectCandidate, getInternships, approvePlacement } = require('../controllers/internshipController');
const { createEvaluation, getEvaluations } = require('../controllers/evaluationController');
const { createTask, getMyTasks, getAssignedTasks, submitTask, gradeTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCV, uploadTaskFile } = require('../middleware/upload');
const User = require('../models/User');

// --- AUTH ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.get('/auth/verify', verifyEmail);

// --- DASHBOARD/USERS ---
// Coordinators reviewing and approving Companies
router.get('/users/companies', protect, authorize('coordinator'), async (req, res) => {
    const companies = await User.find({ role: 'supervisor' }).select('-password');
    res.json(companies);
});
router.put('/users/companies/:id/approve', protect, authorize('coordinator'), async (req, res) => {
    const { allocatedDepartments } = req.body;
    const company = await User.findByIdAndUpdate(req.params.id, { isCompanyApproved: true, allocatedDepartments }, { new: true });
    res.json(company);
});

// --- INTERNSHIPS & CV POOL ---
// Student uploads CV
router.post('/internships/cv', protect, authorize('student'), uploadCV.single('cv'), uploadStudentCV);
// Industry Supervisor views CV pool
router.get('/internships/candidates', protect, authorize('supervisor'), getAvailableCandidates);
// Industry Supervisor selects candidate for interview
router.post('/internships/select', protect, authorize('supervisor'), selectCandidate);
// View all internships based on your role
router.get('/internships', protect, getInternships);
// Coordinator finalizes placement, linking a Univ Supervisor
router.put('/internships/:id/approve', protect, authorize('coordinator'), approvePlacement);

// --- TASKS (e.g., HIT-300) ---
router.post('/tasks', protect, authorize('university_supervisor', 'coordinator'), createTask);
router.get('/tasks/me', protect, authorize('student'), getMyTasks);
router.get('/tasks/assigned', protect, authorize('university_supervisor', 'coordinator'), getAssignedTasks);
router.post('/tasks/:id/submit', protect, authorize('student'), uploadTaskFile.single('file'), submitTask);
router.put('/tasks/:id/grade', protect, authorize('university_supervisor', 'coordinator'), gradeTask);

// --- EVALUATIONS ---
router.post('/evaluations', protect, authorize('supervisor'), createEvaluation);
router.get('/evaluations', protect, authorize('coordinator', 'supervisor', 'university_supervisor'), getEvaluations);

module.exports = router;
