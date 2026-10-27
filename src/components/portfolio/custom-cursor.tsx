"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * CustomCursor — a glowing dot + lagging gradient ring that expands
 * over interactive elements. Elements with [data-cursor-label="…"]
 * morph the ring into a labelled pill (e.g. "View" on project cards).
 * Desktop (fine pointer) only.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time enable after mount (SSR-safe)
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setHovering(Boolean(t.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor]")));
      const labelled = t.closest<HTMLElement>("[data-cursor-label]");
      setLabel(labelled?.dataset.cursorLabel ?? null);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  const showLabel = Boolean(label);

  return (
    <>
      {/* dot — hides when a labelled pill is showing */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[190] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)]"
        style={{ x, y }}
        animate={{ scale: pressed ? 0.6 : showLabel ? 0 : hovering ? 0.5 : 1 }}
        transition={{ duration: 0.18 }}
      />
      {/* trailing ring / label pill */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[189] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
        style={{ x: ringX, y: ringY, borderColor: showLabel ? "transparent" : "var(--site-primary)" }}
        animate={{
          width: showLabel ? 72 : hovering ? 52 : 34,
          height: showLabel ? 72 : hovering ? 52 : 34,
          opacity: showLabel ? 1 : hovering ? 0.95 : 0.55,
          scale: pressed ? 0.82 : 1,
          backgroundColor: showLabel
            ? "color-mix(in srgb, var(--site-primary) 78%, transparent)"
            : "rgba(139,92,246,0)",
        }}
        transition={{ duration: 0.22 }}
      >
        <motion.span
          className="absolute inset-0 m-auto h-1 w-1 rounded-full bg-[var(--site-accent)]"
          animate={{ scale: hovering && !showLabel ? 1.6 : 0 }}
        />
        <motion.span
          className="select-none font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          animate={{ opacity: showLabel ? 1 : 0, scale: showLabel ? 1 : 0.6 }}
          transition={{ duration: 0.18 }}
        >
          {label}
        </motion.span>
      </motion.div>
    </>
  );
}
