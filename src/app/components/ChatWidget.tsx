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
  const callAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      stopRinging();
      stopCallAudio();
    };
  }, []);

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
    setHasAnswered(false);
    startRinging(3000);
    window.setTimeout(() => {
      setHasAnswered(true);
      startCallAudio();
    }, 3000);
  };

  const endCall = () => {
    stopRinging();
    stopCallAudio();
    setIsCalling(false);
    setHasAnswered(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
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
            content: maybePasi(answer || generateLocalAnswer(text)),
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
          <div className={styles.messages} ref={listRef}>
            {messages.length === 0 && (
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
            {loading && <div className={styles.typing}>Kale is writing...</div>}
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
      {isCalling && (
        <div className={styles.callOverlay}>
          <div className={styles.callCard}>
            <div className={styles.callHeader}>
              <span className={styles.callName}>Kale</span>
              <span className={styles.status}>
                <span className={styles.dot} />{" "}
                {hasAnswered ? "CONNECTED" : "RINGING"}
              </span>
            </div>
            <div className={styles.callBody}>
              {hasAnswered ? (
                <img src="/kheil.png" alt="Kale" className={styles.callImage} />
              ) : (
                <div className={styles.ringingText}>Toot… Toot…</div>
              )}
            </div>
            <div className={styles.callActions}>
              <button className={styles.hang} onClick={endCall}>
                Lopeta
              </button>
            </div>
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
