const mongoose = require('mongoose');

const CourseFeedbackSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        sentiment: {
            type: String,
            enum: ['good', 'avg', 'bad', 'worst'],
            required: true
        },
        comment: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

CourseFeedbackSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('CourseFeedback', CourseFeedbackSchema);
