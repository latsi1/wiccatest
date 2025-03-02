import React from "react";
import styles from "./LoadingText.module.css";

interface LoadingTextProps {
  text?: string;
}

// Predefined positions for sparkles to avoid hydration errors
const sparklePositions = [
  { left: 15, top: 20, delay: 0.2 },
  { left: 35, top: 45, delay: 0.5 },
  { left: 65, top: 30, delay: 0.8 },
  { left: 85, top: 60, delay: 1.1 },
  { left: 25, top: 75, delay: 1.4 },
  { left: 50, top: 15, delay: 0.3 },
  { left: 75, top: 85, delay: 0.7 },
  { left: 90, top: 40, delay: 1.0 },
];

const LoadingText: React.FC<LoadingTextProps> = ({
  text = "Wicca loihtii taikojansa...",
}) => {
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
        {sparklePositions.map((position, i) => (
          <div
            key={i}
            className={styles.sparkle}
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              animationDelay: `${position.delay}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingText;
