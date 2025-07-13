import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./DoubtDetails.module.scss";

const DoubtDetails = () => {
  const { id } = useParams();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoubt = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doubts/${id}`, { withCredentials: true });
      setDoubt(response.data);
    } catch (error) {
      console.error("Error fetching doubt:", error);
      setError("Could not fetch doubt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubt();
  }, [id]);

  const handleUpvote = async () => {
    try {
      await axios.post(`http://localhost:5000/api/doubts/upvote/${id}`, {}, { withCredentials: true });
      fetchDoubt();
    } catch (error) {
      console.error("Error upvoting doubt:", error);
    }
  };

  if (loading) return <div className={styles.spinner}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!doubt) return <div className={styles.error}>Doubt not found.</div>;

  return (
    <div className={styles.detailsContainer}>
      <h2 className={styles.title}>Doubt by {doubt.student?.name || "Anonymous"}</h2>

      {doubt.doubtText && <p className={styles.text}>{doubt.doubtText}</p>}

      {doubt.doubtImage && (
        <img
          src={`http://localhost:5000${doubt.doubtImage}`}
          alt="Uploaded Doubt"
          className={styles.image}
        />
      )}

      {doubt.doubtVoice && (
        <audio controls src={`http://localhost:5000${doubt.doubtVoice}`} className={styles.audio} />
      )}

      {doubt.file && !doubt.doubtImage && !doubt.doubtVoice && (
        doubt.file.endsWith(".webm") ? (
          <audio
            controls
            src={`http://localhost:5000${doubt.file}`}
            className={styles.audio}
          />
        ) : (
          <img
            src={`http://localhost:5000${doubt.file}`}
            alt="Doubt"
            className={styles.image}
          />
        )
      )}

      <div className={styles.extra}>
        <p><strong>Branch:</strong> {doubt.student?.branch || "N/A"}</p>
        <p><strong>Uploaded on:</strong> {new Date(doubt.createdAt).toLocaleString()}</p>
      </div>

      <div className={styles.upvoteContainer}>
        <button className={styles.upvoteButton} onClick={handleUpvote}>
          👍 Upvote
        </button>
        <span className={styles.upvoteCount}>{doubt.upvotes || 0} Upvotes</span>
      </div>

      {/* Teacher Response Section */}
      <div className={styles.teacherResponse}>
        <h3>Teacher Response</h3>

        {(doubt.teacherName || doubt.updatedAt) && (
          <p className={styles.teacherInfo}>
            by <strong>{doubt.teacherName || "Teacher"}</strong> on{" "}
            {doubt.updatedAt ? new Date(doubt.updatedAt).toLocaleString() : ""}
          </p>
        )}

        {doubt.responseVideo && (
          <div className={styles.responseBlock}>
            <h4>🎥 Video Explanation</h4>
            <video controls className={styles.video}>
              <source src={`http://localhost:5000${doubt.responseVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <a
              href={`http://localhost:5000${doubt.responseVideo}`}
              download
              className={styles.downloadBtn}
            >
              ⬇ Download Video
            </a>
          </div>
        )}

        {doubt.audioPath && (
          <div className={styles.responseBlock}>
            <h4>🎙️ Audio Explanation</h4>
            <audio controls className={styles.audio}>
              <source src={`http://localhost:5000${doubt.audioPath}`} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
            <a
              href={`http://localhost:5000${doubt.audioPath}`}
              download
              className={styles.downloadBtn}
            >
              ⬇ Download Audio
            </a>
          </div>
        )}

        {doubt.responseEmail && (
          <div className={styles.responseBlock}>
            <h4>📧 Email Response</h4>
            <div className={styles.emailBox}>{doubt.responseEmail}</div>
          </div>
        )}

        {!doubt.responseVideo && !doubt.audioPath && !doubt.responseEmail && (
          <p className={styles.noResponse}>No response from the teacher yet.</p>
        )}
      </div>
    </div>
  );
};

export default DoubtDetails;
