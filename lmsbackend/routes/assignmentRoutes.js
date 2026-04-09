const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
    createAssignment, 
    getAssignmentsByCourse, 
    submitAssignment, 
    gradeSubmission, 
    getSubmissionsByAssignment,
    getAllSubmissionsByCourse
} = require('../controllers/assignmentController');

// Assignments
router.post('/', auth, upload.single('file'), createAssignment);
router.get('/course/:courseId', auth, getAssignmentsByCourse);
router.get('/course/:courseId/submissions-all', auth, getAllSubmissionsByCourse);

// Submissions
router.post('/submit', auth, upload.single('file'), submitAssignment);
router.get('/submissions/:assignmentId', auth, getSubmissionsByAssignment);
router.put('/grade/:id', auth, gradeSubmission);

module.exports = router;