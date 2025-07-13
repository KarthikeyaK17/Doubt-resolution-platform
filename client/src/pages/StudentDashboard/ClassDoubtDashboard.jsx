import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ClassDoubtDashboard.module.scss";

const ClassDoubtDashboard = () => {
  const [doubts, setDoubts] = useState([]);
  const navigate = useNavigate();

  const branch = JSON.parse(localStorage.getItem("user"))?.branch;

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/doubts/branch/${branch}`);
        setDoubts(response.data);
      } catch (error) {
        console.error("Error fetching doubts:", error);
      }
    };

    if (branch) {
      fetchDoubts();
    }
  }, [branch]);

  const handleUpvote = async (e, doubtId) => {
    e.stopPropagation(); // Prevent navigation on upvote
    try {
      await axios.post(`http://localhost:5000/api/doubts/upvote/${doubtId}`);
      setDoubts((prevDoubts) =>
        prevDoubts.map((d) =>
          d._id === doubtId ? { ...d, upvotes: d.upvotes + 1 } : d
        )
      );
    } catch (error) {
      console.error("Error upvoting doubt:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.heading}>Class Doubts ({branch?.toUpperCase()})</h2>

      {doubts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No doubts have been uploaded yet.</p>
          <p>Be the first one to raise your voice — your doubt might help the whole class.</p>
          <button className={styles.uploadBtn} onClick={() => navigate("/student/upload-doubt")}>
            Upload a Doubt
          </button>
        </div>
      ) : (
        <ul className={styles.doubtList}>
          {doubts.map((doubt) => (
            <li key={doubt._id} className={styles.doubtItem} onClick={() => navigate(`/student/doubt/${doubt._id}`)}>
              <div>
                <h4>{doubt.student?.name || "Anonymous"}</h4>
                {doubt.text && <p>{doubt.text}</p>}
                {doubt.file && doubt.file.endsWith(".webm") ? (
                  <audio controls src={`http://localhost:5000${doubt.file}`} />
                ) : doubt.file ? (
                  <img src={`http://localhost:5000${doubt.file}`} alt="Doubt" />
                ) : null}
              </div>
              <div className={styles.upvote}>
                <button onClick={(e) => handleUpvote(e, doubt._id)}>
                  Upvote ({doubt.upvotes})
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassDoubtDashboard;
