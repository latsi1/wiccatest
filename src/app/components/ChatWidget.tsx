"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatWidget.module.css";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import type { ChatMessage, RecipeCard } from "@/lib/chat-types";

function RecipePreview({ recipe }: { recipe: RecipeCard }) {
  const [broken, setBroken] = useState(false);
  return <a className={styles.recipeCard} href={recipe.url} target="_blank" rel="noopener noreferrer">
    {recipe.image && !broken ? <Image src={recipe.image} width={236} height={236} alt={recipe.title} unoptimized onError={() => setBroken(true)} referrerPolicy="no-referrer"/> : <span className={styles.recipePlaceholder} aria-hidden="true">👩‍🍳</span>}
    <span><strong>{recipe.title}</strong><small>tarja2 · Kotikokki.net</small><span>Avaa alkuperäinen resepti ↗</span></span>
  </a>;
}


export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [, setKaleVideoState] = useState<
    "idle" | "waiting" | "responding" | "answering"
  >("idle");
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [isKaleResponsePlaying, setIsKaleResponsePlaying] = useState(false);
  const [currentKaleIndex, setCurrentKaleIndex] = useState(0);
  const [isRecipeBot, setIsRecipeBot] = useState(false);
  const [showBotSelection, setShowBotSelection] = useState(false);
  const callAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const kaleResponseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const open = () => { setIsOpen(true); setShowBotSelection(true); };
    window.addEventListener("wiccoset:open-chat", open);
    return () => window.removeEventListener("wiccoset:open-chat", open);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    if (!showBotSelection && !loading) inputRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") launcherRef.current?.click(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [isOpen, showBotSelection, loading]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

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

  const selectBot = (botType: "kale" | "tarja2") => {
    setIsRecipeBot(botType === "tarja2");
    setShowBotSelection(false);
    // Clear messages when switching bots
    setMessages([]);
  };

  // Recipe bot functions
  const isGreeting = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    const greetings = [
      "moi",
      "hei",
      "terve",
      "moro",
      "hey",
      "hello",
      "hi",
      "wadaap",
    ];
    return greetings.some((greeting) => lowerText.includes(greeting));
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

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot: isRecipeBot ? "tarja2" : "kale", seenRecipeIds: [...new Set(messages.flatMap(message => message.recipes?.map(recipe => recipe.id) ?? []))].slice(-50), messages: nextMessages.slice(-11).map(m => ({ role: m.role, content: m.content, recipeIds: m.role === "assistant" ? m.recipes?.map(recipe => recipe.id) : undefined })) }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vastausta ei saatu. Kokeile uudelleen.");
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, recipes: data.recipes, mode: data.mode, profileUrl: data.profileUrl }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: error instanceof Error && error.name !== "TimeoutError" ? error.message : "Vastaus viipyy. Kokeile hetken kuluttua." }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayName = isRecipeBot ? "Tarja3" : "Kale";
  const closeChat = () => { if (isCalling) endCall(); setIsOpen(false); launcherRef.current?.focus(); };
  return <MotionConfig reducedMotion="user"><div className={styles.container}>
    <AnimatePresence>
      {isOpen && <motion.section id="wicca-chat-panel" role="dialog" aria-modal="false" aria-label="Wiccosetin chat" className={styles.popup} data-theme={showBotSelection ? "circle" : isRecipeBot ? "chef" : "mystic"} initial={{ opacity: 0, y: 24, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }} transition={{ duration: .25 }}>
        <div className={styles.panelGlow} aria-hidden="true"/>
        <header className={styles.header}>
          <div className={styles.headerLeft}><span className={styles.headerSymbol} aria-hidden="true">{showBotSelection ? "✦" : isRecipeBot ? "♨" : "☾"}</span><div><span className={styles.botName}>{showBotSelection ? "Tähtien välinen linja" : displayName}</span><p className={styles.status}>{showBotSelection ? "WICCOSET · CHAT 2.0" : isRecipeBot ? "KOTIKEITTIÖN UUSI AIKAKAUSI" : "TÄYSIKUU. LYHYT PINNA."}</p></div></div>
          <button type="button" className={styles.close} onClick={closeChat} aria-label="Sulje chat">×</button>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          {showBotSelection ? <motion.div key="selection" className={styles.botSelection} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }} transition={{duration:.18}}>
            <p className={styles.eyebrow}>TUTUT TYYPIT. UUDET LEVELIT.</p><h2>Kenen kanssa jutellaan?</h2><p className={styles.selectionIntro}>Ripaus magiaa vai jotain hyvää lautaselle?</p>
            <div className={styles.botOptions}>
              <button type="button" className={styles.botOption} data-bot="kale" disabled={loading} onClick={() => selectBot("kale")}><span className={styles.botIcon}><Image width={64} height={64} src="/kheilprofile.png" alt="" className={styles.botProfileImage}/></span><span className={styles.optionCopy}><small>UUDET LEVELIT ↗</small><strong>Kale</strong><span>Äkäistä viisautta, kosmisia loitsuja ja nasevaa naljailua.</span></span><span className={styles.optionArrow} aria-hidden="true">↗</span></button>
              <button type="button" className={styles.botOption} data-bot="chef" disabled={loading} onClick={() => selectBot("tarja2")}><span className={styles.botIcon} aria-hidden="true">👩‍🍳</span><span className={styles.optionCopy}><small>TARJA2 → TARJA3</small><strong>Tarja3</strong><span>Oikeat reseptit, ruokakuvat ja ainesosat. Keittiö kutsuu.</span></span><span className={styles.optionArrow} aria-hidden="true">↗</span></button>
            </div><p className={styles.selectionNote}>Kuvitteelliset chat-hahmot. Aitoa keskusteltavaa.</p>
          </motion.div> : <motion.div key={isRecipeBot ? "chef" : "kale"} className={styles.chatBody} onAnimationComplete={() => inputRef.current?.focus()} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:.18}}>
            <div className={styles.toolbar}><span><i className={styles.dot}/> {isRecipeBot ? "Reseptit Kotikokista" : "Kosminen keskusteluyhteys"}</span><div><button type="button" className={styles.switchBot} disabled={loading} onClick={() => { endCall(); setShowBotSelection(true); }}>Vaihda hahmoa</button>{!isRecipeBot && <button type="button" className={styles.callMini} onClick={isCalling ? endCall : startCall}>{isCalling ? "Lopeta puhelu" : "Soita Kalelle"}</button>}</div></div>
            {isCalling && !hasAnswered && <p className={styles.callStatus} role="status">☾ Yhdistetään Kalen kosmiselle linjalle…</p>}
            {isCalling && hasAnswered && <div className={styles.videoWindow}><video ref={videoRef} className={styles.callVideo} autoPlay loop={currentVideo === "kaleafk.mp4"} playsInline><source src={`/${currentVideo}`} type="video/mp4"/></video></div>}
            <div className={styles.messages} ref={listRef} role="log" aria-label="Keskustelu" aria-live="polite">
              {messages.length === 0 && !isCalling && <div className={styles.hint}><span className={styles.welcomeSymbol} aria-hidden="true">{isRecipeBot ? "♨" : "✧"}</span><h2>{isRecipeBot ? "Mitäs tänään kokataan?" : "No, mitä nyt taas?"}</h2><p>{isRecipeBot ? "Minulla on sinulle reseptejä Tarjan tapaan. Kysy vaikka juustokakkua tai pizzaa." : "Kale on uusilla leveleillä. Kysy kuusta, loitsuista tai elämän kosmisista kummallisuuksista."}</p><div className={styles.suggestions}>{(isRecipeBot ? ["Onko sinulla juustokakkureseptiä?", "Suosittele pizzaa"] : ["Keksi minulle kosminen loitsu", "Mikä on esbat?"]).map(text => <button type="button" key={text} onClick={() => {setInput(text); inputRef.current?.focus();}}>{text}<span aria-hidden="true">↗</span></button>)}</div></div>}
              {messages.map((m, idx) => <motion.article key={idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.2}} className={`${styles.message} ${m.role === "user" ? styles.user : styles.assistant}`}><span className={styles.messageAuthor}>{m.role === "user" ? "SINÄ" : displayName.toUpperCase()}</span><div>{m.content}</div>{m.mode === "local" && <small className={styles.modeNote}>Paikallinen vastaus · tekoäly ei ole käytössä</small>}{!!m.recipes?.length && <div className={styles.recipeCards}>{m.recipes.map(recipe => <section key={recipe.id}>{!!recipe.ingredients?.length && <details className={styles.recipeIngredients} open><summary>{recipe.title} — ainesosat</summary><ul>{recipe.ingredients.map((ingredient,index) => <li key={index}>{ingredient}</li>)}</ul></details>}<RecipePreview recipe={recipe}/></section>)}</div>}{m.profileUrl && <a className={styles.sourceLink} href={m.profileUrl} target="_blank" rel="noopener noreferrer">Kaikki tarja2:n reseptit Kotikokissa ↗</a>}</motion.article>)}
              {loading && !isCalling && <div className={styles.typing} role="status"><span aria-hidden="true"><i/><i/><i/></span>{displayName} kirjoittaa…</div>}
            </div>
            <form className={styles.inputRow} onSubmit={event => {event.preventDefault();void sendMessage();}}><input ref={inputRef} className={styles.input} placeholder={isRecipeBot ? "Mitä tekisi mieli?" : "Kysy, jos uskallat…"} aria-label="Viesti tietäjälle" maxLength={2000} disabled={loading} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}/><button type="submit" className={styles.send} disabled={loading || !input.trim()} aria-label="Lähetä viesti"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z M22 2 11 13"/></svg></button></form>
            <p className={styles.chatFootnote}>{isRecipeBot ? "Tarja3 · resepti-apuri · lähde: tarja2 / Kotikokki" : "Kale · mystiikkaa ja mielikuvitusta"}</p>
          </motion.div>}
        </AnimatePresence>
      </motion.section>}
    </AnimatePresence>
    <motion.button ref={launcherRef} type="button" className={styles.fab} whileHover={{y:-3}} whileTap={{scale:.97}} onClick={() => { if(isOpen) closeChat(); else {setIsOpen(true);if(!messages.length)setShowBotSelection(true);} }} aria-label="Open Wicca Chat" aria-expanded={isOpen} aria-controls="wicca-chat-panel"><span className={styles.fabIcon} aria-hidden="true">{isOpen ? "×" : "✦"}</span><span className={styles.fabCopy}><span className={styles.fabLabel}>KYSY WICCA TIETÄJÄLTÄ</span><small>Kale & Tarja3 <span>· UUDET LEVELIT</span></small></span></motion.button>
  </div></MotionConfig>;
}
