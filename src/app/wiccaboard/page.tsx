"use client";

import React, { useState, useEffect } from "react";
import styles from "./wiccaboard.module.css";
import VideoPreview from "../../components/VideoPreview";
import VideoPlayerModal from "../../components/VideoPlayerModal";

interface VideoFile {
  name: string;
  path: string;
}

export default function WiccaTube() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate list of video files from the wicca folder
    const videoFiles: VideoFile[] = [
      "145489068.mp4",
      "147123684.mp4",
      "218287151.mp4",
      "219835582.mp4",
      "23032918272-offset-29302.mp4",
      "23044817392-offset-18134.mp4",
      "23069919824-offset-8034.mp4",
      "23669755088-offset-27744.mp4",
      "23703545024-offset-22890.mp4",
      "23809227872-offset-15752.mp4",
      "23857827200-offset-24346.mp4",
      "23914380688-offset-5320-18.mp4",
      "23922345360-offset-5902.mp4",
      "23930376304-offset-9496.mp4",
      "24050498176-offset-3172.mp4",
      "24050498176-offset-6822.mp4",
      "24083964832-offset-5248.mp4",
      "24190948704-offset-12032.mp4",
      "24200157424-offset-19174.mp4",
      "24757740528-offset-1905-10.mp4",
      "26262557232-offset-10424.916666666666-33.24999999999999.mp4",
      "26262557232-offset-4900.25-5.mp4",
      "26262557232-offset-6254.mp4",
      "26948286736-offset-17514.mp4",
      "27139429696-offset-18380.mp4",
      "27539048496-offset-4318.mp4",
      "49ceba42-b640-4b7a-ab7b-cbc7617f9fce.mp4",
      "ammukyträt.mp4",
      "ammun troppii.mp4",
      "assal.mp4",
      "AT-cm 287410161.mp4",
      "AT-cm 368703397.mp4",
      "AT-cm 447144564.mp4",
      "AT-cm 517039350.mp4",
      "AT-cm 518459486.mp4",
      "AT-cm 525654485.mp4",
      "dadda.mp4",
      "ddd.mp4",
      "ee (online-video-cutter.com).mp4",
      "evripadii.mp4",
      "fibbi.mp4",
      "haahaha.mp4",
      "heikki.mp4",
      "huutopihina.mp4",
      "isojahommiavorhala.mp4",
      "jheikkijauho.mp4",
      "kamakeidt.mp4",
      "kato eu spray.mp4",
      "körhöm.mp4",
      "loistavaatyöpäivääjuhon.mp4",
      "lololoiii.mp4",
      "prefirellä.mp4",
      "radio vorhala.mp4",
      "rake.mp4",
      "tällästä.mp4",
      "Untitled.mp4",
      "vittu tota aimbottia.mp4",
      "vitu hyvää' rpeetä'.mp4",
      "vorhalapaska.mp4",
      "vorhol.mp4",
      "weeee.mp4",
      "welcome to the fuckin gib balls.mp4",
      "xdddddd.mp4",
    ].map((filename) => ({
      name: filename.replace(".mp4", ""),
      path: `/wicca/${filename}`,
    }));

    setVideos(videoFiles);
    setIsLoading(false);
  }, []);

  const handleVideoClick = (video: VideoFile) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading WiccaTube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fas fa-video"></i> WiccaTube
        </h1>
        <p className={styles.subtitle}>Magical video collection</p>
      </div>

      <div className={styles.videoGrid}>
        {videos.map((video, index) => (
          <VideoPreview
            key={index}
            video={video}
            onClick={() => handleVideoClick(video)}
          />
        ))}
      </div>

      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={handleCloseModal} />
      )}
    </div>
  );
}
