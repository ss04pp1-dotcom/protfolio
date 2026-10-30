"use client";

import { Layers, ShieldCheck, ChevronDown, Compass } from "lucide-react";
import { ZONE_META, type ZoneMeta } from "./world-builder";

export function WorldHud({
  ownerName,
  zones,
  activeZone,
  onZoneClick,
  onAdminClick,
  onToggleClassicMode,
  registerProgressEl,
  registerHintEl,
}: {
  ownerName: string;
  zones: ZoneMeta[];
  activeZone: number;
  onZoneClick: (zone: number) => void;
  onAdminClick: () => void;
  onToggleClassicMode: () => void;
  registerProgressEl: (el: HTMLDivElement | null) => void;
  registerHintEl: (el: HTMLDivElement | null) => void;
}) {
  const current = zones[activeZone] ?? zones[0];

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="pointer-events-auto flex items-start justify-between gap-3 p-4 sm:items-center sm:p-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--site-primary)]/50 bg-[#120c24]/90 shadow-[0_0_24px_rgba(139,92,246,0.5)] backdrop-blur-md">
            <Compass className="h-4 w-4 text-[var(--site-accent)]" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              {ownerName}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--site-accent)]">
              3D Immersive Portfolio
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleClassicMode}
            title="Switch to classic scroll site"
            aria-label="Switch to classic view"
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:border-[var(--site-primary)]/60 hover:bg-white/20"
          >
            <Layers className="h-3.5 w-3.5 text-[var(--site-accent)]" />
            <span className="hidden sm:inline">Classic View</span>
            <span className="sm:hidden">2D</span>
          </button>
          <button
            onClick={onAdminClick}
            title="Admin panel"
            aria-label="Open admin panel"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:border-[var(--site-accent)] hover:text-white"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Right Zone Navigation (desktop) ── */}
      <nav
        aria-label="World zones"
        className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 md:flex"
      >
        {zones.map((zone, i) => {
          const active = i === activeZone;
          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(i)}
              aria-label={`Jump to ${zone.label}`}
              aria-current={active ? "true" : undefined}
              className="group flex items-center gap-2.5"
            >
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.25em] transition-all duration-300 ${
                  active
                    ? "text-white opacity-100"
                    : "text-white/50 opacity-0 group-hover:opacity-100"
                }`}
              >
                {zone.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active
                    ? "h-2.5 w-7 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_0_14px_rgba(139,92,246,0.8)]"
                    : "h-2.5 w-2.5 bg-white/25 group-hover:bg-white/60"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* ── Scroll Hint ── */}
      <div
        ref={registerHintEl}
        className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/55 px-5 py-2.5 backdrop-blur-md">
          <ChevronDown className="h-4 w-4 animate-bounce text-[var(--site-accent)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/75">
            Scroll to explore
          </span>
        </div>
      </div>

      {/* ── Bottom Progress Rail ── */}
      <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex items-end justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                {String(activeZone + 1).padStart(2, "0")}
                <span className="text-white/25"> / {String(zones.length).padStart(2, "0")}</span>
              </span>
              <span className="font-display text-sm font-bold text-white">{current?.label}</span>
            </div>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/35 sm:block">
              {current?.panelSide === "center" ? "Overview" : "Exhibit"} Zone
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              ref={registerProgressEl}
              className="h-full w-0 rounded-full bg-gradient-to-r from-[var(--site-primary)] via-[var(--site-accent)] to-[var(--site-primary)] shadow-[0_0_10px_rgba(217,70,239,0.6)]"
            />
          </div>
          {/* Mobile zone chips */}
          <div className="pointer-events-auto mt-3 flex gap-1.5 overflow-x-auto pb-0.5 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {zones.map((zone, i) => (
              <button
                key={zone.id}
                onClick={() => onZoneClick(i)}
                className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider transition-all ${
                  i === activeZone
                    ? "bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] text-white"
                    : "border border-white/15 bg-black/50 text-white/55"
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cinematic vignette ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_55%,rgba(4,3,10,0.55)_100%)]"
      />
    </div>
  );
}
