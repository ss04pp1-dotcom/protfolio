"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  Download,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import type { SocialLink, Stat } from "@/lib/types";
import { Typewriter } from "./typewriter";
import { Magnetic } from "./magnetic";
import { CountUp } from "./count-up";

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

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero({
  ownerName,
  avatarUrl,
  greeting,
  roles,
  tagline,
  availability,
  socialLinks,
  stats,
  resumeUrl,
}: {
  ownerName: string;
  avatarUrl?: string;
  greeting: string;
  roles: string[];
  tagline: string;
  availability: string;
  socialLinks: SocialLink[];
  stats: Stat[];
  resumeUrl?: string;
}) {
  // Parallax on mouse
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const orbX = useTransform(smx, [0, 1], [-26, 26]);
  const orbY = useTransform(smy, [0, 1], [-20, 20]);
  const orbX2 = useTransform(smx, [0, 1], [22, -22]);
  const orbY2 = useTransform(smy, [0, 1], [18, -18]);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  const letters = ownerName.split("");
  const initials = ownerName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const displayAvatar = avatarUrl || "/images/avatar.svg";

  return (
    <section
      id="home"
      onMouseMove={onMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8"
    >
      {/* Layered aurora mesh gradients + subtle parallax */}
      <motion.div
        aria-hidden
        style={{ x: orbX, y: orbY }}
        className="animate-aurora animate-hue-drift pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] bg-[var(--site-primary)] opacity-[0.22] blur-[110px]"
      />
      <motion.div
        aria-hidden
        style={{ x: orbX2, y: orbY2 }}
        className="animate-aurora-alt pointer-events-none absolute -right-32 bottom-1/5 h-[32rem] w-[32rem] bg-[var(--site-accent)] opacity-[0.18] blur-[120px] [animation-delay:-8s]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_srgb,var(--site-primary)_18%,transparent),transparent_70%)]"
      />
      <div aria-hidden className="bg-grid mask-fade-b pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* 2-Column Split Hero Layout: High-Impact Typography Left + Sovereign Portrait Showcase Right */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column (7 cols): Editorial Typography & Action Matrix */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Live Availability Badge */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
              className="glass mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2 border border-white/10"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium tracking-wide text-white/85 sm:text-sm">
                {availability}
              </span>
            </motion.div>

            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
              className="mb-2 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.3em] text-white/55 sm:text-base"
            >
              <Sparkles className="h-4 w-4 text-[var(--site-accent)]" />
              {greeting}
            </motion.p>

            {/* Name — letter by letter with 3D spring hover */}
            <h1
              className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-7xl"
              aria-label={ownerName}
            >
              {letters.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  aria-hidden
                  initial={{ y: 70, opacity: 0, rotateX: -65 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  whileHover={{
                    y: -12,
                    scale: 1.12,
                    rotateX: 12,
                    transition: { type: "spring", stiffness: 420, damping: 12 },
                  }}
                  transition={{ delay: 0.35 + i * 0.035, duration: 0.65, ease: EASE }}
                  className="inline-block cursor-default will-change-transform hover:text-gradient"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </h1>

            {/* Typewriter dynamic roles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-5 flex min-h-[2.4em] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-xl font-medium text-white/90 sm:text-2xl md:text-3xl lg:justify-start"
            >
              <span className="text-white/50">I&apos;m a</span>
              <Typewriter
                words={roles.length ? roles : ["Full-Stack Developer", "Next.js Specialist"]}
                className="text-gradient font-semibold"
              />
            </motion.div>

            {/* Narrative tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.65, ease: EASE }}
              className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/60 md:text-lg"
            >
              {tagline}
            </motion.p>

            {/* Clean Professional CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.65, ease: EASE }}
              className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Magnetic>
                <a
                  href="#projects"
                  data-cursor
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_54px_-6px_rgba(217,70,239,0.55)] whitespace-nowrap shrink-0"
                >
                  <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  View Selected Work
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>

              <Magnetic>
                <a
                  href="#contact"
                  data-cursor
                  className="glass group inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-[var(--site-accent)] hover:bg-white/[0.08] hover:text-white whitespace-nowrap shrink-0"
                >
                  Let&apos;s Connect
                  <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>

              {resumeUrl && (
                <Magnetic>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="glass inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 font-mono text-xs text-white/75 transition-all hover:text-white hover:border-[var(--site-primary)]/40 whitespace-nowrap shrink-0"
                  >
                    <Download className="h-3.5 w-3.5 text-[var(--site-accent)]" />
                    Resume (PDF)
                  </a>
                </Magnetic>
              )}
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.65, ease: EASE }}
              className="mt-9 flex items-center gap-3"
            >
              {socialLinks.map((s, i) => {
                const Icon = socialIcon(s.platform || s.icon);
                return (
                  <Magnetic key={s.id} strength={0.45}>
                    <motion.a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      data-cursor
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 1.35 + i * 0.07,
                        type: "spring",
                        stiffness: 240,
                        damping: 16,
                      }}
                      className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-white/65 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/60 hover:text-white hover:shadow-[0_10px_30px_-6px_rgba(139,92,246,0.45)]"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </motion.a>
                  </Magnetic>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column (5 cols): Sovereign Owner Portrait Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
            className="flex justify-center lg:col-span-5"
          >
            <div className="group relative w-full max-w-[390px]">
              {/* Rotating Ambient Conic Glow Frame */}
              <div
                aria-hidden
                className="gradient-border animate-pulse-ring absolute -inset-3.5 rounded-[2.5rem] opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              />

              {/* Portrait Showcase Card */}
              <div className="glass-strong relative overflow-hidden rounded-[2.2rem] border border-white/20 p-3 shadow-[0_26px_80px_-16px_rgba(139,92,246,0.5)]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#171225] via-[#120d20] to-[#08060e]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayAvatar}
                    alt={ownerName}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Scrim for Contrast & Hierarchy */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08060e] via-[#08060e]/75 to-transparent" />

                  {/* Floating Top Verification Pill */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[11px] font-medium tracking-wide text-white/90">
                      Verified Portfolio
                    </span>
                  </div>

                  {/* Bottom Owner Identity Badge */}
                  <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3">
                    <div className="text-left">
                      <div className="mb-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--site-accent)]">
                        Full-Stack Engineer
                      </div>
                      <h2 className="font-display text-xl font-bold leading-tight text-white">
                        {ownerName}
                      </h2>
                      <p className="max-w-[230px] truncate text-xs text-white/65">
                        {roles[0] || "Creative Coder & Architect"}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-display text-sm font-bold text-white backdrop-blur-md shadow-lg">
                      {initials}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats KPI Row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.7, ease: EASE }}
          className="mx-auto mt-16 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="glass group rounded-2xl px-5 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/50 lg:text-left"
            >
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                <CountUp value={stat.value} suffix={stat.suffix} className="text-gradient" />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50 sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.a
        href="#about"
        aria-label="Scroll to about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
        data-cursor
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-full border-2 border-white/20 p-1.5 transition-colors hover:border-[var(--site-accent)]">
          <motion.span
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-gradient-to-b from-[var(--site-primary)] to-[var(--site-accent)]"
          />
        </span>
      </motion.a>
    </section>
  );
}
