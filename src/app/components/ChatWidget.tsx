"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatWidget.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [, setKaleVideoState] = useState<
    "idle" | "waiting" | "responding" | "answering"
  >("idle");
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [isKaleResponsePlaying, setIsKaleResponsePlaying] = useState(false);
  const [currentKaleIndex, setCurrentKaleIndex] = useState(0);
  const callAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const kaleResponseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Initialize video element when it becomes available
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      console.log("Video element ready, setting source:", currentVideo);
      videoRef.current.src = `/${currentVideo}`;
      videoRef.current.volume = 0.8; // Set volume
      videoRef.current.muted = false; // Ensure not muted
      videoRef.current.load(); // Force reload
    }
  }, [currentVideo, isCalling]);

  useEffect(() => {
    return () => {
      stopRinging();
      stopCallAudio();
      clearWaitingTimer();
      clearKaleResponseTimer();
    };
  }, []);

  // Video management functions
  const playKaleVideo = (videoName: string) => {
    setCurrentVideo(videoName);

    // Check if this is a kale6-19 response video
    const isKaleResponse =
      videoName.startsWith("kale") &&
      videoName.match(/kale(1[0-9]|[6-9])\.mp4$/);

    if (videoRef.current) {
      videoRef.current.src = `/${videoName}`;
      videoRef.current.volume = 0.8; // Set volume
      videoRef.current.muted = false; // Ensure not muted
      videoRef.current.loop = videoName === "kaleafk.mp4"; // Only loop kaleafk.mp4

      // Add event listener for when video ends (only for kale6-19 and kaletassaufo)
      if (videoName !== "kaleafk.mp4" && videoName !== "kaletassa.mp4") {
        const handleVideoEnd = () => {
          playKaleVideo("kaleafk.mp4");
          setKaleVideoState("waiting");
          setIsKaleResponsePlaying(false);
          videoRef.current?.removeEventListener("ended", handleVideoEnd);
        };
        videoRef.current.addEventListener("ended", handleVideoEnd);
      }

      // Set kale response playing state
      if (isKaleResponse) {
        setIsKaleResponsePlaying(true);
      } else {
        setIsKaleResponsePlaying(false);
      }

      videoRef.current.play().catch((error) => {
        console.log(`Could not play video: ${videoName}`, error);
      });
    }
  };

  const getNextKaleResponse = () => {
    const kaleResponses = Array.from(
      { length: 14 },
      (_, i) => `kale${i + 6}.mp4`
    );
    const currentResponse = kaleResponses[currentKaleIndex];

    // Move to next kale video for next time
    setCurrentKaleIndex((prevIndex) => (prevIndex + 1) % kaleResponses.length);

    console.log(
      `Playing kale video ${currentKaleIndex + 6}: ${currentResponse}`
    );
    return currentResponse;
  };

  const isGreeting = (text: string) => {
    const greetings = [
      "hello",
      "hey",
      "hi",
      "moro",
      "terve",
      "hei",
      "wadaap",
      "moi",
      "greetings",
      "good morning",
      "good afternoon",
      "good evening",
      "morning",
      "afternoon",
      "evening",
      "sup",
      "yo",
      "howdy",
      "salut",
      "bonjour",
    ];
    const lowerText = text.toLowerCase().trim();
    console.log("Checking greeting for:", lowerText);
    const isGreetingResult = greetings.some((greeting) =>
      lowerText.includes(greeting)
    );
    console.log("Is greeting:", isGreetingResult);
    return isGreetingResult;
  };

  const clearWaitingTimer = () => {
    if (waitingTimerRef.current) {
      clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;
    }
  };

  const clearKaleResponseTimer = () => {
    if (kaleResponseTimerRef.current) {
      clearTimeout(kaleResponseTimerRef.current);
      kaleResponseTimerRef.current = null;
    }
  };

  const startWaitingForInput = () => {
    setKaleVideoState("waiting");
    // Keep playing kaleafk.mp4 as continuous placeholder
    playKaleVideo("kaleafk.mp4");
  };

  const startKaleResponse = () => {
    setKaleVideoState("responding");
    clearWaitingTimer();
    const nextResponse = getNextKaleResponse();
    playKaleVideo(nextResponse);
    // Video will automatically return to kaleafk.mp4 when it ends
  };

  const startKaleAnswering = () => {
    // Don't play kaletassaufo.mp4 if kale6-19 is currently playing
    if (isKaleResponsePlaying) {
      console.log("Kale response is playing, skipping kaletassaufo.mp4");
      return;
    }

    setKaleVideoState("answering");
    playKaleVideo("kaletassaufo.mp4");
    // Video will automatically return to kaleafk.mp4 when it ends
  };

  // Local fallback data and generator
  const corpus = {
    elements: [
      "tuli",
      "vesi",
      "maa",
      "ilma",
      "eetteri",
      "sade",
      "myrsky",
      "tuuli",
      "sumu",
      "usva",
      "kaste",
      "aalto",
      "virta",
      "kivi",
      "kallio",
      "kristalli",
      "hiekka",
      "savi",
      "metalli",
      "liekki",
      "kipinä",
      "hehku",
      "hiillos",
      "valo",
      "varjo",
    ],
    plants: [
      "tammi",
      "koivu",
      "paju",
      "kataja",
      "kuusi",
      "lehmus",
      "ruusu",
      "laventeli",
      "salvia",
      "rosmariini",
      "kamomilla",
      "nokkonen",
      "yrtti",
      "juurakko",
      "siemen",
      "verso",
      "kukinto",
      "terälehti",
      "viiniköynnös",
      "ruoho",
      "sammal",
      "sienet",
      "vilja",
    ],
    sky: [
      "kuu",
      "aurinko",
      "tähti",
      "planeetta",
      "galaksi",
      "aamu",
      "ilta",
      "keskiyö",
      "aamunsarastus",
      "hämärä",
      "pimeys",
      "kierto",
      "sykli",
      "täysikuu",
      "uusikuu",
      "puolikuu",
      "pimennys",
      "tähtipöly",
      "kuunsilta",
      "aurinkosäde",
      "varjojen tanssi",
    ],
    mystic: [
      "loitsu",
      "rukous",
      "mantra",
      "rituaali",
      "symboli",
      "amuletti",
      "talismaani",
      "sigil",
      "alttari",
      "sauva",
      "athame",
      "pyhä",
      "maaginen",
      "siunattu",
      "salattu",
      "ikuinen",
      "ennustus",
      "oraakkeli",
      "visio",
      "uni",
      "enne",
      "tarottikortti",
    ],
    animals: [
      "susi",
      "kissa",
      "korppi",
      "pöllö",
      "haukka",
      "käärme",
      "lohikäärme",
      "peura",
      "karhu",
      "hevonen",
      "perhonen",
      "mehiläinen",
      "hämähäkki",
      "sammakko",
      "kilpikonna",
    ],
    feelings: [
      "rakkaus",
      "rauha",
      "voima",
      "tasapaino",
      "harmonia",
      "viisaus",
      "hiljaisuus",
      "vapaus",
      "toivo",
      "ilo",
      "suru",
      "pyhyys",
      "kiitollisuus",
      "nöyryys",
      "yhteys",
      "muutos",
      "uudistuminen",
    ],
    verbs: [
      "kuiskaa",
      "laula",
      "virtaa",
      "sytytä",
      "varjosta",
      "suojaa",
      "avaa",
      "sulje",
      "kutsu",
      "vapauta",
      "siunaa",
      "paranna",
      "tanssi",
      "loista",
      "muutu",
      "johdata",
      "kanna",
      "nosta",
    ],
    combos: [
      "Kuunvalo kuiskaa salaisuuksia.",
      "Suden henki suojelee sinua.",
      "Laventelin tuoksu johdattaa uneen.",
      "Täysikuu valaisee polkusi.",
      "Kristalli säteilee voimaa ja rauhaa.",
    ],
  } as const;

  const pick = (arr: readonly string[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  function generateLocalAnswer(): string {
    const line1 = `${pick(corpus.sky)} ${pick(corpus.verbs)} ${pick(
      corpus.mystic
    )}.`;
    const line2 = `${pick(corpus.elements)}, ${pick(corpus.plants)} ja ${pick(
      corpus.animals
    )} luovat ${pick(corpus.feelings)}.`;
    const line3 = pick(corpus.combos);
    const tip = `Vinkki: ${pick(corpus.verbs)} ${pick(corpus.mystic)} ${pick(
      corpus.elements
    )}n kanssa.`;
    return [`Kale: ${line1}`, line2, line3, tip].join("\n");
  }

  function maybePasi(text: string): string {
    return Math.random() < 0.1 ? "Helevetin pässi" : text;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function startRinging(durationMs: number = 2500) {
    try {
      if (!audioCtxRef.current) {
        interface WindowWithWebkitAudio extends Window {
          webkitAudioContext?: typeof AudioContext;
        }
        const maybeWindow = window as WindowWithWebkitAudio;
        const Ctor = window.AudioContext || maybeWindow.webkitAudioContext;
        if (Ctor) {
          audioCtxRef.current = new Ctor();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) {
        return;
      }
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      const makeBeep = (startTime: number, freq: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      };
      const startAt = ctx.currentTime;
      makeBeep(startAt + 0.0, 440);
      makeBeep(startAt + 0.4, 660);
      // repeat pattern every 1.2s until duration
      const interval = window.setInterval(() => {
        const now = ctx.currentTime;
        makeBeep(now + 0.0, 440);
        makeBeep(now + 0.4, 660);
      }, 1200);
      ringIntervalRef.current = interval as unknown as number;
      window.setTimeout(() => {
        stopRinging();
      }, durationMs);
    } catch {
      // ignore
    }
  }

  function stopRinging() {
    if (ringIntervalRef.current) {
      window.clearInterval(ringIntervalRef.current as unknown as number);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function startCallAudio() {
    if (!callAudioRef.current) {
      callAudioRef.current = new Audio("/kale.mp4");
    }
    callAudioRef.current.currentTime = 0;
    callAudioRef.current.play().catch(() => {});
  }

  function stopCallAudio() {
    if (callAudioRef.current) {
      try {
        callAudioRef.current.pause();
      } catch {}
      callAudioRef.current.currentTime = 0;
    }
  }

  const startCall = () => {
    if (isCalling) return;
    setIsCalling(true);
    setHasAnswered(true); // Immediately show as answered
    setKaleVideoState("idle");
    console.log("Starting call, playing kaletassa.mp4");
    playKaleVideo("kaletassa.mp4"); // Play kaletassa.mp4 when connected

    // After kaletassa.mp4, start the normal waiting loop
    // Use a longer timeout to ensure kaletassa.mp4 plays completely
    setTimeout(() => {
      startWaitingForInput();
    }, 5000); // Give kaletassa.mp4 time to play completely
  };

  const endCall = () => {
    stopRinging();
    stopCallAudio();
    clearWaitingTimer();
    clearKaleResponseTimer();
    setIsCalling(false);
    setHasAnswered(false);
    setKaleVideoState("idle");
    setCurrentVideo("");
    setIsKaleResponsePlaying(false);
    setCurrentKaleIndex(0); // Reset kale video sequence
    // Stop video when call ends
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message to chat
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");

    // If in call mode, only show video responses, no text
    if (isCalling && hasAnswered) {
      console.log("In call mode, checking greeting for:", text);
      // Check if it's a greeting
      if (isGreeting(text)) {
        console.log("Detected greeting, playing kaletassaufo.mp4");
        startKaleAnswering(); // Play kaletassaufo.mp4 for greetings
      } else {
        console.log("Not a greeting, playing random kale response");
        startKaleResponse(); // Play random kale6-19 for other messages
      }
      return; // Don't send API request or show text responses
    }

    // Normal text chat mode
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        const local = maybePasi(generateLocalAnswer());
        const delay = 600 + Math.floor(Math.random() * 1200);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: local },
          ]);
          setLoading(false);
        }, delay);
        return;
      }
      const answer: string = data.answer ?? "";
      const delay = 600 + Math.floor(Math.random() * 1200);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: maybePasi(answer || generateLocalAnswer()),
          },
        ]);
        setLoading(false);
      }, delay);
    } catch {
      const local = maybePasi(generateLocalAnswer());
      const delay = 600 + Math.floor(Math.random() * 1200);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: local }]);
        setLoading(false);
      }, delay);
    } finally {
      // delay handlers clear loading
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.botName}>Kale</span>
              <span className={styles.status}>
                <span className={styles.dot} /> ONLINE
              </span>
              <button
                className={styles.callMini}
                onClick={isCalling ? endCall : startCall}
                title={isCalling ? "Lopeta puhelu" : "Soita Kale"}
              >
                {isCalling ? "Lopeta" : "Soita"}
              </button>
            </div>
            <button className={styles.close} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          {/* Separate Video Window */}
          {isCalling && hasAnswered && (
            <div className={styles.videoWindow}>
              <video
                ref={videoRef}
                className={styles.callVideo}
                autoPlay
                loop={currentVideo === "kaleafk.mp4"}
                playsInline
              >
                <source src={`/${currentVideo}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          <div className={styles.messages} ref={listRef}>
            {messages.length === 0 && !isCalling && (
              <div className={styles.hint}>
                Kysy Wicca-aiheisia kysymyksiä. Esim: &quot;Mitä on esbat?&quot;
              </div>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  m.role === "user" ? styles.user : styles.assistant
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && !isCalling && (
              <div className={styles.typing}>Kale is writing...</div>
            )}
          </div>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Kirjoita viesti…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.send}
              onClick={sendMessage}
              disabled={loading}
            >
              Lähetä
            </button>
          </div>
        </div>
      )}
      <button
        className={styles.fab}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open Wicca Chat"
      >
        <span className={styles.fabTop}>
          <span className={styles.fabIcon}>💬</span>
          <span className={styles.fabLabel}>KYSY WICCA TIETÄJÄLTÄ</span>
        </span>
        <span className={styles.fabStatus}>
          <span className={styles.dot} />
          <span className={styles.fabName}>Kale</span>
          <span className={styles.statusText}>online</span>
        </span>
        <span className={styles.fabStatus}>
          <span className={styles.dotRed} />
          <span className={styles.fabName}>Tarja2</span>
          <span className={styles.statusText}>offline</span>
        </span>
      </button>
    </div>
  );
}
