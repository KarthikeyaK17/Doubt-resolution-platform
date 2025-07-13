const User = require("../models/User");

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, branch, studentId, classId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      ...(role === "student" && { branch, studentId, classId })
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login Controller
// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Store trimmed user object in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
    };

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Logout Controller
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// Get Current Session User
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.session.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: "student" })
      .select("name branch studentId")  // Select only needed fields
      .limit(10)
      .lean();

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Leaderboard fetch failed:", error);
    res.status(500).json({ error: "Leaderboard fetch failed" });
  }
};
