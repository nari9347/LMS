const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// @desc    Mark Attendance
router.post('/:courseId', auth, async (req, res) => {
    try {
        const { date, records } = req.body;
        let attendance = await Attendance.findOne({ course: req.params.courseId, date });
        if (attendance) {
            attendance.records = records;
            await attendance.save();
        } else {
            attendance = new Attendance({ course: req.params.courseId, date, records });
            await attendance.save();
        }
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get Attendance for Course
router.get('/:courseId', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ course: req.params.courseId }).populate('records.student', ['name']);
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;