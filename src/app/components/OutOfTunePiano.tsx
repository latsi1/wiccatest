"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

const OutOfTunePiano = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [imageVisible, setImageVisible] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const keyMap = useMemo(() => ["a", "s", "d", "f", "g", "h", "j"], []);

  const unlockAudioContext = useCallback(() => {
    if (!audioContext) {
      const context = new AudioContext();
      setAudioContext(context);
      // Create a silent oscillator to unlock audio on iOS
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      gainNode.gain.setValueAtTime(0, context.currentTime);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.001);

      context.resume().then(() => {
        setIsAudioUnlocked(true);
      });
    }
  }, [audioContext]);

  const playRandomNoteOrChord = useCallback(() => {
    if (!audioContext || !isAudioUnlocked) {
      unlockAudioContext();
      return;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const chordFrequencies = [
      [261.63, 329.63],
      [349.23, 440.0],
      [392.0, 493.88],
      [261.63, 329.63, 392.0],
      [440.0, 493.88, 261.63],
    ];

    const randomChord =
      chordFrequencies[Math.floor(Math.random() * chordFrequencies.length)];

    randomChord.forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const detuneAmount = (Math.random() - 0.5) * 100;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detuneAmount;
      oscillator.type = "sine";

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.7
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.7);
    });

    setImageVisible(true);
    setTimeout(() => setImageVisible(false), 1000);
  }, [audioContext, isAudioUnlocked, unlockAudioContext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap.includes(key) && !e.repeat) {
        const index = keyMap.indexOf(key);
        playRandomNoteOrChord();

        const button = document.getElementById(`piano-key-${index}`);
        if (button) {
          button.classList.add("pressed");
          setTimeout(() => button.classList.remove("pressed"), 200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyMap, playRandomNoteOrChord]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div
        className={`fixed top-0 left-0 right-0 flex justify-center z-10 transition-opacity duration-300 ${
          imageVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: "none" }}
      >
        <div className="w-[600px] h-[400px] relative">
          <Image
            src="/kaluhiis.png"
            alt="Sliding Effect"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      <div className="flex flex-col items-center z-20">
        <h1 className="text-4xl font-bold mb-12 mt-6">🎹 HiisiPiano</h1>

        <div className="grid grid-cols-7 gap-2">
          {keyMap.map((key, index) => (
            <button
              id={`piano-key-${index}`}
              key={index}
              onClick={() => {
                if (!isAudioUnlocked) unlockAudioContext();
                playRandomNoteOrChord();
              }}
              className="w-16 h-24 bg-white text-black border border-black rounded-md shadow-md hover:bg-gray-200 active:bg-gray-300 transition-colors duration-100"
            >
              <span>🎵 {key.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutOfTunePiano;
