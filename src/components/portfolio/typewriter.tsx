"use client";

import { useEffect, useState } from "react";

/**
 * Typewriter — cycles through phrases with type/hold/delete phases
 * and a blinking gradient caret. Used in the hero for rotating roles.
 */
export function Typewriter({
  words,
  className,
  typeSpeed = 62,
  deleteSpeed = 34,
  holdTime = 1700,
}: {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdTime?: number;
}) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[wordIndex % words.length];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("deleting"), holdTime);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
        return () => clearTimeout(t);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional typewriter state machine
      setWordIndex((i) => (i + 1) % words.length);
      setPhase("typing");
      return;
    }
  }, [text, phase, wordIndex, words, typeSpeed, deleteSpeed, holdTime]);

  return (
    <span className={className} aria-live="polite">
      {text}
      <span
        aria-hidden
        className="animate-caret ml-1 inline-block h-[0.95em] w-[3px] translate-y-[0.12em] rounded-full bg-gradient-to-b from-[var(--site-primary)] to-[var(--site-accent)]"
      />
    </span>
  );
}
