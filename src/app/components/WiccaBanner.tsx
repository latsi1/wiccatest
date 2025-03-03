import React from "react";
import styles from "./WiccaBanner.module.css";

export default function WiccaBanner() {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <div className={styles.moon}></div>
        <div className={styles.stars}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.star}></div>
          ))}
        </div>
        <div className={styles.pentagram}></div>
        <div className={styles.bannerText}>
          <h1>Wiccers</h1>
          <p>Share your thoughts with the community</p>
        </div>
      </div>
    </div>
  );
}
