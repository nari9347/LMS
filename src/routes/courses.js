const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: list available courses
router.get('/', async (_req, res) => {
  const courses = await Course.find().populate('teacher', 'name email');
  res.json(courses);
});

// Teacher: create a course
router.post('/', authRequired, requireRole('Teacher'), async (req, res) => {
  const { title, description, duration } = req.body;
  if (!title || !description || !duration) return res.status(400).json({ error: 'Missing fields' });
  const course = await Course.create({ title, description, duration, teacher: req.user.id });
  res.status(201).json(course);
});

// Student: enroll in a course
router.post('/:courseId/enroll', authRequired, requireRole('Student'), async (req, res) => {
  const { courseId } = req.params;
  try {
    const enrollment = await Enrollment.create({ course: courseId, student: req.user.id });
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already enrolled' });
    return res.status(400).json({ error: 'Could not enroll' });
  }
});

// Student: list my enrolled courses
router.get('/me/enrollments', authRequired, requireRole('Student'), async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id }).populate({ path: 'course', populate: { path: 'teacher', select: 'name email' }});
  res.json(enrollments.map(e => e.course));
});

// Teacher: list students enrolled in my course
router.get('/:courseId/students', authRequired, requireRole('Teacher'), async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (String(course.teacher) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email');
  res.json(enrollments.map(e => e.student));
});

module.exports = router;


