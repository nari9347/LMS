const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
	createCourse,
	getCourses,
	getCourseById,
	enrollCourse,
	uploadCourseMaterial,
	upsertCourseFeedback,
	getCourseFeedback
} = require('../controllers/courseController');

// @route   POST api/course
// @desc    Create a course
// @access  Private (Teacher)
router.post('/', auth, createCourse);

// @route   GET api/course
// @desc    Get all courses
// @access  Private
router.get('/', auth, getCourses);

// @route   GET api/course/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, getCourseById);

// @route   POST api/course/enroll/:id
// @desc    Enroll in a course
// @access  Private (Student)
router.post('/enroll/:id', auth, enrollCourse);

// @route   POST api/course/:id/material
// @desc    Upload course material (Teacher)
// @access  Private (Teacher owner)
router.post('/:id/material', auth, upload.single('file'), uploadCourseMaterial);

// @route   POST api/course/:id/feedback
// @desc    Add/update student feedback for a course
// @access  Private (Student)
router.post('/:id/feedback', auth, upsertCourseFeedback);

// @route   GET api/course/:id/feedback
// @desc    Get feedback summary for a course and current student feedback
// @access  Private
router.get('/:id/feedback', auth, getCourseFeedback);

module.exports = router;