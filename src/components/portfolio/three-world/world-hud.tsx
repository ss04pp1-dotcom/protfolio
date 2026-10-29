"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Compass,
  Zap,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Github,
  X,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";
import type { ZoneTrigger } from "./world-zones";
import type { SiteData, Project, Skill, Experience, Service } from "@/lib/types";
import { sound } from "./audio";

interface WorldHudProps {
  speed: number;
  vehicleX: number;
  vehicleZ: number;
  heading: number;
  activeTrigger: ZoneTrigger | null;
  onInspect: (trigger: ZoneTrigger) => void;
  onResetCar: () => void;
  onToggleClassicMode: () => void;
  onAdminClick: () => void;
  onMobileInput: (action: "forward" | "backward" | "left" | "right" | "boost", active: boolean) => void;
  siteData: SiteData;
}

export function WorldHud({
  speed,
  vehicleX,
  vehicleZ,
  heading,
  activeTrigger,
  onInspect,
  onResetCar,
  onToggleClassicMode,
  onAdminClick,
  onMobileInput,
  siteData,
}: WorldHudProps) {
  const [muted, setMuted] = useState(sound.getMuted());
  const [dialogTrigger, setDialogTrigger] = useState<ZoneTrigger | null>(null);

  const speedKmh = Math.round(Math.abs(speed) * 3.6);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    if (!next) sound.startEngine();
  };

  const handleOpenTrigger = (trig: ZoneTrigger) => {
    sound.playTriggerChime();
    setDialogTrigger(trig);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none overflow-hidden">
      {/* ── Top Bar: Brand, Minimap, Audio, Mode Switcher & Admin ── */}
      <div className="pointer-events-auto flex items-center justify-between p-4 sm:p-6">
        {/* Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--site-primary)]/50 bg-[#120c24]/90 p-1 shadow-[0_0_20px_rgba(139,92,246,0.5)] backdrop-blur-md">
            <span className="font-display font-black text-sm text-gradient">3D</span>
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              {siteData.settings.ownerName}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--site-accent)]">
              Interactive 3D Virtual World
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:border-[var(--site-primary)] hover:text-white"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Reset Car */}
          <button
            onClick={onResetCar}
            title="Reset Vehicle to Center"
            aria-label="Reset Vehicle"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Switch to Classic 2D View */}
          <button
            onClick={onToggleClassicMode}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:border-[var(--site-primary)]/60"
          >
            <Layers className="h-3.5 w-3.5 text-[var(--site-accent)]" />
            <span className="hidden sm:inline">Classic 2D View</span>
            <span className="sm:hidden">2D</span>
          </button>

          {/* Admin CMS */}
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--site-primary)]/40 bg-[var(--site-primary)]/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-[var(--site-primary)]/35"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* ── Active Zone Trigger Banner (Bottom-Center / Above Controls) ── */}
      <AnimatePresence>
        {activeTrigger && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md sm:bottom-12"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--site-primary)]/60 bg-[#120a22]/95 p-3.5 shadow-[0_12px_40px_rgba(139,92,246,0.6)] backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold text-white truncate">
                    {activeTrigger.title}
                  </div>
                  <div className="truncate text-xs text-white/60">
                    {activeTrigger.subtitle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenTrigger(activeTrigger)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Inspect [E]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speedometer & Minimap (Top Left / Floating) ── */}
      <div className="pointer-events-auto absolute top-20 left-4 sm:top-24 sm:left-6 flex flex-col gap-2.5">
        {/* Radar Minimap */}
        <div className="relative h-24 w-24 rounded-2xl border border-white/15 bg-black/60 p-1 backdrop-blur-md overflow-hidden">
          {/* Radar sweep line */}
          <div className="animate-spin-slow pointer-events-none absolute inset-0 rounded-full border border-dashed border-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center Grid */}
            <div className="h-full w-px bg-white/10" />
            <div className="w-full h-px bg-white/10 absolute" />
          </div>

          {/* Zone Icons */}
          {/* Projects (North, z: 52) */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-sky-400">PRJ</span>
          {/* Skills (East, x: 55) */}
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-purple-400">SKL</span>
          {/* Journey (South, z: -55) */}
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400">EXP</span>
          {/* Services (West, x: -55) */}
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-pink-400">SRV</span>

          {/* Vehicle Dot */}
          {(() => {
            // Map world coord (-150 to 150) to minimap (0 to 96px)
            const mapX = THREE_MAP_BOUNDS(vehicleX);
            const mapZ = THREE_MAP_BOUNDS(-vehicleZ); // Invert Z for top-down radar
            return (
              <div
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#fff]"
                style={{
                  left: `${mapX}%`,
                  top: `${mapZ}%`,
                  transform: `translate(-50%, -50%) rotate(${heading}rad)`,
                }}
              >
                <div className="absolute top-0 left-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-1 bg-amber-400" />
              </div>
            );
          })()}
        </div>

        {/* Speedometer readout */}
        <div className="flex items-baseline gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <span className="font-mono text-xl font-black text-white">{speedKmh}</span>
          <span className="font-mono text-[10px] text-white/50 uppercase">KM/H</span>
        </div>
      </div>

      {/* ── Desktop Driving Instructions Hint (Bottom Left) ── */}
      <div className="hidden lg:flex pointer-events-auto absolute bottom-6 left-6 flex-col gap-1 rounded-2xl border border-white/10 bg-black/60 p-3.5 backdrop-blur-md text-xs text-white/70">
        <div className="font-semibold text-white/90 mb-1 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-[var(--site-accent)]" /> Controls
        </div>
        <div>Drive: <span className="font-mono text-white">W / ↑</span> & <span className="font-mono text-white">S / ↓</span></div>
        <div>Steer: <span className="font-mono text-white">A / ←</span> & <span className="font-mono text-white">D / →</span></div>
        <div>Boost / Drift: <span className="font-mono text-white">Shift / Space</span></div>
        <div>Honk: <span className="font-mono text-white">H</span></div>
      </div>

      {/* ── Mobile Touch Controls (Floating Ergonomic D-Pad) ── */}
      <div className="lg:hidden pointer-events-auto absolute bottom-4 inset-x-4 flex items-end justify-between">
        {/* Steering D-Pad (Left Side) */}
        <div className="flex gap-2">
          <button
            onTouchStart={() => onMobileInput("left", true)}
            onTouchEnd={() => onMobileInput("left", false)}
            onMouseDown={() => onMobileInput("left", true)}
            onMouseUp={() => onMobileInput("left", false)}
            aria-label="Steer Left"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/65 text-white active:bg-[var(--site-primary)]/80 backdrop-blur-lg shadow-xl"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button
            onTouchStart={() => onMobileInput("right", true)}
            onTouchEnd={() => onMobileInput("right", false)}
            onMouseDown={() => onMobileInput("right", true)}
            onMouseUp={() => onMobileInput("right", false)}
            aria-label="Steer Right"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/65 text-white active:bg-[var(--site-primary)]/80 backdrop-blur-lg shadow-xl"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Drive & Boost Buttons (Right Side) */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => onMobileInput("backward", true)}
            onTouchEnd={() => onMobileInput("backward", false)}
            onMouseDown={() => onMobileInput("backward", true)}
            onMouseUp={() => onMobileInput("backward", false)}
            aria-label="Reverse"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/65 text-white active:bg-rose-500/80 backdrop-blur-lg shadow-xl"
          >
            <ArrowDown className="h-6 w-6" />
          </button>

          <button
            onTouchStart={() => {
              onMobileInput("forward", true);
              onMobileInput("boost", true);
            }}
            onTouchEnd={() => onMobileInput("boost", false)}
            onMouseDown={() => {
              onMobileInput("forward", true);
              onMobileInput("boost", true);
            }}
            onMouseUp={() => onMobileInput("boost", false)}
            aria-label="Boost Drive"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--site-accent)]/50 bg-gradient-to-tr from-[var(--site-primary)] to-[var(--site-accent)] text-white active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.5)] backdrop-blur-lg"
          >
            <Zap className="h-6 w-6" />
          </button>

          <button
            onTouchStart={() => onMobileInput("forward", true)}
            onTouchEnd={() => onMobileInput("forward", false)}
            onMouseDown={() => onMobileInput("forward", true)}
            onMouseUp={() => onMobileInput("forward", false)}
            aria-label="Drive Forward"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/65 text-white active:bg-emerald-500/80 backdrop-blur-lg shadow-xl"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ── Interactive Zone Details Drawer / Dialog ── */}
      <AnimatePresence>
        {dialogTrigger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
            onClick={() => setDialogTrigger(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#120a22] p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setDialogTrigger(null)}
                aria-label="Close dialog"
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Dynamic Content based on Category */}
              {dialogTrigger.category === "project" && (
                <ProjectDetails project={dialogTrigger.details as Project} />
              )}
              {dialogTrigger.category === "skill" && (
                <SkillDetails skill={dialogTrigger.details as Skill} />
              )}
              {dialogTrigger.category === "experience" && (
                <ExperienceDetails exp={dialogTrigger.details as Experience} />
              )}
              {dialogTrigger.category === "service" && (
                <ServiceDetails service={dialogTrigger.details as Service} />
              )}
              {dialogTrigger.category === "welcome" && (
                <WelcomeDetails siteData={siteData} onExplore={() => setDialogTrigger(null)} />
              )}
              {dialogTrigger.category === "contact" && (
                <ContactDetails siteData={siteData} onClose={() => setDialogTrigger(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function THREE_MAP_BOUNDS(coord: number): number {
  // Map -150..150 to 8%..92% of radar bounds
  const normalized = (coord + 150) / 300;
  return Math.min(Math.max(normalized * 84 + 8, 8), 92);
}

/* ---------------- Dialog Sub-Views ---------------- */

function ProjectDetails({ project }: { project: Project }) {
  if (!project) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[var(--site-primary)]/20 px-3 py-1 font-mono text-[11px] font-semibold text-[var(--site-accent)]">
          Selected Project
        </span>
        {project.featured && (
          <span className="rounded-full bg-amber-400/20 px-3 py-1 font-mono text-[11px] font-semibold text-amber-300">
            ★ Featured
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl font-bold text-white">{project.title}</h3>

      {project.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
        </div>
      )}

      <p className="text-sm leading-relaxed text-white/70">{project.description}</p>

      <div className="flex flex-wrap gap-2 pt-2">
        {project.tags.split(",").map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-white/60">
            {t.trim()}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-5 py-2.5 text-xs font-bold text-white shadow-lg"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Github className="h-3.5 w-3.5" /> Source Code
          </a>
        )}
      </div>
    </div>
  );
}

function SkillDetails({ skill }: { skill: Skill }) {
  if (!skill) return null;
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs uppercase tracking-wider text-[var(--site-accent)]">
        Technical Skill
      </div>
      <h3 className="font-display text-3xl font-bold text-white">{skill.name}</h3>
      <p className="text-sm text-white/60">Category: {skill.category || "General"}</p>

      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs text-white/80 font-mono">
          <span>Proficiency Mastery</span>
          <span className="font-bold text-[var(--site-primary)]">{skill.level}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]"
            style={{ width: `${skill.level}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceDetails({ exp }: { exp: Experience }) {
  if (!exp) return null;
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs uppercase tracking-wider text-emerald-400">
        Career Milestone
      </div>
      <h3 className="font-display text-2xl font-bold text-white">{exp.role}</h3>
      <div className="text-sm font-medium text-[var(--site-accent)]">{exp.company} · {exp.period}</div>
      <p className="text-sm leading-relaxed text-white/70">{exp.description}</p>
    </div>
  );
}

function ServiceDetails({ service }: { service: Service }) {
  if (!service) return null;
  return (
    <div className="space-y-4">
      <div className="font-mono text-xs uppercase tracking-wider text-[var(--site-accent)]">
        Service Offering
      </div>
      <h3 className="font-display text-2xl font-bold text-white">{service.title}</h3>
      <p className="text-sm leading-relaxed text-white/70">{service.description}</p>
    </div>
  );
}

function WelcomeDetails({ siteData, onExplore }: { siteData: SiteData; onExplore: () => void }) {
  return (
    <div className="space-y-4 text-center sm:text-left">
      <div className="font-mono text-xs uppercase tracking-wider text-[var(--site-accent)]">
        Welcome to the 3D Playground
      </div>
      <h3 className="font-display text-3xl font-bold text-white">{siteData.settings.ownerName}</h3>
      <p className="text-sm leading-relaxed text-white/70">{siteData.settings.heroTagline}</p>

      <div className="grid grid-cols-2 gap-3 pt-3">
        {siteData.stats.slice(0, 4).map((st) => (
          <div key={st.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="font-display text-xl font-bold text-gradient">{st.value}{st.suffix}</div>
            <div className="text-[11px] text-white/50 uppercase tracking-wider">{st.label}</div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={onExplore}
          className="rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-6 py-2.5 text-xs font-bold text-white shadow-lg"
        >
          Keep Driving!
        </button>
      </div>
    </div>
  );
}

function ContactDetails({ siteData, onClose }: { siteData: SiteData; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="font-mono text-xs uppercase tracking-wider text-sky-400">
        Direct Contact Beacon
      </div>
      <h3 className="font-display text-2xl font-bold text-white">Let&apos;s Build Together</h3>
      <p className="text-xs text-white/60">
        Email: <a href={`mailto:${siteData.settings.email}`} className="text-sky-300 underline">{siteData.settings.email}</a>
      </p>

      {sent ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center text-sm font-semibold text-emerald-300">
          Message transmitted successfully to Salahuddin!
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 pt-2">
          <input
            required
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--site-primary)]"
          />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--site-primary)]"
          />
          <textarea
            required
            rows={3}
            placeholder="Project Details or Message"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--site-primary)]"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] py-3 text-xs font-bold text-white shadow-lg disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> {sending ? "Transmitting…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
