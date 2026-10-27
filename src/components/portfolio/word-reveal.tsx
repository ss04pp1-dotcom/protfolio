"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * WordReveal — Awwwards-style paragraph animation: every word lifts from a
 * dim state to full opacity, one after another, driven purely by scroll
 * position. Supports **bold** markers from the admin editor.
 */
function Word({
  children,
  progress,
  range,
  bold,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  bold: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`inline-block ${bold ? "font-semibold text-white" : ""}`}
    >
      {children}&nbsp;
    </motion.span>
  );
}

export function WordReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.42"],
  });

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <p ref={ref} className={`relative ${className ?? ""}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const bold = word.startsWith("**") && word.endsWith("**") && word.length > 4;
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]} bold={bold}>
            {bold ? word.slice(2, -2) : word}
          </Word>
        );
      })}
    </p>
  );
}
