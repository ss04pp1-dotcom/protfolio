"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, MapPin, BadgeCheck, Camera, CheckCircle2 } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { Reveal, StaggerGroup } from "./reveal";
import { SectionHeading } from "./section-heading";
import { VelocityMarquee } from "./velocity-marquee";
import { WordReveal } from "./word-reveal";

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

export function About({
  settings,
  marqueeItems,
  onAvatarChange,
}: {
  settings: SiteSettings;
  marqueeItems: string[];
  onAvatarChange?: (newAvatarUrl: string) => Promise<void> | void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const paragraphs = settings.aboutText.split("\n").filter(Boolean);
  const displayAvatar = settings.avatarUrl || "/images/avatar.svg";

  const handlePhotoSelect = async (file?: File) => {
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

  return (
    <section id="about" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
      />

      <SectionHeading
        eyebrow="Who I Am"
        title={settings.aboutTitle || "About Me"}
        index={1}
      />

      <div className="mt-16 grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        {/* Avatar with rotating conic ring + orbit dots + 1-click upload */}
        <Reveal x={-40} y={0} className="mx-auto">
          <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
            <div aria-hidden className="gradient-border animate-pulse-ring absolute -inset-3 rounded-[2rem]" />
            <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#171225] to-[#0f0b18]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAvatar}
                alt={settings.ownerName}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {onAvatarChange && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-cursor
                  className="glass-strong absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:bg-[var(--site-primary)] cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "ছবি পরিবর্তন করুন"}
                </button>
              )}

              {savedToast && (
                <div className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl bg-emerald-500/95 px-2.5 py-1 text-[11px] font-medium text-white">
                  <CheckCircle2 className="h-3 w-3" /> সেভ হয়েছে!
                </div>
              )}
            </div>

            {/* orbiting dots */}
            <div aria-hidden className="animate-spin-slow pointer-events-none absolute -inset-8">
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--site-primary)] shadow-[0_0_16px_var(--site-primary)]" />
              <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--site-accent)] shadow-[0_0_12px_var(--site-accent)]" />
              <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />
            </div>

            {/* floating badge */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-xl sm:-right-8"
            >
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white/85">{settings.availability}</span>
            </motion.div>
          </div>
        </Reveal>

        {/* Text — words light up one by one as you scroll */}
        <div>
          <div className="flex flex-col gap-5">
            {paragraphs.map((p, i) => (
              <WordReveal
                key={i}
                text={p}
                className="text-base leading-relaxed text-white/60 md:text-lg"
              />
            ))}
          </div>

          {/* meta info */}
          <StaggerGroup className="mt-8 grid gap-4 sm:grid-cols-2" stagger={0.1}>
            <InfoPill icon={<MapPin className="h-4 w-4" />} label="Location" value={settings.location} />
            <InfoPill icon={<span className="text-xs">@</span>} label="Email" value={settings.email} />
          </StaggerGroup>

          {/* resume CTA */}
          <Reveal delay={0.2} className="mt-9">
            {settings.resumeUrl ? (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-7 py-3.5 font-semibold text-white shadow-[0_10px_36px_-10px_rgba(139,92,246,0.65)] transition-all duration-300 hover:shadow-[0_14px_48px_-8px_rgba(217,70,239,0.5)]"
              >
                <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                Download Resume
              </a>
            ) : (
              <span className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm text-white/50">
                <Download className="h-4 w-4" />
                Resume link can be added from Admin → Settings
              </span>
            )}
          </Reveal>
        </div>
      </div>

      {/* scroll-velocity marquee strip */}
      {marqueeItems.length > 0 && (
        <Reveal delay={0.1} className="mt-24">
          <div className="glass rounded-2xl py-6">
            <VelocityMarquee
              items={marqueeItems}
              itemClassName="font-display text-2xl font-bold tracking-tight md:text-3xl"
            />
          </div>
        </Reveal>
      )}
    </section>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="glass group flex items-center gap-3.5 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--site-primary)]/40">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)]/25 to-[var(--site-accent)]/25 text-[var(--site-accent)] transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
        <div className="truncate text-sm font-medium text-white/85">{value}</div>
      </div>
    </div>
  );
}
