import React from "react";
import styles from "./LoadingText.module.css";

const LoadingText: React.FC = () => {
  const text = "Wicca loihtii...";

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.wavyText}>
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={styles.wavyCharacter}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </div>
      <div className={styles.sparkles}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={styles.sparkle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingText;
