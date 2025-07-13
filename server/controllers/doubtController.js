const Doubt = require("../models/Doubt");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Upload a doubt
exports.uploadDoubt = async (req, res) => {
  try {
    const studentId = req.session.user?._id;
    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized: User not logged in" });
    }

    const { doubtText, subject } = req.body;

    if (!doubtText?.trim() && !req.file) {
      return res.status(400).json({ error: "Please provide text or upload a file." });
    }

    const newDoubt = new Doubt({
      student: studentId,
      subject: subject?.trim(),
      doubtText: doubtText?.trim() || null,
      doubtImage: req.file && req.file.mimetype.startsWith("image") ? `/uploads/${req.file.filename}` : null,
      doubtVoice: req.file && req.file.mimetype.startsWith("audio") ? `/uploads/${req.file.filename}` : null,
      upvotes: 0,
      status: 'pending',
    });

    await newDoubt.save();
    await User.findByIdAndUpdate(studentId, { $inc: { doubtUploadCount: 1 } });

    res.status(201).json({ message: "Doubt uploaded successfully", doubt: newDoubt });
  } catch (error) {
    console.error("Error uploading doubt:", error);
    res.status(500).json({ error: "Server error while uploading doubt" });
  }
};

// Get doubts by branch
exports.getDoubtsByBranch = async (req, res) => {
  const branch = req.params.branch;
  try {
    const doubts = await Doubt.find()
      .populate("student", "name branch")
      .sort({ createdAt: -1 });

    const filteredDoubts = doubts.filter(doubt => doubt.student?.branch === branch);
    res.json(filteredDoubts);
  } catch (error) {
    console.error("Error fetching doubts:", error);
    res.status(500).json({ error: "Failed to fetch doubts" });
  }
};

// Get class doubts
exports.getClassDoubts = async (req, res) => {
  try {
    const studentId = req.session.user?._id;
    const student = await User.findById(studentId);

    if (!student) return res.status(404).json({ error: "User not found" });

    const doubts = await Doubt.find()
      .populate("student", "name branch")
      .sort({ createdAt: -1 });

    const filteredDoubts = doubts.filter(d => d.student?.branch === student.branch);
    res.status(200).json(filteredDoubts);
  } catch (error) {
    console.error("Error fetching class doubts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upvote a doubt
exports.upvoteDoubt = async (req, res) => {
  try {
    const doubtId = req.params.id;
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }
    doubt.upvotes = (doubt.upvotes || 0) + 1;
    await doubt.save();
    res.status(200).json({ message: "Doubt upvoted successfully", upvotes: doubt.upvotes });
  } catch (error) {
    console.error("Error upvoting doubt:", error);
    res.status(500).json({ error: "Server error while upvoting doubt" });
  }
};

// Get single doubt by ID
exports.getSingleDoubt = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Updated this line to include "email"
    const doubt = await Doubt.findById(id).populate("student", "name email branch");

    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }

    res.status(200).json(doubt);
  } catch (error) {
    console.error("Error fetching single doubt:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark doubt as solved
exports.markDoubtAsSolved = async (req, res) => {
  try {
    const updated = await Doubt.findByIdAndUpdate(
      req.params.id,
      { status: 'Solved' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as solved' });
  }
};

// Get all doubts for teachers with optional filters + upvote sorting
exports.getAllDoubtsForTeacher = async (req, res) => {
  try {
    const { branch, status, sortBy } = req.query;

    let doubts = await Doubt.find()
      .populate("student", "name branch");

    const filtered = doubts.filter(doubt => {
      const branchMatch = branch ? doubt.student?.branch === branch : true;
      const actualStatus = doubt.status ? doubt.status.toLowerCase() : 'pending';
      const statusMatch = status ? (actualStatus === status.toLowerCase()) : true;
      return branchMatch && statusMatch;
    });

    if (sortBy === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching all doubts for teacher:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload video response
exports.uploadVideo = async (req, res) => {
  try {
    const doubtId = req.params.id;

    if (!req.file || !req.file.mimetype.startsWith("video")) {
      return res.status(400).json({ error: "Invalid or missing video file" });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }

    doubt.responseVideo = `/uploads/responses/${req.file.filename}`;
    await doubt.save();

    res.status(200).json({ message: "Video uploaded successfully", videoUrl: doubt.responseVideo });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Server error while uploading video" });
  }
};

// Upload audio response
exports.uploadAudio = async (req, res) => {
  try {
    const doubtId = req.params.id;

    if (!req.file || !req.file.mimetype.startsWith("audio")) {
      return res.status(400).json({ error: "Invalid or missing audio file" });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }

    doubt.responseAudio = `/uploads/responses/${req.file.filename}`;

    await doubt.save();

    res.status(200).json({ message: "Audio uploaded successfully", audioUrl: doubt.responseAudio });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({ error: "Server error while uploading audio" });
  }
};

// Toggle Solved/Unsolved
exports.toggleSolvedStatus = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    doubt.isSolved = !doubt.isSolved;
    await doubt.save();

    res.status(200).json({ message: `Doubt marked as ${doubt.isSolved ? 'Solved' : 'Unsolved'}`, isSolved: doubt.isSolved });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// === Additional helper for updating doubt title (new) ===
exports.updateDoubtTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    const doubt = await Doubt.findById(id);
    if (!doubt) return res.status(404).json({ error: "Doubt not found" });

    doubt.title = title.trim();
    await doubt.save();
    res.status(200).json({ message: "Title updated", doubt });
  } catch (error) {
    console.error("Error updating doubt title:", error);
    res.status(500).json({ error: "Server error updating title" });
  }
};
