"use client";

import React, { useState } from "react";
import LoadingText from "../components/LoadingText";
import styles from "./wicca.module.css";
import { useLanguage } from "../context/LanguageContext";

export default function WiccaPage() {
  const [desire, setDesire] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!desire.trim()) {
      setError(
        language === "finnish"
          ? "Kirjoita toiveesi"
          : "Please enter your desire"
      );
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

      // Clean up the poem text to remove conversation markers
      let cleanedPoem = data.spell;
      if (cleanedPoem) {
        // Remove common model formatting markers and anything after them
        cleanedPoem = cleanedPoem.replace(/User:[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/Assistant:[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/<\|im_start\|>user[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/<\|im_end\|>[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/\buser[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/\bassistant[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/\bhuman[\s\S]*$/i, "");
        cleanedPoem = cleanedPoem.replace(/\bai[\s\S]*$/i, "");

        // Remove any trailing whitespace, dashes, or other common separators
        cleanedPoem = cleanedPoem.replace(/[\s\-_]+$/g, "");
        cleanedPoem = cleanedPoem.trim();
      }

      setPoem(cleanedPoem);
    } catch (error) {
      console.error("Error generating spell:", error);
      setError(
        error instanceof Error
          ? error.message
          : language === "finnish"
          ? "Loitsun luominen epäonnistui"
          : "Failed to generate spell"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === "finnish"
            ? "Wicca Loitsugeneraattori"
            : "Wicca Spell Generator"}
        </h1>
        <p className={styles.subtitle}>
          {language === "finnish"
            ? "Kirjoita toiveesi ja vastaanota mystinen loitsu"
            : "Write your desire and receive a mystical spell"}
        </p>
      </header>

      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="desire" className={styles.label}>
              {language === "finnish" ? "Toiveesi" : "Your Desire"}
            </label>
            <textarea
              id="desire"
              value={desire}
              onChange={(e) => setDesire(e.target.value)}
              className={styles.textarea}
              placeholder={
                language === "finnish"
                  ? "Kirjoita toiveesi tähän..."
                  : "Write your desire here..."
              }
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading
              ? language === "finnish"
                ? "Luodaan loitsua..."
                : "Creating spell..."
              : language === "finnish"
              ? "Luo loitsu"
              : "Create spell"}
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
