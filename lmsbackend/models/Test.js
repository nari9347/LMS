const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    minGradeRequired: {
        type: Number,
        default: 0 // e.g. 70 means only students who averages 70 or have a 70+ assignment can take this
    },
    questions: [{
        questionText: String,
        options: [String],
        correctAnswerIndex: Number
    }],
    allowedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);