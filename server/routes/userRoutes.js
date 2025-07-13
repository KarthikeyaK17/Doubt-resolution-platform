const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getCurrentUser,
  getLeaderboard
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/current", getCurrentUser);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
