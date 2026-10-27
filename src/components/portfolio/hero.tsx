"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles, Download, Github, Linkedin, Twitter, Dribbble, Mail, Link as LinkIcon } from "lucide-react";
import type { SocialLink, Stat } from "@/lib/types";
import { Typewriter } from "./typewriter";
import { Magnetic } from "./magnetic";
import { CountUp } from "./count-up";
import { DynIcon } from "@/components/icon";

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
  greeting,
  roles,
  tagline,
  availability,
  socialLinks,
  stats,
}: {
  ownerName: string;
  greeting: string;
  roles: string[];
  tagline: string;
  availability: string;
  socialLinks: SocialLink[];
  stats: Stat[];
}) {
  // parallax on mouse
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const orbX = useTransform(smx, [0, 1], [-26, 26]);
  const orbY = useTransform(smy, [0, 1], [-20, 20]);
  const orbX2 = useTransform(smx, [0, 1], [22, -22]);
  const orbY2 = useTransform(smy, [0, 1], [18, -18]);
  const badgeX = useTransform(smx, [0, 1], [-14, 14]);
  const badgeY = useTransform(smy, [0, 1], [-10, 10]);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  const letters = ownerName.split("");

  return (
    <section
      id="home"
      onMouseMove={onMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 sm:px-6"
    >
      {/* parallax gradient orbs */}
      <motion.div
        aria-hidden
        style={{ x: orbX, y: orbY }}
        className="animate-blob pointer-events-none absolute -left-24 top-1/4 h-80 w-80 bg-[var(--site-primary)] opacity-[0.16] blur-[110px]"
      />
      <motion.div
        aria-hidden
        style={{ x: orbX2, y: orbY2 }}
        className="animate-blob pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 bg-[var(--site-accent)] opacity-[0.13] blur-[120px] [animation-delay:-6s]"
      />
      <div aria-hidden className="bg-grid mask-fade-b pointer-events-none absolute inset-0" />

      {/* floating tech badges (desktop) */}
      <motion.div aria-hidden style={{ x: badgeX, y: badgeY }} className="pointer-events-none absolute inset-0 hidden lg:block">
        <span className="animate-float absolute left-[12%] top-[30%] glass rounded-2xl px-4 py-2.5 font-mono text-sm text-white/70 shadow-lg">
          ⚛ React
        </span>
        <span className="animate-float absolute right-[13%] top-[26%] glass rounded-2xl px-4 py-2.5 font-mono text-sm text-white/70 shadow-lg [animation-delay:-1.6s]">
          {"</> TypeScript"}
        </span>
        <span className="animate-float absolute left-[16%] bottom-[24%] glass rounded-2xl px-4 py-2.5 font-mono text-sm text-white/70 shadow-lg [animation-delay:-2.7s]">
          ▲ Next.js
        </span>
        <span className="animate-float absolute right-[15%] bottom-[30%] glass rounded-2xl px-4 py-2.5 font-mono text-sm text-white/70 shadow-lg [animation-delay:-3.8s]">
          ✦ Framer Motion
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* availability chip */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          className="glass mb-7 flex items-center gap-2.5 rounded-full px-4 py-2"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium tracking-wide text-white/75 sm:text-sm">{availability}</span>
        </motion.div>

        {/* greeting */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.3em] text-white/50 sm:text-base"
        >
          <Sparkles className="h-4 w-4 text-[var(--site-accent)]" />
          {greeting}
        </motion.p>

        {/* name — letter by letter */}
        <h1
          className="font-display text-[13vw] font-bold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl"
          aria-label={ownerName}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              aria-hidden
              initial={{ y: 90, opacity: 0, rotateX: -70 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.45 + i * 0.04, duration: 0.7, ease: EASE }}
              className="inline-block will-change-transform hover:text-gradient"
              style={{ transformStyle: "preserve-3d" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>

        {/* typewriter roles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="mt-6 flex min-h-[2.4em] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-xl font-medium text-white/85 sm:text-2xl md:text-3xl"
        >
          <span className="text-white/50">I&apos;m a</span>
          <Typewriter words={roles.length ? roles : ["Creative Developer"]} className="text-gradient font-semibold" />
        </motion.div>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7, ease: EASE }}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/55 md:text-lg"
        >
          {tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.7, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <a
              href="#projects"
              data-cursor
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-8 py-3.5 font-semibold text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_54px_-6px_rgba(217,70,239,0.55)]"
            >
              <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              View My Work
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              data-cursor
              className="glass group inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white/85 transition-all duration-300 hover:border-[var(--site-accent)]/50 hover:text-white"
            >
              Get in Touch
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </Magnetic>
        </motion.div>

        {/* socials */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.7, ease: EASE }}
          className="mt-10 flex items-center gap-3"
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
                  transition={{ delay: 1.8 + i * 0.08, type: "spring", stiffness: 240, damping: 16 }}
                  className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-white/65 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/60 hover:text-white hover:shadow-[0_10px_30px_-6px_rgba(139,92,246,0.45)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </motion.a>
              </Magnetic>
            );
          })}
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.7, ease: EASE }}
          className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="glass group rounded-2xl px-4 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/40"
            >
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                <CountUp value={stat.value} suffix={stat.suffix} className="text-gradient" />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45 sm:text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.a
        href="#about"
        aria-label="Scroll to about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        data-cursor
      >
        <span className="flex h-12 w-8 items-start justify-center rounded-full border-2 border-white/20 p-1.5">
          <motion.span
            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-gradient-to-b from-[var(--site-primary)] to-[var(--site-accent)]"
          />
        </span>
      </motion.a>
    </section>
  );
}
