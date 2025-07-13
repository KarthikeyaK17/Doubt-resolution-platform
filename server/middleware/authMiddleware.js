// authMiddleware.js (UPDATED)
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "No user authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticateUser;
