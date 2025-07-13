import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home"; // Optional: loading/glitch animation
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard"; 
import DoubtDetails from "./pages/DoubtDetails";
import StudentChat from "./pages/StudentChat/StudentChat";

import "./styles/global.scss"; // Global styles and variables
import UploadDoubt from "./pages/StudentDashboard/UploadDoubt";
import ClassDoubtDashboard from "./pages/StudentDashboard/ClassDoubtDashboard";
import DoubtDetails2 from "./pages/TeacherDashboard/DoubtDetails2";

// ✅ NEW: Teacher Dashboard Import
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home Page with Loading/Glitch animation */}
        <Route path="/" element={<Home />} />

        {/* Authentication Routes */}
        <Route path="/login/:user" element={<Auth />} />

        {/* Student Dashboard Pages */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/chat" element={<StudentChat />} />
        <Route path="/student/upload-doubt" element={<UploadDoubt />} />
        <Route path="/student/class-doubts/:classId" element={<ClassDoubtDashboard />} />
        <Route path="/student/doubt/:id" element={<DoubtDetails />} />

        {/* ✅ Teacher Dashboard Route */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/doubts/:doubtId" element={<DoubtDetails2 />} />

      </Routes>
    </Router>
  );
};

export default App;
