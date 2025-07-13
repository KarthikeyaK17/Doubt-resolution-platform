const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 subject: { type: String }, // ✅ Added subject field
  doubtText: { type: String, default: null },
  doubtImage: { type: String, default: null },
  doubtVoice: { type: String, default: null },
  upvotes: { type: Number, default: 0 },
  responseVideo: { type: String, default: null },
  responseAudio: { type: String, default: null },
  status: { type: String, default: 'pending' },
  isSolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Doubt", doubtSchema);
