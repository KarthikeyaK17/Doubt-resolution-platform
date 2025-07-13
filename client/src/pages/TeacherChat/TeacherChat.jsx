import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import styles from "./TeacherChat.module.scss";

const TeacherChat = ({ teacherId, teacherName }) => {
  const [onlineStudents, setOnlineStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const selectedStudentRef = useRef(selectedStudent);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinTeacher", { teacherId, name: teacherName });

    socketRef.current.on("onlineStudents", (students) => {
      setOnlineStudents(students);
    });

    const handleReceiveMessage = (msg) => {
      if (
        selectedStudentRef.current &&
        msg.fromSocketId === selectedStudentRef.current.socketId
      ) {
        setMessages((prev) => [...prev, { from: "student", text: msg.text }]);
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage", handleReceiveMessage);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [teacherId, teacherName]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setMessages([]);
  };

  const handleSend = () => {
    if (input.trim() && selectedStudent && socketRef.current) {
      socketRef.current.emit("sendMessage", {
        from: "teacher",
        toSocketId: selectedStudent.socketId,
        text: input.trim(),
      });

      setMessages((prev) => [...prev, { from: "teacher", text: input.trim() }]);
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
    setSelectedStudent(null);
    setMessages([]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <h3>🟢 Online Students</h3>
        <ul>
          {onlineStudents.length === 0 && <li>No students online</li>}
          {onlineStudents.map((student, idx) => (
            <li
              key={student.socketId || idx}
              onClick={() => handleSelectStudent(student)}
              className={
                selectedStudent?.socketId === student.socketId
                  ? styles.active
                  : ""
              }
            >
              {student.name || `Student ${idx + 1}`}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.chatBox}>
        {selectedStudent ? (
          <>
            <div className={styles.chatHeader}>
              Chatting with {selectedStudent.name || "a student"}
              <button className={styles.endChatButton} onClick={handleEndChat}>
                End Chat
              </button>
            </div>
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.from === "teacher" ? styles.sent : styles.received
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
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className={styles.placeholder}>
            Select a student to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherChat;
