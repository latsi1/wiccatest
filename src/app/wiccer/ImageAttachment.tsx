"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./wiccer.module.css";

export function useImageAttachment() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [alt, setAlt] = useState("");
    const [error, setError] = useState("");
    const cached = useRef<{ memberId: string; imageId: string } | null>(null);
    useEffect(() => {
        if (!file) { setPreview(""); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const clear = useCallback(() => { setFile(null); setAlt(""); setError(""); cached.current = null; }, []);
    const choose = (selected?: File) => {
        if (!selected) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 4 * 1024 * 1024) {
            setError("Choose a JPEG, PNG, or WebP image up to 4 MB."); return;
        }
        clear(); setFile(selected);
    };
    const upload = async (memberId: string) => {
        if (!file) return undefined;
        if (cached.current?.memberId === memberId) return cached.current.imageId;
        const response = await fetch("/api/wiccers/upload", { method: "POST", headers: { "Content-Type": file.type }, body: file });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Image upload failed. Please try again.");
        cached.current = { memberId, imageId: data.imageId };
        return data.imageId as string;
    };
    return { file, preview, alt, setAlt, error, choose, clear, upload };
}

export function ImageAttachment({ attachment, disabled, fi }: { attachment: ReturnType<typeof useImageAttachment>; disabled: boolean; fi: boolean }) {
    const input = useRef<HTMLInputElement>(null);
    return <section className={styles.attachment} aria-label={fi ? "Kuvan liittäminen" : "Image attachment"}>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className={styles.srOnly} tabIndex={-1} aria-label={fi ? "Valitse kuva" : "Choose image"} disabled={disabled} onChange={event => { attachment.choose(event.target.files?.[0]); event.target.value = ""; }} />
        <button type="button" className={styles.attachButton} disabled={disabled} onClick={() => input.current?.click()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 5 5 3-3 4 4"/></svg>{attachment.file ? (fi ? "Vaihda kuva" : "Change image") : (fi ? "Lisää kuva" : "Add image")}<small>4 MB</small></button>
        {attachment.error && <p role="alert" className={styles.error}>{attachment.error}</p>}
        <AnimatePresence>{attachment.preview && <motion.div className={styles.attachmentPreview} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className={styles.previewFrame}><Image src={attachment.preview} alt={attachment.alt || (fi ? "Valitun kuvan esikatselu" : "Selected image preview")} width={800} height={600} unoptimized/><button type="button" disabled={disabled} onClick={attachment.clear} aria-label={fi ? "Poista kuva" : "Remove image"}>×</button></div>
            <label>{fi ? "Kuvan kuvaus (valinnainen)" : "Image description (optional)"}<input value={attachment.alt} maxLength={250} disabled={disabled} onChange={event => attachment.setAlt(event.target.value)} placeholder={fi ? "Kuvaile kuvaa ruudunlukijalle…" : "Describe the image for screen readers…"}/></label>
        </motion.div>}</AnimatePresence>
    </section>;
}
