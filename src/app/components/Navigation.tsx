"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";
import { useLanguage } from "../context/LanguageContext";

export default function Navigation() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const translations = {
    home: language === "finnish" ? "Koti" : "Home",
    spells: language === "finnish" ? "Loitsut" : "Spells",
    community: language === "finnish" ? "Wiccers" : "Wiccers",
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.leftSection}>
        <div className={styles.languageSwitch}>
          <button
            className={`${styles.langButton} ${
              language === "finnish" ? styles.active : ""
            }`}
            onClick={() => setLanguage("finnish")}
          >
            FI
          </button>
          <button
            className={`${styles.langButton} ${
              language === "english" ? styles.active : ""
            }`}
            onClick={() => setLanguage("english")}
          >
            EN
          </button>
        </div>
      </div>

      <div className={styles.logo}>
        <Link href="/">Wiccoset</Link>
      </div>

      <ul className={styles.navLinks}>
        <li>
          <Link href="/" className={pathname === "/" ? styles.active : ""}>
            {translations.home}
          </Link>
        </li>
        <li>
          <Link
            href="/wicca"
            className={pathname === "/wicca" ? styles.active : ""}
          >
            {translations.spells}
          </Link>
        </li>
        <li>
          <Link
            href="/twitter"
            className={pathname === "/twitter" ? styles.active : ""}
          >
            {translations.community}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
