const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create an assignment for a course
exports.createAssignment = async (req, res) => {
    const { course, title, description, dueDate } = req.body;
    try {
        const newAssignment = new Assignment({
            course,
            teacher: req.user.id,
            title,
            description,
            dueDate,
            file: req.file ? req.file.path : null
        });
        const assignment = await newAssignment.save();
        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get assignments for a specific course
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Submit an assignment
exports.submitAssignment = async (req, res) => {
    const { assignmentId, content } = req.body;
    try {
        const safeContent = typeof content === 'string' ? content.trim() : '';

        if (!assignmentId) {
            return res.status(400).json({ msg: 'Assignment ID is required' });
        }

        if (!safeContent && !req.file) {
            return res.status(400).json({ msg: 'Provide text content or upload a file' });
        }

        const newSubmission = new Submission({
            assignment: assignmentId,
            student: req.user.id,
            content: safeContent || 'File submission',
            file: req.file ? req.file.path : null
        });
        const submission = await newSubmission.save();
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Grade a submission (Teacher)
exports.gradeSubmission = async (req, res) => {
    const { grade, feedback } = req.body;
    try {
        let submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ msg: 'Submission not found' });

        submission.grade = grade;
        submission.feedback = feedback;
        await submission.save();
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all submissions for an assignment
exports.getSubmissionsByAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId }).populate('student', ['name', 'email']);
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all submissions for a course (for leaderboard)
exports.getAllSubmissionsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId }).select('_id');
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({ assignment: { $in: assignmentIds } }).populate('student', ['name', 'email']);
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};