const Course = require('../models/Course');
const CourseFeedback = require('../models/CourseFeedback');

// Create a new course
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;

    try {
        const newCourse = new Course({
            title,
            description,
            teacher: req.user.id
        });

        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all courses
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', ['name', 'email']);
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', ['name', 'email'])
            .populate('students', ['name', 'email', 'role']);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Enroll in a course (for students)
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Check if student already enrolled
        if (course.students.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User already enrolled' });
        }

        course.students.push(req.user.id);
        await course.save();
        res.json(course.students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add or update course feedback (students only)
exports.upsertCourseFeedback = async (req, res) => {
    const { rating, sentiment, comment } = req.body;

    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ msg: 'Only students can submit feedback' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const numericRating = Number(rating);
        if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
        }

        const allowedSentiments = ['good', 'avg', 'bad', 'worst'];
        const normalizedSentiment = String(sentiment || '').trim().toLowerCase();
        if (!allowedSentiments.includes(normalizedSentiment)) {
            return res.status(400).json({ msg: 'Invalid sentiment value' });
        }

        const feedback = await CourseFeedback.findOneAndUpdate(
            { course: req.params.id, student: req.user.id },
            {
                course: req.params.id,
                student: req.user.id,
                rating: numericRating,
                sentiment: normalizedSentiment,
                comment: String(comment || '').trim()
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return res.json(feedback);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
};

// Get feedback summary for a course + current student's feedback
exports.getCourseFeedback = async (req, res) => {
    try {
        const feedbacks = await CourseFeedback.find({ course: req.params.id }).populate('student', ['name']);

        const total = feedbacks.length;
        const avgRating = total > 0
            ? Number((feedbacks.reduce((acc, f) => acc + Number(f.rating || 0), 0) / total).toFixed(1))
            : 0;

        const sentimentCounts = { good: 0, avg: 0, bad: 0, worst: 0 };
        feedbacks.forEach((f) => {
            const key = String(f.sentiment || '').toLowerCase();
            if (Object.prototype.hasOwnProperty.call(sentimentCounts, key)) {
                sentimentCounts[key] += 1;
            }
        });

        const myFeedback = feedbacks.find((f) => String(f.student?._id || f.student) === String(req.user.id)) || null;

        return res.json({
            summary: {
                total,
                avgRating,
                sentiments: sentimentCounts
            },
            myFeedback
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
};

// Upload course material (Teacher)
exports.uploadCourseMaterial = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        if (String(course.teacher) !== String(req.user.id)) {
            return res.status(403).json({ msg: 'Only course teacher can upload materials' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a file' });
        }

        const title = String(req.body.title || req.file.originalname || 'Course Material').trim();
        const normalizedFilePath = String(req.file.path || '').replace(/\\/g, '/');

        course.materials = course.materials || [];
        course.materials.push({
            title,
            file: normalizedFilePath
        });

        await course.save();
        return res.json(course.materials);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
};