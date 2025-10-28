"use client";

import React, { useEffect, useRef } from "react";
import styles from "./VideoPlayerModal.module.css";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoPlayerModalProps {
  video: VideoFile;
  onClose: () => void;
}

export default function VideoPlayerModal({
  video,
  onClose,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load saved volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("wiccatube-volume");
    if (savedVolume && videoRef.current) {
      const volume = parseFloat(savedVolume);
      videoRef.current.volume = volume;
    }
  }, []);

  // Save volume to localStorage when it changes
  const handleVolumeChange = () => {
    if (videoRef.current) {
      localStorage.setItem(
        "wiccatube-volume",
        videoRef.current.volume.toString()
      );
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <button className={styles.closeButton} onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={styles.videoPlayer}
            controls
            autoPlay
            preload="metadata"
            controlsList="nodownload"
            onVolumeChange={handleVolumeChange}
          >
            <source src={video.path} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className={styles.videoInfo}>
          <h2 className={styles.videoTitle}>{video.name}</h2>
          <div className={styles.videoMeta}>
            <span className={styles.videoFormat}>MP4 Video</span>
            <span className={styles.videoSource}>Wicca Collection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
