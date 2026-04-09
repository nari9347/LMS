const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTeacherDashboard, getStudentDashboard } = require('../controllers/dashboardController');

// @route   GET api/dashboard/teacher
// @desc    Get dashboard stats for Teacher
// @access  Private
router.get('/teacher', auth, getTeacherDashboard);

// @route   GET api/dashboard/student
// @desc    Get dashboard stats for Student
// @access  Private
router.get('/student', auth, getStudentDashboard);

module.exports = router;