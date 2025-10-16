const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);


