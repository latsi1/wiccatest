import React from "react";
import styles from "./LoadingSpinner.module.css";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinnerCircle}>
        <svg viewBox="0 0 100 100" className={styles.spinnerSvg}>
          <path
            id="curve"
            fill="transparent"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
          <text className={styles.spinnerText}>
            <textPath href="#curve">
              turengin velju loihtii taikojaan • turengin velju loihtii
              taikojaan •
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
};
