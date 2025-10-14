"use client";

import React, { useEffect, useState } from "react";
import styles from "../page.module.css";

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const Z_PARTS = [
  "Fazze",
  "Lazze",
  "Zoppe",
  "Wazze",
  "Snippe",
  "Gozze",
  "Bappe",
  "Tappe",
  "Kazze",
  "Rappe",
  "Bozzo",
  "Welju",
  "Turengin",
  "Syyhysääri",
];

const etunimiPaatteet = ["zo", "mo", "mi", "ko", "zi", "no"];
const sukunimiPaatteet = ["kari", "nari", "tari", "kko", "kuri", "rari"];
const sukunimiLoppuosat = [
  "nen",
  "riini",
  "rinki",
  "vinen",
  "tonen",
  "läinen",
  "pönen",
  "salo",
];

function etunimiVaannos(etunimi: string): string {
  const juuri =
    etunimi.slice(0, 2).charAt(0).toUpperCase() +
    etunimi.slice(1, 2).toLowerCase();
  const paate = getRandom(etunimiPaatteet);
  return juuri + paate;
}

function sukunimiVaannos(sukunimi: string): string {
  const juuri =
    sukunimi.slice(0, 2).charAt(0).toUpperCase() +
    sukunimi.slice(1, 2).toLowerCase();
  const paate = getRandom(sukunimiPaatteet);
  return juuri + paate;
}

function sukunimiFeikki(sukunimi: string): string {
  const juuri =
    sukunimi.slice(0, 3).charAt(0).toUpperCase() +
    sukunimi.slice(1, 3).toLowerCase();
  const loppu = getRandom(sukunimiLoppuosat);
  return juuri + loppu;
}

function generateZName(etunimi: string, sukunimi: string): string {
  const z1 = getRandom(Z_PARTS);
  let z2 = getRandom(Z_PARTS);
  while (z2 === z1) {
    z2 = getRandom(Z_PARTS);
  }

  const etuosa = etunimiVaannos(etunimi);
  const vali = sukunimiVaannos(sukunimi);
  const loppu = sukunimiFeikki(sukunimi);

  return `${z1} ${z2} ${etuosa} ${vali} ${loppu}`;
}

export default function LaZZeGeneratorPage() {
  const [etunimi, setEtunimi] = useState("");
  const [sukunimi, setSukunimi] = useState("");
  const [zName, setZName] = useState<string | null>(null);
  const [counter, setCounter] = useState(420);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch("/api/lazzegenerator/likes", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setCounter(data.count);
          }
        }
      } catch (e) {
        // swallow
      }
    };
    fetchLikes();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (etunimi && sukunimi) {
      setZName(generateZName(etunimi, sukunimi));
    }
  };

  const handleThumb = async () => {
    if (isLiking) return;
    setIsLiking(true);
    // optimistic UI
    setCounter((c) => c + 1);
    try {
      const res = await fetch("/api/lazzegenerator/likes", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          setCounter(data.count);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <main className={styles.main}>
      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ color: "#ff0", textShadow: "0 0 10px #ff0" }}>
          LaZZeGenerator
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Etunimi / First name"
            value={etunimi}
            onChange={(e) => setEtunimi(e.target.value)}
            style={{
              padding: "16px 20px",
              marginRight: 0,
              borderRadius: 8,
              border: "1px solid #333",
              fontSize: "1.1rem",
              width: "100%",
              maxWidth: 300,
              marginBottom: 0,
              background: "#181818",
              color: "#00ff00",
              boxShadow: "0 2px 8px rgba(0,255,0,0.08)",
            }}
            required
          />
          <input
            type="text"
            placeholder="Sukunimi / Last name"
            value={sukunimi}
            onChange={(e) => setSukunimi(e.target.value)}
            style={{
              padding: "16px 20px",
              marginRight: 0,
              borderRadius: 8,
              border: "1px solid #333",
              fontSize: "1.1rem",
              width: "100%",
              maxWidth: 300,
              marginBottom: 0,
              background: "#181818",
              color: "#00ff00",
              boxShadow: "0 2px 8px rgba(0,255,0,0.08)",
            }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "16px 32px",
              borderRadius: 8,
              background: "#00ff00",
              color: "#000",
              fontWeight: "bold",
              border: "none",
              fontSize: "1.1rem",
              marginTop: 8,
              boxShadow: "0 2px 8px rgba(0,255,0,0.15)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            Generoi / Generate
          </button>
        </form>
        {zName && (
          <div
            style={{
              fontSize: "1.5rem",
              color: "#0ff",
              background: "#111",
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 0 10px #0ff",
              marginBottom: 32,
            }}
          >
            <span style={{ fontWeight: "bold" }}>{zName}</span>
          </div>
        )}
        <div style={{ margin: "32px 0 0 0", textAlign: "center" }}>
          <div
            style={{
              color: "#fff",
              fontSize: "1.1rem",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            if you like this generator hit thumbs up!
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <button
              aria-label="Thumbs up"
              onClick={handleThumb}
              disabled={isLiking}
              style={{
                background: "#222",
                border: "none",
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: "#00ff00",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,255,0,0.10)",
                transition: "background 0.2s",
              }}
            >
              👍
            </button>
            <span
              style={{
                fontSize: 24,
                color: "#ff0",
                fontWeight: 700,
                minWidth: 40,
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {counter}
            </span>
            <button
              aria-label="Thumbs down"
              onClick={handleThumb}
              disabled={isLiking}
              style={{
                background: "#222",
                border: "none",
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: "#ff4444",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(255,0,0,0.10)",
                transition: "background 0.2s",
              }}
            >
              👎
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
