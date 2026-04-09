const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Test = require('../models/Test');

// @desc    Create a Test
router.post('/', auth, async (req, res) => {
    try {
        const { course, title, minGradeRequired, questions, allowedStudents } = req.body;
        const newTest = new Test({
            course,
            teacher: req.user.id,
            title,
            minGradeRequired,
            questions,
            allowedStudents
        });
        const test = await newTest.save();
        res.json(test);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get tests for a course
router.get('/:courseId', auth, async (req, res) => {
    try {
        const tests = await Test.find({ course: req.params.courseId }).populate('allowedStudents', ['name']);
        res.json(tests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;