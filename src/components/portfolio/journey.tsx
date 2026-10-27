"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, GraduationCap, Building2, CalendarDays } from "lucide-react";
import type { Experience, Education } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

export function Journey({ experiences, education }: { experiences: Experience[]; education: Education[] }) {
  const [tab, setTab] = useState<"exp" | "edu">("exp");

  return (
    <section id="journey" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <SectionHeading
        eyebrow="My Path"
        title="The Journey So Far"
        description="A timeline of roles that shaped me — watch the line draw itself as you scroll."
      />

      {/* tab switcher */}
      <Reveal className="mt-12 flex justify-center">
        <div className="glass relative flex rounded-full p-1.5">
          {(
            [
              { id: "exp", label: "Experience", icon: Briefcase },
              { id: "edu", label: "Education", icon: GraduationCap },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-cursor
              className={`relative z-10 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-250 ${
                tab === id ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="journey-tab"
                  transition={{ type: "spring", stiffness: 300, damping: 27 }}
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_8px_26px_-8px_rgba(139,92,246,0.7)]"
                />
              )}
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* timeline */}
      <div className="relative mx-auto mt-16 max-w-4xl overflow-x-clip">
        {/* animated center line */}
        <motion.div
          aria-hidden
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-5 top-0 h-full w-[2.5px] origin-top rounded-full bg-gradient-to-b from-[var(--site-primary)] via-[var(--site-accent)] to-transparent md:left-1/2 md:-translate-x-1/2"
        />

        <AnimatePresence mode="wait">
          {tab === "exp" ? (
            <motion.div key="exp" className="flex flex-col gap-10 md:gap-14">
              {experiences.map((exp, i) => (
                <TimelineItem
                  key={exp.id}
                  index={i}
                  side={i % 2 === 0 ? "left" : "right"}
                  icon={<Briefcase className="h-4 w-4" />}
                  title={exp.role}
                  org={exp.company}
                  period={exp.period}
                  description={exp.description}
                  current={exp.current}
                />
              ))}
              {experiences.length === 0 && <EmptyHint text="Add experience from the admin panel" />}
            </motion.div>
          ) : (
            <motion.div key="edu" className="flex flex-col gap-10 md:gap-14">
              {education.map((edu, i) => (
                <TimelineItem
                  key={edu.id}
                  index={i}
                  side={i % 2 === 0 ? "left" : "right"}
                  icon={<GraduationCap className="h-4 w-4" />}
                  title={edu.degree}
                  org={edu.institution}
                  period={edu.period}
                  description={edu.description}
                />
              ))}
              {education.length === 0 && <EmptyHint text="Add education from the admin panel" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TimelineItem({
  index,
  side,
  icon,
  title,
  org,
  period,
  description,
  current,
}: {
  index: number;
  side: "left" | "right";
  icon: React.ReactNode;
  title: string;
  org: string;
  period: string;
  description: string;
  current?: boolean;
}) {
  const fromLeft = side === "left";
  return (
    <div className={`relative flex items-start gap-6 pl-14 md:gap-0 md:pl-0 ${fromLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* dot */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
        className="absolute left-5 top-1.5 z-10 -translate-x-1/2 md:left-1/2"
      >
        <span className={`flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-lg ${current ? "animate-pulse-ring border-transparent bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)]" : "border-white/15 bg-[#171225]"}`}>
          {icon}
        </span>
      </motion.div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, x: fromLeft ? -56 : 56, y: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.12 + index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`glass group w-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/45 hover:shadow-[0_18px_50px_-20px_rgba(139,92,246,0.5)] md:w-[calc(50%-2.5rem)]`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-gradient">{title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--site-accent)]/90">
              <Building2 className="h-3.5 w-3.5" />
              {org}
            </p>
          </div>
          {current && (
            <span className="shrink-0 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Now
            </span>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-white/40">
          <CalendarDays className="h-3.5 w-3.5" />
          {period}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/55">{description}</p>
      </motion.div>

      {/* spacer for the other side */}
      <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl px-6 py-8 text-center text-sm text-white/40"
    >
      {text}
    </motion.p>
  );
}
