import React, { useEffect, useState, useRef } from "react";
import styles from "@/app/components/TypewriterText.module.css";

interface TypewriterTextProps {
  text: string[];
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when text changes (language switch)
    setDisplayedText([]);
    setCurrentLine(0);
    setCurrentChar(0);
  }, [text]);

  useEffect(() => {
    if (currentLine >= text.length) return;

    const timer = setTimeout(() => {
      if (currentChar < text[currentLine].length) {
        setDisplayedText((prev) => {
          const newText = [...prev];
          if (!newText[currentLine]) newText[currentLine] = "";
          newText[currentLine] = text[currentLine].slice(0, currentChar + 1);
          return newText;
        });
        setCurrentChar((prev) => prev + 1);
      } else {
        setCurrentLine((prev) => prev + 1);
        setCurrentChar(0);
      }

      // Scroll to bottom as new text appears
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 10); // Reduced from 30ms to 10ms for faster typing

    return () => clearTimeout(timer);
  }, [currentLine, currentChar, text]);

  return (
    <div className={styles.container} ref={containerRef}>
      {displayedText.map((line, index) => (
        <p key={index} className={styles.line}>
          {line}
          {index === currentLine && currentChar < text[currentLine]?.length && (
            <span className={styles.cursor}>|</span>
          )}
        </p>
      ))}
    </div>
  );
};
