import React, { useEffect } from "react";
import styles from "./Home.module.scss";
import AOS from "aos";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    setTimeout(() => {
      navigate("/login/student");
    }, 7000); // Increased duration to show more animation
  }, [navigate]);

  return (
    <div className={styles.hero}>
      <div className={styles.goldParticles}></div>
      <div className={styles.metallicShine}></div>

      <h1 className={styles.glitch} data-text="EduSoul">
        EduSoul
      </h1>

      <p className={styles.tagline}>Where doubts meet clarity...</p>
    </div>
  );
};

export default Home;