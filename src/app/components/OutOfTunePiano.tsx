"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

const OutOfTunePiano = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [imageVisible, setImageVisible] = useState(false); // Track visibility of the image

  // Keys corresponding to piano buttons - wrapped in useMemo to prevent recreating on every render
  const keyMap = useMemo(() => ["a", "s", "d", "f", "g", "h", "j"], []);

  // Wrapped in useCallback to prevent recreating on every render
  const playRandomNoteOrChord = useCallback(() => {
    const context = audioContext || new AudioContext();
    if (!audioContext) setAudioContext(context);

    const chordFrequencies = [
      // Out-of-tune chords (two notes at once)
      [261.63, 329.63], // C4 and E4
      [349.23, 440.0], // F4 and A4
      [392.0, 493.88], // G4 and B4
      // Three notes out of tune
      [261.63, 329.63, 392.0], // C4, E4, G4
      [440.0, 493.88, 261.63], // A4, B4, C4
    ];

    const randomChord =
      chordFrequencies[Math.floor(Math.random() * chordFrequencies.length)];

    // Play the chord
    randomChord.forEach((frequency) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const detuneAmount = (Math.random() - 0.5) * 50; // Randomly detune by ±50 cents
      oscillator.frequency.value = frequency + detuneAmount;
      oscillator.type = "sine";
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      gainNode.gain.setValueAtTime(0.5, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.5
      );
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    });

    // Trigger the image visibility and fade away after 1 second
    setImageVisible(true);
    // After 1 second, hide the image
    setTimeout(() => {
      setImageVisible(false);
    }, 1000); // Image will disappear after 1 second
  }, [audioContext]); // Only recreate when audioContext changes

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const index = keyMap.indexOf(key);
      if (index !== -1) {
        playRandomNoteOrChord();
        // Add visual feedback for the pressed key
        const button = document.getElementById(`piano-key-${index}`);
        if (button) {
          button.classList.add("bg-gray-300");
          setTimeout(() => {
            button.classList.remove("bg-gray-300");
          }, 200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyMap, playRandomNoteOrChord]); // Dependencies are now stable

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {/* Image with fixed size */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-center z-10"
        style={{
          opacity: imageVisible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          pointerEvents: "none", // Prevents the image from intercepting clicks
        }}
      >
        <div className="w-[600px] h-[400px]">
          <Image
            src="/kaluhiis.png" // Change this to the actual image in your /public folder
            alt="Sliding Effect"
            width={600}
            height={400}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Fixed content that won't move */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-12 mt-6">🎹 HiisiPiano</h1>

        <br></br>
        <br></br>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, index) => (
            <button
              id={`piano-key-${index}`}
              key={index}
              onClick={playRandomNoteOrChord}
              className="w-16 h-24 bg-white border border-black rounded-md shadow-md active:bg-gray-300"
            >
              <span className="text-black">🎵 {keyMap[index]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutOfTunePiano;
