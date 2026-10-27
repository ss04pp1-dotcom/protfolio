"use client";

import { motion } from "framer-motion";
import { Reveal } from "./reveal";

/**
 * SectionHeading — eyebrow chip + big display title with an animated
 * gradient underline that draws itself in on scroll.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-4 ${alignCls}`}>
      <Reveal y={20}>
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal y={26} delay={0.08}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
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
