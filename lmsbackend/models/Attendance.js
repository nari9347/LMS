const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            default: 'Present'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);