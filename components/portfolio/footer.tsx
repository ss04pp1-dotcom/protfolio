"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUp, Heart, Github, Linkedin, Twitter, Dribbble, Mail, Link as LinkIcon, MapPin } from "lucide-react";
import type { SiteSettings, SocialLink } from "@/lib/types";
import { NAV_SECTIONS } from "./navbar";
import { Magnetic } from "./magnetic";

const SOCIAL_FALLBACK: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  dribbble: Dribbble,
  mail: Mail,
  default: LinkIcon,
};

function socialIcon(platform: string) {
  const key = platform.toLowerCase();
  const found = Object.entries(SOCIAL_FALLBACK).find(([k]) => key.includes(k));
  return found ? found[1] : SOCIAL_FALLBACK.default;
}

export function Footer({ settings, socialLinks }: { settings: SiteSettings; socialLinks: SocialLink[] }) {
  const clock = useLocalClock();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06]">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <div aria-hidden className="absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-[var(--site-primary)] opacity-[0.08] blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          {/* giant outlined name — gradient fills it in from the left on hover */}
          <a href="#home" data-cursor className="group relative text-center">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-outline-strong font-display relative block text-5xl font-bold tracking-tight transition-all duration-500 sm:text-6xl md:text-7xl"
            >
              {settings.ownerName}
              <span
                aria-hidden
                className="font-display text-gradient absolute inset-0 block whitespace-nowrap text-5xl font-bold tracking-tight [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-700 ease-out group-hover:[clip-path:inset(0_0_0_0)] sm:text-6xl md:text-7xl"
              >
                {settings.ownerName}
              </span>
            </motion.span>
          </a>

          {/* live local time — a small agency-grade touch */}
          {(settings.location || clock) && (
            <div className="glass flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-xs text-white/55">
              <MapPin className="h-3.5 w-3.5 text-[var(--site-accent)]" />
              {settings.location || "Dhaka, Bangladesh"}
              {clock && (
                <>
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="tabular-nums">{clock}</span>
                  <span className="text-white/30">local time</span>
                </>
              )}
            </div>
          )}

          {/* nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {NAV_SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="group relative text-sm text-white/45 transition-colors duration-250 hover:text-white"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* socials */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => {
              const Icon = socialIcon(s.platform || s.icon);
              return (
                <Magnetic key={s.id} strength={0.5}>
                  <motion.a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    data-cursor
                    whileHover={{ y: -4, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 320, damping: 14 }}
                    className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-white/60 transition-colors duration-300 hover:border-[var(--site-accent)]/50 hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </motion.a>
                </Magnetic>
              );
            })}
          </div>

          {/* bottom bar */}
          <div className="flex w-full flex-col items-center gap-3 border-t border-white/[0.06] pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} {settings.ownerName}. {settings.footerText}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-white/40">
              Crafted with
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              </motion.span>
              and Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const { scrollYProgress } = useScroll();
  // SVG circular progress ring geometry
  const R = 22;
  const C = 2 * Math.PI * R;
  const dashOffset = useSpring(useTransform(scrollYProgress, [0, 1], [C, 0]), {
    stiffness: 120,
    damping: 26,
  });

  return (
    <AnimatePresence>
      <motion.a
        href="#home"
        aria-label="Back to top"
        initial={{ opacity: 0, scale: 0.6, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: 16 }}
        data-cursor
        className="group fixed bottom-6 right-6 z-[85] flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white shadow-[0_12px_36px_-10px_rgba(139,92,246,0.75)] transition-transform duration-300 hover:scale-110"
      >
        <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        {/* circular scroll-progress ring */}
        <svg aria-hidden className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90">
          <circle cx="50%" cy="50%" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <motion.circle
            cx="50%"
            cy="50%"
            r={R}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
      </motion.a>
    </AnimatePresence>
  );
}

/** Ticking local-time clock (owner's timezone, Asia/Dhaka default). */
function useLocalClock(): string {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const timer = setInterval(tick, 10_000);
    return () => clearInterval(timer);
  }, []);
  return time;
}
