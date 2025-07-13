import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./UploadDoubt.module.scss";

const UploadDoubt = () => {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState(""); // NEW
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const id = storedUser._id || storedUser.id || null;
    setUser({ ...storedUser, _id: id });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "audio/webm", "audio/wav", "audio/mp3"];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Invalid file type. Please upload an image or audio file.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please upload a smaller file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audio = new File([blob], "voice_note.webm", { type: "audio/webm" });
        setFile(audio);
        setAudioURL(URL.createObjectURL(blob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied or not supported.");
      console.error(err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      alert("User not identified. Please log in again.");
      return;
    }

    if (!text.trim() && !file) {
      alert("Please type a doubt or upload a file.");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("doubtText", text);
   formData.append("subject", subject); // ✅ correct

    if (file) formData.append("file", file);
    formData.append("branch", user.branch || "");
    formData.append("studentId", user._id);

    try {
      const response = await axios.post("http://localhost:5000/api/doubts/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setLoading(false);

      if (response.status === 201) {
        alert("Doubt uploaded successfully!");
        navigate("/student/dashboard");
      } else {
        alert("Failed to upload your doubt. Try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Upload error:", error);
      alert("Something went wrong while uploading.");
    }
  };

  return (
    <motion.div
      className={styles.uploadContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.glassCard}>
        <h2>Upload Your Doubt</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Enter Subject (e.g., Physics - Laws of Motion)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={styles.subjectInput}
            required
          />

          <textarea
            placeholder="Type your doubt here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={styles.textarea}
          />

          <label htmlFor="file-upload" className={styles.uploadLabel}>
            {file ? file.name : "Click to upload image or voice file"}
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*,audio/*"
            className={styles.inputFile}
            onClick={(e) => (e.target.value = null)}
          />

          <button
            type="button"
            onClick={() => setShowRecorder(!showRecorder)}
            className={styles.voiceBtn}
          >
            {showRecorder ? "Close Voice Recorder" : "Record Voice"}
          </button>

          {showRecorder && (
            <div className={styles.voiceControls}>
              {!recording ? (
                <button type="button" onClick={handleStartRecording} className={styles.recordStart}>
                  🎙️ Start Recording
                </button>
              ) : (
                <button type="button" onClick={handleStopRecording} className={styles.recordStop}>
                  ⏹️ Stop Recording
                </button>
              )}
            </div>
          )}

          {audioURL && (
            <audio controls className={styles.audioPlayer}>
              <source src={audioURL} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Uploading..." : "Submit Doubt"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default UploadDoubt;
