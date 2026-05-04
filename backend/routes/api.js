const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, suggestUsers } = require('../controllers/authController');
const {
    uploadStudentCV, getAvailableCandidates, selectCandidate,
    getInternships, approvePlacement, coordinatorPlaceStudent,
    getAllStudentsForCoordinator, getUniversitySupervisors, suggestUniversitySupervisor
} = require('../controllers/internshipController');
const { createEvaluation, getEvaluations } = require('../controllers/evaluationController');
const { createTask, getMyTasks, getAssignedTasks, submitTask, gradeTask } = require('../controllers/taskController');
const { createComplaint, getComplaints, resolveComplaint } = require('../controllers/complaintController');
const { createIndustryFeedback, getIndustryFeedback } = require('../controllers/industryFeedbackController');
const { createLogbookEntry, getLogbookEntries } = require('../controllers/logbookController');
const { createAssessment, getAssessments } = require('../controllers/assessmentController');
const { createCourse, getCourses, deleteCourse } = require('../controllers/courseController');
const { createOrganization, getOrganizations, deleteOrganization } = require('../controllers/organizationController');
const { createApplication, getApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { getConversationUsers, getMessages, sendMessage, markRead, getUnreadCount } = require('../controllers/messageController');
const { createPendingUser, getPendingUsers, deletePendingUser } = require('../controllers/pendingUserController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCV, uploadTaskFile } = require('../middleware/upload');
const User = require('../models/User');

// --- AUTH ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.post('/auth/verify', verifyEmail);
router.get('/auth/suggest-users', suggestUsers);

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
router.post('/internships/coordinator-place', protect, authorize('coordinator'), coordinatorPlaceStudent);
router.get('/internships/:id/suggest-supervisor', protect, authorize('coordinator'), suggestUniversitySupervisor);
router.get('/students', protect, authorize('coordinator'), getAllStudentsForCoordinator);
router.get('/supervisors/university', protect, authorize('coordinator'), getUniversitySupervisors);

// --- TASKS (e.g., HIT-300) ---
router.post('/tasks', protect, authorize('university_supervisor', 'coordinator'), createTask);
router.get('/tasks/me', protect, authorize('student'), getMyTasks);
router.get('/tasks/assigned', protect, authorize('university_supervisor', 'coordinator'), getAssignedTasks);
router.post('/tasks/:id/submit', protect, authorize('student'), uploadTaskFile.single('file'), submitTask);
router.put('/tasks/:id/grade', protect, authorize('university_supervisor', 'coordinator'), gradeTask);

// --- EVALUATIONS ---
router.post('/evaluations', protect, authorize('supervisor'), createEvaluation);
router.get('/evaluations', protect, authorize('coordinator', 'supervisor', 'university_supervisor'), getEvaluations);

// --- COMPLAINTS & FEEDBACK ---
router.post('/complaints', protect, authorize('student'), createComplaint);
router.get('/complaints', protect, getComplaints);
router.put('/complaints/:id/resolve', protect, authorize('coordinator'), resolveComplaint);

// --- INDUSTRY FEEDBACK ---
router.post('/industry-feedback', protect, authorize('supervisor'), createIndustryFeedback);
router.get('/industry-feedback', protect, getIndustryFeedback);

// --- LOGBOOK ---
router.post('/logbook', protect, authorize('student'), createLogbookEntry);
router.get('/logbook', protect, getLogbookEntries);

// --- ASSESSMENTS (Site Visits) ---
router.post('/assessments', protect, authorize('university_supervisor'), createAssessment);
router.get('/assessments', protect, getAssessments);

// --- COURSES ---
router.post('/courses', protect, authorize('coordinator'), createCourse);
router.get('/courses', protect, getCourses);
router.delete('/courses/:id', protect, authorize('coordinator'), deleteCourse);

// --- ORGANIZATIONS ---
router.post('/organizations', protect, authorize('coordinator'), createOrganization);
router.get('/organizations', protect, getOrganizations);
router.delete('/organizations/:id', protect, authorize('coordinator'), deleteOrganization);

// --- APPLICATIONS ---
router.post('/applications', protect, authorize('student'), createApplication);
router.get('/applications', protect, getApplications);
router.put('/applications/:id/status', protect, authorize('coordinator'), updateApplicationStatus);

// --- MESSAGES ---
router.get('/messages/users', protect, getConversationUsers);
router.get('/messages/:userId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:userId/read', protect, markRead);
router.get('/messages/unread/count', protect, getUnreadCount);

// --- PENDING USERS (Admin) ---
router.post('/pending-users', protect, authorize('coordinator'), createPendingUser);
router.get('/pending-users', protect, authorize('coordinator'), getPendingUsers);
router.delete('/pending-users/:id', protect, authorize('coordinator'), deletePendingUser);

module.exports = router;
