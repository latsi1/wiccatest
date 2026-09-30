"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import styles from "./Navigation.module.css";
export default function Navigation() {
    const pathname = usePathname();
    const { language, setLanguage } = useLanguage();
    const fi = language === "finnish";
    const [open, setOpen] = useState(false);
    const links = [{ href: "/", label: fi ? "Etusivu" : "Home" }, { href: "/wicca", label: fi ? "Loitsut" : "Spells" }, { href: "/wiccer", label: "Wiccers" }, { href: "/soundboard", label: "Soundboard" }, { href: "/wiccafacts", label: fi ? "Wicca-faktat" : "Wicca facts" }, { href: "/lazzegenerator", label: "LaZZeGenerator" }, { href: "/wiccaboard", label: "WiccaTube" }];
    return <header className={styles.header}><nav className={styles.navigation} aria-label={fi ? "Päänavigaatio" : "Main navigation"}><Link href="/" className={styles.logo} onClick={() => setOpen(false)}><span aria-hidden="true">☾</span> Wiccoset<span className={styles.logoDot}>.</span></Link><button className={styles.menuButton} type="button" aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? (fi ? "Sulje ×" : "Close ×") : (fi ? "Valikko ☰" : "Menu ☰")}</button><ul id="site-navigation" className={`${styles.navLinks} ${open ? styles.open : ""}`}>{links.map(l => <li key={l.href}><Link href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={pathname === l.href ? styles.active : ""} onClick={() => setOpen(false)}>{l.label}</Link></li>)}</ul><div className={styles.languageSwitch} aria-label={fi ? "Kieli" : "Language"}>{(["finnish", "english"] as const).map(l => <button key={l} type="button" aria-pressed={language === l} className={language === l ? styles.selected : ""} onClick={() => setLanguage(l)}>{l === "finnish" ? "FI" : "EN"}</button>)}</div></nav></header>;
}
