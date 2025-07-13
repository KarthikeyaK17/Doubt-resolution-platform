import React, { useState } from "react";
import styles from "./Auth.module.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Auth = () => {
  const [userType, setUserType] = useState("student");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ** New email domain validation **
    if (!formData.email.toLowerCase().endsWith("@mgit.ac.in")) {
      alert("Please use an email ending with @mgit.ac.in");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: userType,
      ...(userType === "student" && { branch: formData.branch })
    };

    try {
      if (isLogin) {
        const res = await axios.post(
          "http://localhost:5000/api/users/login",
          payload,
          { withCredentials: true }
        );
      
        console.log("Login response:", res);
      
        localStorage.setItem("user", JSON.stringify(res.data.user));
      
        alert("Login successful!");
      
        // ✅ Role-based redirection
        if (userType === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      
      } else {
        const res = await axios.post("http://localhost:5000/api/users/signup", payload);
        alert("Signup successful!");
        navigate(`/login/${userType}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.response?.data?.error || "Something went wrong"));
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.card}>
        <div className={styles.switchTabs}>
          <button
            className={userType === "student" ? styles.active : ""}
            onClick={() => setUserType("student")}
          >
            Student
          </button>
          <button
            className={userType === "teacher" ? styles.active : ""}
            onClick={() => setUserType("teacher")}
          >
            Teacher
          </button>
        </div>

        <h2>{isLogin ? "Login" : "Sign Up"} as {userType}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            className={styles.input}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className={styles.input}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {!isLogin && userType === "student" && (
            <input
              type="text"
              placeholder="Branch"
              required
              className={styles.input}
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
          )}

          <button type="submit" className={styles.glowBtn}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p
          className={styles.toggleText}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
