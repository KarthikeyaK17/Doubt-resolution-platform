import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import styles from "./StudentChat.module.scss";
import { FaUserGraduate, FaPaperPlane } from "react-icons/fa";

const StudentChat = () => {
  const [onlineTeachers, setOnlineTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const selectedTeacherRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("user"));
    const studentId = storedStudent?._id || "student_" + Date.now();
    const studentName = storedStudent?.name || "Anonymous Student";

    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinStudent", {
      studentId,
      name: studentName,
    });

    socketRef.current.on("onlineTeachers", (teachers) => {
      setOnlineTeachers(teachers);
    });

    const handleReceiveMessage = (msg) => {
      if (
        selectedTeacherRef.current &&
        msg.fromSocketId === selectedTeacherRef.current.socketId
      ) {
        setMessages((prev) => [...prev, { from: "teacher", text: msg.text }]);
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    selectedTeacherRef.current = selectedTeacher;
  }, [selectedTeacher]);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setMessages([]);
  };

  const handleSend = () => {
    if (input.trim() && selectedTeacher && socketRef.current) {
      const message = input.trim();
      socketRef.current.emit("sendMessage", {
        from: "student",
        toSocketId: selectedTeacher.socketId,
        text: message,
      });

      setMessages((prev) => [...prev, { from: "student", text: message }]);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndChat = () => {
    setSelectedTeacher(null);
    setMessages([]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <h3>🟢 Online Teachers</h3>
        <ul>
          {onlineTeachers.length === 0 && <li>No teachers online</li>}
          {onlineTeachers.map((teacher, idx) => (
            <li
              key={teacher.socketId || idx}
              onClick={() => handleSelectTeacher(teacher)}
              className={
                selectedTeacher?.socketId === teacher.socketId
                  ? styles.active
                  : ""
              }
            >
              <FaUserGraduate /> {teacher.name || `Teacher ${idx + 1}`}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.chatBox}>
        {selectedTeacher ? (
          <>
            <div className={styles.chatHeader}>
              Chatting with {selectedTeacher.name}
              <button className={styles.endChatButton} onClick={handleEndChat}>
                End Chat
              </button>
            </div>
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.from === "student" ? styles.sent : styles.received
                  }
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className={styles.inputBox}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={handleKeyPress}
              />
              <button onClick={handleSend}>
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.placeholder}>
            Select a teacher to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
