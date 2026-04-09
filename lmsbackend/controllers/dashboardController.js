const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Get dashboard stats for Teacher
exports.getTeacherDashboard = async (req, res) => {
    try {
        // Find courses taught by teacher
        const courses = await Course.find({ teacher: req.user.id }).populate('students', ['name', 'email']);
        const courseIds = courses.map(c => c._id);

        // Find assignments for these courses
        const assignments = await Assignment.find({ course: { $in: courseIds } });

        // Get total student enrollment count (unique across courses)
        const totalStudents = [
            ...new Set(
                courses.flatMap(c =>
                    (c.students || []).map(s => (typeof s === 'object' ? String(s._id) : String(s)))
                )
            )
        ].length;

        res.json({
            coursesCount: courses.length,
            assignmentsCount: assignments.length,
            totalStudents,
            courses
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get dashboard stats for Student
exports.getStudentDashboard = async (req, res) => {
    try {
        // Find courses student is enrolled in
        const courses = await Course.find({ students: req.user.id }).populate('teacher', ['name', 'email']);
        const courseIds = courses.map(c => c._id);

        // Find available courses (not enrolled)
        const availableCourses = await Course.find({ _id: { $nin: courseIds } }).populate('teacher', ['name', 'email']);

        // Find upcoming assignments for these courses
        const assignments = await Assignment.find({ course: { $in: courseIds } });

        // Find submission history
        const submissions = await Submission.find({ student: req.user.id }).populate('assignment', ['title']);

        res.json({
            enrolledCoursesCount: courses.length,
            pendingAssignmentsCount: assignments.length - submissions.length,   
            courses,
            availableCourses,
            pendingAssignments: assignments.filter(a => !submissions.some(s => s.assignment._id.equals(a._id))),
            recentSubmissions: submissions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};