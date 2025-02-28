"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./soundboard.module.css";

interface Sound {
  name: string;
  displayName: string;
  file: string;
  filePath: string;
  category: string;
  icon: string;
}

interface WebAudioAPI extends Window {
  webkitAudioContext: typeof AudioContext;
}

const SOUNDS_PER_PAGE = 42;

export default function Soundboard() {
  const [soundsData, setSoundsData] = useState<Sound[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [volume, setVolume] = useState(70);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visitorCount, setVisitorCount] = useState(10435);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [lastPlayedSound, setLastPlayedSound] = useState<string | null>(null);
  const [activeSoundButton, setActiveSoundButton] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const storedCount = localStorage.getItem("visitorCount");
    if (storedCount) {
      setVisitorCount(parseInt(storedCount, 10));
    } else {
      const newCount = visitorCount + 1;
      setVisitorCount(newCount);
      localStorage.setItem("visitorCount", newCount.toString());
    }
  }, []);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await fetch("/api/sounds");
        if (!response.ok) {
          throw new Error("Failed to fetch sounds");
        }
        const data = await response.json();
        setSoundsData(data.sounds);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sounds");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSounds();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeVideoModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as WebAudioAPI).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume / 100;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  };

  const playSound = (soundFile: string, soundId: string, soundName: string) => {
    if (soundFile.toLowerCase().endsWith(".mp4")) {
      openVideoModal(soundFile, soundName);
      return;
    }

    initAudioContext();

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(soundFile);
    setCurrentAudio(audio);
    setLastPlayedSound(soundFile);
    setActiveSoundButton(soundId);

    if (audioContextRef.current && gainNodeRef.current) {
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(gainNodeRef.current);
    }

    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
      alert(
        "Error playing sound. Make sure the sound file exists in the 'sounds' folder."
      );
    });

    audio.onended = () => {
      setCurrentAudio(null);
      setActiveSoundButton(null);
    };
  };

  const openVideoModal = (videoUrl: string, videoTitle: string) => {
    setCurrentVideo({ url: videoUrl, title: videoTitle });
    setIsVideoModalOpen(true);
    if (currentAudio) {
      stopSound();
    }
  };

  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
  };

  const stopSound = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setActiveSoundButton(null);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume / 100;
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const filteredSounds = soundsData.filter((sound) => {
    const matchesCategory = category === "all" || sound.category === category;
    const matchesSearch =
      !searchTerm ||
      sound.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSounds.length / SOUNDS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentSounds = filteredSounds.slice(
    (currentPage - 1) * SOUNDS_PER_PAGE,
    currentPage * SOUNDS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading sounds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Wicca Magical Soundboard</h1>
        <p>Click on a sound to play it!</p>
        <div className={styles.visitorCounter}>Visitors: {visitorCount}</div>
      </header>

      <div className={styles.controls}>
        <div className={styles.playbackControls}>
          <button className={styles.controlBtn} onClick={stopSound}>
            <i className="fas fa-stop"></i>
          </button>
          <button
            className={styles.controlBtn}
            onClick={() =>
              lastPlayedSound &&
              playSound(lastPlayedSound, activeSoundButton || "", "Last played")
            }
          >
            <i className="fas fa-play"></i>
          </button>
        </div>

        <div className={styles.volumeControl}>
          <span className={styles.volumePercentage}>{volume}%</span>
          <i className="fas fa-volume-up"></i>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
          />
        </div>

        <select
          className={styles.categorySelector}
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All Sounds ({soundsData.length})</option>
          <option value="wav">
            WAV Files ({soundsData.filter((s) => s.category === "wav").length})
          </option>
          <option value="mp3">
            MP3 Files ({soundsData.filter((s) => s.category === "mp3").length})
          </option>
          <option value="mp4">
            MP4 Files ({soundsData.filter((s) => s.category === "mp4").length})
          </option>
        </select>
      </div>

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search sounds..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.soundboard}>
          {currentSounds.map((sound) => (
            <button
              key={sound.file}
              className={`${styles.soundButton} ${
                activeSoundButton === sound.file ? styles.playing : ""
              }`}
              onClick={() => playSound(sound.filePath, sound.file, sound.name)}
              title={sound.name}
            >
              <i className={`fas ${sound.icon}`}></i>
              <span>{sound.displayName}</span>
            </button>
          ))}
        </div>

        {filteredSounds.length > 0 ? (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>No sounds found matching your criteria</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2025 yuccaducca</p>
      </footer>

      {isVideoModalOpen && currentVideo && (
        <div className={styles.modalOverlay} onClick={closeVideoModal}>
          <div
            className={styles.videoModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{currentVideo.title}</h3>
              <button className={styles.closeModal} onClick={closeVideoModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.videoContainer}>
              <video ref={videoRef} src={currentVideo.url} controls autoPlay />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
