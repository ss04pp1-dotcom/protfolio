"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  CheckCircle2,
  Sparkles,
  Terminal,
  Upload,
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

async function compressAvatarFile(file: File, maxDim = 960, quality = 0.86): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webp = canvas.toDataURL("image/webp", quality);
        resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
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
  onAvatarChange,
  onOpenAudit,
}: {
  ownerName: string;
  avatarUrl?: string;
  greeting: string;
  roles: string[];
  tagline: string;
  availability: string;
  socialLinks: SocialLink[];
  stats: Stat[];
  onAvatarChange?: (newAvatarUrl: string) => Promise<void> | void;
  onOpenAudit?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // parallax on mouse
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

  const handlePhotoUpload = async (file?: File) => {
    if (!file || !onAvatarChange) return;
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const compressed = await compressAvatarFile(file);
      await onAvatarChange(compressed);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } finally {
      setUploading(false);
    }
  };

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
      />

      {/* layered aurora — drifting mesh gradients + mouse parallax */}
      <motion.div
        aria-hidden
        style={{ x: orbX, y: orbY }}
        className="animate-aurora animate-hue-drift pointer-events-none absolute -left-32 top-1/4 h-[26rem] w-[26rem] bg-[var(--site-primary)] opacity-[0.2] blur-[100px]"
      />
      <motion.div
        aria-hidden
        style={{ x: orbX2, y: orbY2 }}
        className="animate-aurora-alt pointer-events-none absolute -right-32 bottom-1/5 h-[30rem] w-[30rem] bg-[var(--site-accent)] opacity-[0.16] blur-[110px] [animation-delay:-8s]"
      />
      {/* horizon beam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_srgb,var(--site-primary)_16%,transparent),transparent_70%)]"
      />
      <div aria-hidden className="bg-grid mask-fade-b pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* 2-Column Split-Screen Hero Layout: Typography Left + Owner Portrait Showcase Right */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column (7 cols) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* availability chip */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
              className="glass mb-6 flex items-center gap-2.5 rounded-full px-4 py-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium tracking-wide text-white/75 sm:text-sm">
                {availability}
              </span>
            </motion.div>

            {/* greeting */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
              className="mb-2 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.3em] text-white/50 sm:text-base"
            >
              <Sparkles className="h-4 w-4 text-[var(--site-accent)]" />
              {greeting}
            </motion.p>

            {/* name — letter by letter */}
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

            {/* typewriter roles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-5 flex min-h-[2.4em] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-xl font-medium text-white/85 sm:text-2xl md:text-3xl lg:justify-start"
            >
              <span className="text-white/50">I&apos;m a</span>
              <Typewriter
                words={roles.length ? roles : ["Creative Developer"]}
                className="text-gradient font-semibold"
              />
            </motion.div>

            {/* tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.65, ease: EASE }}
              className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/55 md:text-lg"
            >
              {tagline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.65, ease: EASE }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start"
            >
              <Magnetic>
                <a
                  href="#projects"
                  data-cursor
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_54px_-6px_rgba(217,70,239,0.55)] whitespace-nowrap shrink-0"
                >
                  <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  View My Work
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>

              {onAvatarChange && (
                <Magnetic>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    data-cursor
                    className="glass group inline-flex items-center gap-2 rounded-full border border-[var(--site-primary)]/45 px-6 py-3.5 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-[var(--site-accent)] hover:bg-white/[0.08] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-[var(--site-accent)]" />
                    {uploading ? "আপলোড হচ্ছে..." : "আপনার ছবি আপলোড করুন"}
                  </button>
                </Magnetic>
              )}

              {onOpenAudit && (
                <button
                  type="button"
                  onClick={onOpenAudit}
                  data-cursor
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-mono text-xs text-white/75 transition-all hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5 text-[var(--site-accent)]" />
                  A–Z Audit Report
                </button>
              )}
            </motion.div>

            {/* socials */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.65, ease: EASE }}
              className="mt-8 flex items-center gap-3"
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

          {/* Right Column (5 cols): Prominent Owner Portrait Frame + 1-Click Photo Upload */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
            className="flex justify-center lg:col-span-5"
          >
            <div className="group relative w-full max-w-[380px]">
              {/* Rotating Conic Glow Frame */}
              <div
                aria-hidden
                className="gradient-border animate-pulse-ring absolute -inset-3 rounded-[2.25rem] opacity-85"
              />

              {/* Portrait Showcase Card */}
              <div className="glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 p-2.5 shadow-[0_24px_70px_-15px_rgba(139,92,246,0.45)]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#171225] to-[#0f0b18]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayAvatar}
                    alt={ownerName}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Bottom dark gradient scrim for crisp text legibility */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#08060e] via-[#08060e]/65 to-transparent" />

                  {/* Top-Right Direct Photo Change Button */}
                  {onAvatarChange && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      data-cursor
                      className="glass-strong absolute right-3.5 top-3.5 z-20 inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs font-medium text-white shadow-lg transition-all hover:border-[var(--site-accent)] hover:bg-[var(--site-primary)] whitespace-nowrap shrink-0 cursor-pointer"
                      title="আপনার নিজের ছবি আপলোড করুন"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Uploading..." : "ছবি পরিবর্তন করুন"}
                    </button>
                  )}

                  {/* Saved Confirmation Toast */}
                  {savedToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className=" absolute left-3.5 top-3.5 z-20 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      আপনার ছবি সেভ হয়েছে!
                    </motion.div>
                  )}

                  {/* Bottom Owner Identity Badge */}
                  <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3">
                    <div className="text-left">
                      <div className="mb-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--site-accent)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Portfolio Owner
                      </div>
                      <h2 className="font-display text-lg font-bold leading-tight text-white">
                        {ownerName}
                      </h2>
                      <p className="max-w-[220px] truncate text-xs text-white/65">
                        {roles[0] || "Full-Stack Developer"}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 font-display text-xs font-bold text-white backdrop-blur-md">
                      {initials}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.7, ease: EASE }}
          className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="glass group rounded-2xl px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/40 lg:text-left"
            >
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                <CountUp value={stat.value} suffix={stat.suffix} className="text-gradient" />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45 sm:text-xs">
                {stat.label}
              </div>
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
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
        data-cursor
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-full border-2 border-white/20 p-1.5">
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
