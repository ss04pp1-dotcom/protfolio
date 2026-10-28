"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Reveal } from "./reveal";

/**
 * SectionHeading — eyebrow chip + big display title (accepts rich nodes so
 * sections can mix serif-italic accent words) + an animated gradient
 * underline and an optional huge outlined "ghost" index number that fades
 * in behind the heading.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  index,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  /** 1-based section index → renders as a giant outlined numeral */
  index?: number;
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`relative flex flex-col gap-4 ${alignCls}`}>
      {/* ghost index numeral */}
      {index !== undefined && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="ghost-number pointer-events-none absolute -top-14 right-0 hidden select-none text-[9rem] md:block lg:text-[11rem]"
        >
          {String(index).padStart(2, "0")}
        </motion.span>
      )}

      <Reveal y={20}>
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal y={26} delay={0.08}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {parseTitle(title)}
        </h2>
      </Reveal>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`h-[3px] w-24 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] ${align === "center" ? "" : "origin-left"}`}
      />
      {description && (
        <Reveal y={20} delay={0.15}>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">{description}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Serif-italic accent word for section titles — editorial premium typography. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <em className="font-serif text-[1.06em] font-medium italic text-gradient">{children}</em>
  );
}

/**
 * String titles may mark accent words with *asterisks* — e.g.
 * "The Person *Behind the Pixels*" — so admins get the premium
 * serif-italic look while keeping full content control.
 */
function parseTitle(title: ReactNode): ReactNode {
  if (typeof title !== "string" || !title.includes("*")) return title;
  return title.split("*").map((part, i) =>
    i % 2 === 1 ? <Accent key={i}>{part}</Accent> : <span key={i}>{part}</span>
  );
}
