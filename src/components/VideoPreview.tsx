"use client";

import React, { useState, useRef } from "react";
import styles from "./VideoPreview.module.css";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoPreviewProps {
  video: VideoFile;
  onClick: () => void;
}

export default function VideoPreview({ video, onClick }: VideoPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      // Load saved volume from localStorage
      const savedVolume = localStorage.getItem("wiccatube-volume");
      if (savedVolume) {
        videoRef.current.volume = parseFloat(savedVolume);
      }
      videoRef.current.currentTime = 2; // Start from 2 seconds for better preview
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`${styles.previewCard} ${isHovered ? styles.hovered : ""}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.previewVideo}
          muted
          loop
          preload="metadata"
        >
          <source src={video.path} type="video/mp4" />
        </video>
        <div className={styles.playOverlay}>
          <i className="fas fa-play"></i>
        </div>
        <div className={styles.videoInfo}>
          <h3 className={styles.videoTitle}>{video.name}</h3>
          <div className={styles.videoMeta}>
            <span className={styles.videoType}>MP4</span>
            <span className={styles.videoDuration}>
              <i className="fas fa-clock"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
