import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentDashboard.module.scss";
import Leaderboard from "./Leaderboard"; // ✅ Import Leaderboard

const StudentDashboard = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("name") || "Student";
  const studentBranch = localStorage.getItem("branch") || "general";

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.heading}>Welcome, {studentName} 👋</h1>

      <div className={styles.cardContainer}>
        <div className={styles.card} onClick={() => navigate("/student/chat")}>
          <div className={styles.cardIcon}>💬</div>
          <h2>Chat with Online Teachers</h2>
          <p>Instantly connect with available teachers in real-time.</p>
        </div>

        <div className={styles.card} onClick={() => navigate("/student/upload-doubt")}>
          <div className={styles.cardIcon}>❓</div>
          <h2>Upload a Doubt</h2>
          <p>Type, snap, or speak your doubt. Let’s solve it.</p>
        </div>

        <div
          className={styles.card}
          onClick={() => navigate(`/student/class-doubts/${studentBranch.toLowerCase()}`)}
        >
          <div className={styles.cardIcon}>📚</div>
          <h2>Class Doubt Dashboard</h2>
          <p>View doubts from classmates and upvote similar ones.</p>
        </div>
      </div>

      {/* ✅ New Leaderboard Component Section */}
      <div className={styles.leaderboardSection}>
        <Leaderboard />
      </div>
    </div>
  );
};

export default StudentDashboard;
