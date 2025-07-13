import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Leaderboard.module.scss";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/leaderboard", { withCredentials: true })
      .then((res) => setLeaders(res.data))
      .catch((err) => console.error("Leaderboard fetch error:", err));
  }, []);

  return (
    <div className={styles.leaderboard}>
      <h2>🏆 Top Contributors</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Branch</th>
            {/* Removed Doubts Uploaded */}
          </tr>
        </thead>
        <tbody>
          {leaders.map((student, idx) => (
            <tr key={student._id}>
              <td>{idx + 1}</td>
              <td>{student.name}</td>
              <td>{student.branch}</td>
              {/* Removed doubts uploaded cell */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
