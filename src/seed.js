const mongoose = require('mongoose');
const { mongoUri } = require('./config');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Assignment = require('./models/Assignment');

async function ensureUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await User.hashPassword(password);
    user = await User.create({ name, email, passwordHash, role });
    console.log(`Created ${role}: ${email}`);
  } else {
    console.log(`Found existing ${role}: ${email}`);
  }
  return user;
}

async function ensureCourse({ title, description, duration, teacherId }) {
  let course = await Course.findOne({ title, teacher: teacherId });
  if (!course) {
    course = await Course.create({ title, description, duration, teacher: teacherId });
    console.log(`Created course: ${title}`);
  } else {
    console.log(`Found existing course: ${title}`);
  }
  return course;
}

async function ensureEnrollment({ studentId, courseId }) {
  let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) {
    enrollment = await Enrollment.create({ student: studentId, course: courseId });
    console.log(`Enrolled student ${studentId} in course ${courseId}`);
  } else {
    console.log(`Found existing enrollment for student ${studentId}`);
  }
  return enrollment;
}

async function ensureAssignment({ courseId, title, description, dueDate }) {
  let assignment = await Assignment.findOne({ course: courseId, title });
  if (!assignment) {
    assignment = await Assignment.create({ course: courseId, title, description, dueDate });
    console.log(`Created assignment: ${title}`);
  } else {
    console.log(`Found existing assignment: ${title}`);
  }
  return assignment;
}

async function run() {
  await mongoose.connect(mongoUri, { autoIndex: true });
  console.log('MongoDB connected (seed)');

  try {
    const teacher = await ensureUser({
      name: 'Alice Teacher',
      email: 'teacher@example.com',
      password: 'Passw0rd!',
      role: 'Teacher'
    });

    const student = await ensureUser({
      name: 'Bob Student',
      email: 'student@example.com',
      password: 'Passw0rd!',
      role: 'Student'
    });

    const course = await ensureCourse({
      title: 'Intro to LMS',
      description: 'Getting started with the LMS platform and workflows.',
      duration: '4 weeks',
      teacherId: teacher._id
    });

    await ensureEnrollment({ studentId: student._id, courseId: course._id });

    const due = new Date();
    due.setDate(due.getDate() + 7);
    await ensureAssignment({
      courseId: course._id,
      title: 'Week 1 Assignment',
      description: 'Submit a short intro and goals for the course.',
      dueDate: due
    });
  } finally {
    await mongoose.disconnect();
    console.log('Seed complete');
  }
}

run().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});





