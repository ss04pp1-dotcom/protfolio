"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Skill } from "@/lib/types";
import { DynIcon } from "@/components/icon";
import { SectionHeading, Accent } from "./section-heading";
import { Reveal } from "./reveal";
import { Marquee } from "./marquee";
import { Tilt } from "./tilt";

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;

export function Skills({ skills }: { skills: Skill[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(skills.map((s) => s.category || "Other")))],
    [skills]
  );
  const [active, setActive] = useState("All");

  const visible = active === "All" ? skills : skills.filter((s) => (s.category || "Other") === active);

  return (
    <section id="skills" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      {/* ambient */}
      <div aria-hidden className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--site-primary)] opacity-[0.07] blur-[110px]" />

      <SectionHeading
        eyebrow="My Arsenal"
        title={
          <>
            Skills & <Accent>Superpowers</Accent>
          </>
        }
        description="A toolkit sharpened by real projects — hover a card to feel it tilt, watch the rings fill as you scroll."
        index={3}
      />

      {/* category tabs */}
      <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            data-cursor
            className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              active === cat ? "text-white" : "text-white/50 hover:text-white/90"
            }`}
          >
            {active === cat && (
              <motion.span
                layoutId="skill-tab-pill"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_8px_28px_-8px_rgba(139,92,246,0.7)]"
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </Reveal>

      {/* cards */}
      <motion.div layout className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((skill, i) => (
            <motion.div
              key={skill.id}
              layout
              initial={{ opacity: 0, y: 34, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ delay: i * 0.05, duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Tilt max={10} className="group h-full">
                <div className="glass spotlight-card relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/45 hover:shadow-[0_18px_50px_-18px_rgba(139,92,246,0.55)]">
                  <div className="flex items-center justify-between">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      {/* circular level ring */}
                      <svg aria-hidden className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 60 60">
                        <defs>
                          <linearGradient id={`ring-${skill.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--site-primary)" />
                            <stop offset="100%" stopColor="var(--site-accent)" />
                          </linearGradient>
                        </defs>
                        <circle cx="30" cy="30" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                        <motion.circle
                          cx="30"
                          cy="30"
                          r={RING_R}
                          fill="none"
                          stroke={`url(#ring-${skill.id})`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={RING_C}
                          initial={{ strokeDashoffset: RING_C }}
                          whileInView={{ strokeDashoffset: RING_C * (1 - skill.level / 100) }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ duration: 1.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)]/22 to-[var(--site-accent)]/22 text-[var(--site-accent)] transition-all duration-300 group-hover:scale-110 group-hover:from-[var(--site-primary)]/45 group-hover:to-[var(--site-accent)]/45 group-hover:text-white">
                        <DynIcon name={skill.icon} className="h-5.5 w-5.5" />
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-white/35 transition-colors group-hover:text-white/70">
                      {skill.level}%
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{skill.name}</h3>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-white/35">{skill.category}</p>

                  {/* animated bar with shimmer tip */}
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 1.25, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="relative h-full rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]"
                    >
                      <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/70 opacity-0 blur-[2px] transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-100" />
                    </motion.div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* bottom marquee */}
      {skills.length > 0 && (
        <Reveal delay={0.15} className="mt-16">
          <Marquee
            items={skills.map((s) => s.name)}
            reverse
            itemClassName="font-mono text-sm uppercase tracking-[0.2em] text-white/40"
            separator="/"
          />
        </Reveal>
      )}
    </section>
  );
}
