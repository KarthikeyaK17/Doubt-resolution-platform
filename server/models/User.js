const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], required: true },
  
  // Student-specific fields
  branch: { type: String },
  studentId: { type: String },
  classId: { type: String },

  // Future use for teacher
  class: { type: String },
  subject: { type: String }
});

module.exports = mongoose.model('User', userSchema);
