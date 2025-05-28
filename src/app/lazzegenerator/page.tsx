"use client";

import React, { useState } from "react";
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
  let z1 = getRandom(Z_PARTS);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (etunimi && sukunimi) {
      setZName(generateZName(etunimi, sukunimi));
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
            }}
          >
            <span style={{ fontWeight: "bold" }}>{zName}</span>
          </div>
        )}
      </div>
    </main>
  );
}
