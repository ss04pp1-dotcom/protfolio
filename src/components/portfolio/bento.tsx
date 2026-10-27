"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Star, Wand2 } from "lucide-react";
import type { Project, Skill, SiteSettings, Stat } from "@/lib/types";
import { SectionHeading, Accent } from "./section-heading";
import { StaggerGroup, StaggerItem } from "./reveal";
import { CountUp } from "./count-up";
import { Magnetic } from "./magnetic";

/**
 * Bento — "Highlights" grid: featured project, hero stat, an orbiting
 * tech-stack ring, mini stat tiles and a magnetic CTA banner. All content
 * is admin-editable (stats / skills / projects / settings).
 */
export function Bento({
  settings,
  stats,
  skills,
  projects,
}: {
  settings: SiteSettings;
  stats: Stat[];
  skills: Skill[];
  projects: Project[];
}) {
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const heroStat = stats[0];
  const miniStats = stats.slice(1, 5);
  const orbitSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);

  const nothing = !featured && !heroStat && orbitSkills.length === 0;
  if (nothing) return null;

  const initials = settings.ownerName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section id="highlights" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div aria-hidden className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[var(--site-primary)] opacity-[0.06] blur-[110px]" />

      <SectionHeading
        eyebrow="By The Numbers"
        title={
          <>
            The <Accent>Highlights</Accent>
          </>
        }
        description="A quick snapshot — scroll, hover and watch every tile come alive."
        index={2}
      />

      <StaggerGroup className="mt-16 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6" stagger={0.09}>
        {/* ── Featured project — tall showcase tile ─────────────────── */}
        {featured && (
          <StaggerItem className="sm:col-span-2 lg:col-span-3 lg:row-span-2">
            <motion.a
              href="#projects"
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              data-cursor
              className="conic-hover group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#181227] to-[#0e0b17] p-7"
            >
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  loading="lazy"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  className="absolute inset-0 h-full w-full object-cover opacity-45 transition-all duration-700 group-hover:scale-105 group-hover:opacity-55"
                />
              ) : (
                <span aria-hidden className="text-gradient font-display absolute inset-0 flex items-center justify-center text-[11rem] font-bold opacity-15 transition-transform duration-700 group-hover:scale-110">
                  {featured.title.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0913]/95 via-[#0c0913]/30 to-transparent" />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold text-black shadow-lg">
                  <Star className="h-3 w-3 fill-black" /> Featured
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{featured.title}</h3>
                <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/55">{featured.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--site-accent)]">
                  Explore the work
                  <span className="glass flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </div>
            </motion.a>
          </StaggerItem>
        )}

        {/* ── Hero stat — oversized count-up ────────────────────────── */}
        {heroStat && (
          <StaggerItem className="sm:col-span-2 lg:col-span-3">
            <div
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                el.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              data-cursor
              className="spotlight-card glass group relative flex h-full items-center justify-between gap-6 overflow-hidden rounded-3xl p-7 transition-colors duration-300 hover:border-[var(--site-primary)]/40"
            >
              <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 animate-spin-slow rounded-full border border-dashed border-white/10 [animation-duration:22s]" />
              <div aria-hidden className="absolute -bottom-14 -right-14 h-44 w-44 rounded-full bg-[var(--site-primary)] opacity-15 blur-3xl" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">Milestone</p>
                <p className="mt-2 font-display text-5xl font-bold text-gradient sm:text-6xl">
                  <CountUp value={heroStat.value} suffix={heroStat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-white/60">{heroStat.label}</p>
              </div>
              <motion.span
                animate={{ rotate: [0, 8, -6, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)]/30 to-[var(--site-accent)]/30 text-[var(--site-accent)] sm:flex"
              >
                <Sparkles className="h-7 w-7" />
              </motion.span>
            </div>
          </StaggerItem>
        )}

        {/* ── Tech orbit — rotating ring of top skills ──────────────── */}
        {orbitSkills.length > 0 && (
          <StaggerItem className="sm:col-span-2 lg:col-span-3">
            <div className="glass relative flex h-full min-h-[21rem] flex-col items-center justify-center overflow-hidden rounded-3xl p-7">
              <p className="absolute left-6 top-6 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">Tech Orbit</p>
              <div className="relative mx-auto aspect-square w-full max-w-[248px]">
                {/* rotating dashed rings */}
                <div aria-hidden className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-white/15 [animation-duration:16s]" />
                <div aria-hidden className="absolute inset-6 rounded-full border border-white/[0.07]" />
                {/* orbiting skill chips (counter-spun to stay upright) */}
                <div className="absolute inset-0 animate-spin-slow [animation-duration:16s]">
                  {orbitSkills.map((s, i, arr) => {
                    const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
                    const left = 50 + 47 * Math.cos(angle);
                    const top = 50 + 47 * Math.sin(angle);
                    return (
                      <span
                        key={s.id}
                        className="absolute"
                        style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <span className="glass block animate-spin-slow whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[10px] font-medium text-white/70 shadow-md [animation-direction:reverse] [animation-duration:16s]">
                          {s.name}
                        </span>
                      </span>
                    );
                  })}
                </div>
                {/* center core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="gradient-border animate-pulse-ring relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#1a1428] to-[#100c1a] font-display text-xl font-bold text-gradient">
                    {initials || "★"}
                    <span aria-hidden className="absolute inset-0 rounded-full bg-[var(--site-primary)] opacity-20 blur-xl" />
                  </span>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-white/35">Core stack, in constant motion — like me.</p>
            </div>
          </StaggerItem>
        )}

        {/* ── Mini stat tiles ───────────────────────────────────────── */}
        {miniStats.length > 0 && (
          <StaggerItem className="sm:col-span-2 lg:col-span-4">
            <div className="grid h-full grid-cols-2 gap-5">
              {miniStats.map((stat) => (
                <div
                  key={stat.id}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const r = el.getBoundingClientRect();
                    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                    el.style.setProperty("--my", `${e.clientY - r.top}px`);
                  }}
                  data-cursor
                  className="spotlight-card glass group flex flex-col items-start justify-center rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-accent)]/40"
                >
                  <p className="font-display text-3xl font-bold text-white transition-colors duration-300 group-hover:text-gradient sm:text-4xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </StaggerItem>
        )}

        {/* ── CTA banner ────────────────────────────────────────────── */}
        <StaggerItem className="sm:col-span-2 lg:col-span-2">
          <div className="group relative flex h-full min-h-[13rem] flex-col items-start justify-between overflow-hidden rounded-3xl border border-[var(--site-primary)]/25 bg-gradient-to-br from-[var(--site-primary)]/15 to-[var(--site-accent)]/10 p-7">
            <div aria-hidden className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--site-accent)] opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
            <span aria-hidden className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white shadow-lg transition-transform duration-400 group-hover:rotate-[-8deg] group-hover:scale-110">
                <Wand2 className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold leading-snug text-white">
                Have an idea <span className="font-serif italic text-gradient">worth building?</span>
              </h3>
              <p className="mt-2 text-sm text-white/55">{settings.availability} — let&apos;s talk.</p>
            </div>
            <Magnetic strength={0.4}>
              <a
                href="#contact"
                data-cursor
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0c0913] shadow-[0_10px_30px_-8px_rgba(255,255,255,0.35)] transition-transform duration-300 hover:scale-105"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Magnetic>
          </div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
