import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DoubtDetails2.module.scss';

const DoubtDetails2 = () => {
  const { doubtId } = useParams();
  const navigate = useNavigate();

  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatActive, setChatActive] = useState(false);

  const [videoSent, setVideoSent] = useState(false);
  const [audioSent, setAudioSent] = useState(false);

  useEffect(() => {
    fetchDoubt();
  }, [doubtId]);

  const fetchDoubt = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/doubts/${doubtId}`, {
        withCredentials: true,
      });
      setDoubt(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    setChatActive(true);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(
        `http://localhost:5000/api/doubts/${doubtId}/upload-video`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setVideoSent(true);
      fetchDoubt(); // Refresh to display updated media
      setTimeout(() => setVideoSent(false), 3000);
    } catch (err) {
      console.error('Video upload failed:', err);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(
        `http://localhost:5000/api/doubts/${doubtId}/upload-audio`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setAudioSent(true);
      fetchDoubt(); // Refresh to display updated media
      setTimeout(() => setAudioSent(false), 3000);
    } catch (err) {
      console.error('Audio upload failed:', err);
    }
  };

  const handleMarkAsSolved = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/doubts/${doubtId}/mark-solved`,
        {},
        { withCredentials: true }
      );
      setDoubt((prev) => ({ ...prev, status: 'Solved' }));
      alert('Doubt marked as solved!');
    } catch (err) {
      console.error('Failed to mark as solved:', err);
      alert('Error marking as solved');
    }
  };

  const getMailLink = () => {
    const email = doubt.student?.email || '';
    const subject = `Response to your EduSoul doubt: ${doubt.title || 'No Title'}`;
    const body = `Hi ${doubt.student?.name || ''},\n\nHere’s the response to your doubt titled "${doubt.title || 'your doubt'}":\n\n[Insert your explanation here]\n\nRegards,\nYour Teacher`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return <p>Loading doubt details...</p>;
  if (!doubt) return <p>Doubt not found</p>;

  return (
    <div className={styles.doubtDetails}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back to Dashboard</button>

      <h2>{doubt.subject?.trim() || 'Untitled Doubt'}</h2>

      <p>{doubt.description || doubt.doubtText || 'No description available.'}</p>

      {doubt.doubtImage && (
        <img src={`http://localhost:5000${doubt.doubtImage}`} alt="Uploaded Doubt" className={styles.image} />
      )}
      {doubt.doubtVoice && (
        <audio controls className={styles.audio}>
          <source src={`http://localhost:5000${doubt.doubtVoice}`} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )}
      {doubt.file && !doubt.doubtImage && !doubt.doubtVoice && (
        doubt.file.endsWith('.webm') ? (
          <audio controls className={styles.audio}>
            <source src={`http://localhost:5000${doubt.file}`} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <img src={`http://localhost:5000${doubt.file}`} alt="Doubt File" className={styles.image} />
        )
      )}

      <p><strong>Branch:</strong> {doubt.student?.branch || 'N/A'}</p>
      <p><strong>Status:</strong> {doubt.status || 'Pending'}</p>

      <div className={styles.mediaSection}>
        <h3>Upload Video Explanation</h3>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        {videoSent && <p className={styles.successMsg}>Video uploaded successfully!</p>}
      </div>

      <div className={styles.mediaSection}>
        <h3>Upload Audio Explanation</h3>
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
        {audioSent && <p className={styles.successMsg}>Audio uploaded successfully!</p>}
      </div>

      {doubt.responseVideo && (
        <div className={styles.mediaPreview}>
          <h4>Teacher Video Response</h4>
          <video controls className={styles.video}>
            <source src={`http://localhost:5000${doubt.responseVideo}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {doubt.responseAudio && (
        <div className={styles.mediaPreview}>
          <h4>Teacher Audio Response</h4>
          <audio controls className={styles.audio}>
            <source src={`http://localhost:5000${doubt.responseAudio}`} type="audio/mpeg" />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}

      {/* ✅ UPDATED EMAIL SECTION */}
      <div className={styles.emailSection}>
        <h3>Respond via Email</h3>
        <p><strong>To:</strong> {doubt.student?.email || 'Email not available'}</p>
        <a href={getMailLink()} className={styles.emailBtn}>Send Email</a>
      </div>

      <div className={styles.solveSection}>
        <button
          className={styles.solveBtn}
          onClick={handleMarkAsSolved}
          disabled={doubt.status === 'Solved'}
        >
          {doubt.status === 'Solved' ? 'Already Solved' : 'Upload & Mark as Solved'}
        </button>
      </div>
    </div>
  );
};

export default DoubtDetails2;
