"use client";
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
type Language = "finnish" | "english";
const LanguageContext = createContext<{
    language: Language;
    setLanguage: (language: Language) => void;
} | undefined>(undefined);
export function LanguageProvider({ children }: {
    children: ReactNode;
}) {
    const [language, setLanguage] = useState<Language>("finnish");
    useEffect(() => { try {
        const saved = localStorage.getItem("language");
        if (saved === "finnish" || saved === "english")
            setLanguage(saved);
    }
    catch { /* Preferences are optional when storage is unavailable. */ } }, []);
    useEffect(() => { document.documentElement.lang = language === "finnish" ? "fi" : "en"; }, [language]);
    const changeLanguage = (value: Language) => { setLanguage(value); try {
        localStorage.setItem("language", value);
    }
    catch { /* The current session still supports switching. */ } };
    return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const context = useContext(LanguageContext); if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider"); return context; }
