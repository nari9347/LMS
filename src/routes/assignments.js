const express = require('express');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Teacher: create assignment for a course
router.post('/:courseId', authRequired, requireRole('Teacher'), async (req, res) => {
  const { courseId } = req.params;
  const { title, description, dueDate } = req.body;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (String(course.teacher) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (!title || !description || !dueDate) return res.status(400).json({ error: 'Missing fields' });
  const assignment = await Assignment.create({ course: courseId, title, description, dueDate });
  res.status(201).json(assignment);
});

// Student: submit assignment
router.post('/submit/:assignmentId', authRequired, requireRole('Student'), async (req, res) => {
  const { assignmentId } = req.params;
  const { content } = req.body;
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (!content) return res.status(400).json({ error: 'Missing content' });
  try {
    const submission = await Submission.create({ assignment: assignmentId, student: req.user.id, content });
    res.status(201).json(submission);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already submitted' });
    return res.status(400).json({ error: 'Could not submit' });
  }
});

// Teacher: list submissions for an assignment
router.get('/:assignmentId/submissions', authRequired, requireRole('Teacher'), async (req, res) => {
  const { assignmentId } = req.params;
  const assignment = await Assignment.findById(assignmentId).populate('course');
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (String(assignment.course.teacher) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const submissions = await Submission.find({ assignment: assignmentId }).populate('student', 'name email');
  res.json(submissions);
});

// Teacher: grade a submission
router.post('/grade/:submissionId', authRequired, requireRole('Teacher'), async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;
  const submission = await Submission.findById(submissionId).populate({ path: 'assignment', populate: { path: 'course' } });
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  if (String(submission.assignment.course.teacher) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (grade == null) return res.status(400).json({ error: 'Missing grade' });
  submission.grade = grade;
  if (feedback != null) submission.feedback = feedback;
  await submission.save();
  res.json(submission);
});

// Student: view my grades
router.get('/me/grades', authRequired, requireRole('Student'), async (req, res) => {
  const submissions = await Submission.find({ student: req.user.id, grade: { $ne: null } })
    .populate({ path: 'assignment', populate: { path: 'course', select: 'title' } });
  res.json(submissions.map(s => ({
    assignmentId: s.assignment._id,
    assignmentTitle: s.assignment.title,
    courseTitle: s.assignment.course.title,
    grade: s.grade,
    feedback: s.feedback
  })));
});

module.exports = router;


