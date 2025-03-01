"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import LoadingText from "../components/LoadingText";
import styles from "./wicca.module.css";

export default function WiccaPage() {
  const [desire, setDesire] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);

  const generatePoem = async () => {
    if (!desire.trim()) {
      setError("Please enter a desire");
      return;
    }

    setIsLoading(true);
    setError("");
    setPoem("");

    try {
      const response = await fetch("/api/wicca-poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ desire }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPoem(data.poem);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate poem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!desire.trim()) {
      setError("Please enter your desire");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/wicca-poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          desire: desire,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("Raw response data:", data);
      console.log("Poem content:", data.spell);

      setPoem(data.spell);
    } catch (error) {
      console.error("Error generating spell:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate spell"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wicca Loitsugeneraattori</h1>
        <p className={styles.subtitle}>
          Kirjoita toiveesi ja vastaanota mystinen loitsu
        </p>
      </header>

      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="desire" className={styles.label}>
              Toiveesi
            </label>
            <textarea
              id="desire"
              value={desire}
              onChange={(e) => setDesire(e.target.value)}
              className={styles.textarea}
              placeholder="Kirjoita toiveesi tähän..."
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Luodaan loitsua..." : "Luo loitsu"}
          </button>
        </form>
      </div>

      {(isLoading || error || poem) && (
        <div className={styles.poemContainer}>
          {isLoading ? (
            <div className={styles.spinnerContainer}>
              <LoadingText />
            </div>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <div className={styles.poem}>{poem}</div>
          )}
        </div>
      )}
    </div>
  );
}
