"use client";

import {
  ArrowRight,
  ArrowUp,
  Download,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
  Mail,
  Link as LinkIcon,
  MapPin,
  Phone,
  Sparkles,
  Star,
  GraduationCap,
  ExternalLink,
  Rocket,
  Palette,
  Code2,
  Layers,
} from "lucide-react";
import type { SiteData, SocialLink } from "@/lib/types";
import { ZONE_META } from "./world-builder";
import { Typewriter } from "../typewriter";
import { CountUp } from "../count-up";
import { Magnetic } from "../magnetic";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const SOCIAL_ICONS: Record<string, typeof Github> = {
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
  const found = Object.entries(SOCIAL_ICONS).find(([k]) => key.includes(k));
  return found ? found[1] : SOCIAL_ICONS.default;
}

const SERVICE_ICONS: Record<string, typeof Code2> = {
  code2: Code2,
  palette: Palette,
  sparkles: Sparkles,
  rocket: Rocket,
  layers: Layers,
  default: Code2,
};

function serviceIcon(icon: string) {
  return SERVICE_ICONS[(icon || "").toLowerCase()] || SERVICE_ICONS.default;
}

const CARD_BASE =
  "glass-strong relative overflow-hidden rounded-3xl border border-white/15 bg-[#0c0918]/85 p-6 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-7";

function PanelShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${CARD_BASE} panel-scroll max-h-[56vh] overflow-y-auto sm:max-h-[76vh] ${className}`}>
      {/* top neon hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--site-accent)] to-transparent"
      />
      {children}
    </div>
  );
}

function ZoneTag({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-mono text-[10px] font-bold tracking-[0.35em] text-[var(--site-accent)]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="h-px w-8 bg-gradient-to-r from-[var(--site-accent)] to-transparent" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
        {title}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zone panels                                                         */
/* ------------------------------------------------------------------ */

function HeroPanel({
  siteData,
  onScrollTo,
}: {
  siteData: SiteData;
  onScrollTo: (zone: number) => void;
}) {
  const { settings, socialLinks, stats } = siteData;
  const roles = settings.heroRoles.split(",").map((r) => r.trim()).filter(Boolean);
  return (
    <PanelShell className="text-center">
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-4 py-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-medium tracking-wide text-white/85">
          {settings.availability}
        </span>
      </div>

      <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-white/55 sm:text-sm">
        {settings.heroGreeting}
      </p>

      <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
        <span className="text-gradient">{settings.ownerName}</span>
      </h1>

      <div className="mt-4 flex min-h-[2.2em] flex-wrap items-center justify-center gap-x-2.5 font-display text-lg font-medium text-white/90 sm:text-2xl">
        <span className="text-white/50">I&apos;m a</span>
        <Typewriter
          words={roles.length ? roles : ["Full-Stack Developer"]}
          className="text-gradient font-semibold"
        />
      </div>

      <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
        {settings.heroTagline}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
        <Magnetic>
          <button
            onClick={() => onScrollTo(3)}
            data-cursor
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.65)]"
          >
            <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            Explore My Universe
            <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </button>
        </Magnetic>
        <Magnetic>
          <button
            onClick={() => onScrollTo(7)}
            data-cursor
            className="glass inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white/90 transition-all hover:border-[var(--site-accent)] hover:text-white"
          >
            Get In Touch
            <ArrowRight className="h-4 w-4" />
          </button>
        </Magnetic>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {socialLinks.map((s) => {
          const Icon = socialIcon(s.platform || s.icon);
          return (
            <Magnetic key={s.id} strength={0.45}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                data-cursor
                className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white/65 transition-all hover:-translate-y-1 hover:border-[var(--site-primary)]/60 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            </Magnetic>
          );
        })}
      </div>

      {stats.length > 0 && (
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
          {stats.slice(0, 4).map((st) => (
            <div key={st.id}>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">
                <CountUp value={st.value} suffix={st.suffix} className="text-gradient" />
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  );
}

function AboutPanel({ siteData }: { siteData: SiteData }) {
  const { settings, stats } = siteData;
  return (
    <PanelShell>
      <ZoneTag index={1} title="About Me" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        {settings.aboutTitle}
      </h2>
      <div className="mt-4 space-y-3.5">
        {settings.aboutText.split("\n").map((para, i) => (
          <p key={i} className="text-pretty text-sm leading-relaxed text-white/65">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {stats.slice(0, 4).map((st) => (
          <div
            key={st.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <div className="font-display text-lg font-bold text-gradient">
              <CountUp value={st.value} suffix={st.suffix} />
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">
              {st.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-[var(--site-accent)]" />
        <span className="text-xs text-white/70">{settings.location}</span>
      </div>
    </PanelShell>
  );
}

function SkillsPanel({ siteData }: { siteData: SiteData }) {
  const skills = siteData.skills.slice(0, 8);
  return (
    <PanelShell>
      <ZoneTag index={2} title="Skills Orbit" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        Tech that powers the journey
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Each cube orbiting the core is sized by mastery — the bigger, the deeper the expertise.
      </p>
      <div className="mt-5 space-y-4">
        {skills.map((sk) => (
          <div key={sk.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-white/90">{sk.name}</span>
              <span className="font-mono text-xs text-[var(--site-accent)]">{sk.level}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_0_12px_rgba(139,92,246,0.7)]"
                style={{ width: `${Math.min(sk.level, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function ProjectsPanel({ siteData }: { siteData: SiteData }) {
  const projects = siteData.projects.slice(0, 4);
  return (
    <PanelShell>
      <ZoneTag index={3} title="Project Gallery" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        Selected work, floating in orbit
      </h2>
      <div className="mt-5 space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-[var(--site-primary)]/50 hover:bg-white/[0.07]"
          >
            <div className="flex gap-4">
              {proj.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 shrink-0 rounded-xl border border-white/10 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-base font-bold text-white">
                    {proj.title}
                  </h3>
                  {proj.featured && (
                    <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">
                  {proj.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {proj.tags.split(",").slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[9px] text-white/55"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-3.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  <ExternalLink className="h-3 w-3" /> Live Demo
                </a>
              )}
              {proj.githubUrl && (
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="glass inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-white/80 hover:text-white"
                >
                  <Github className="h-3 w-3" /> Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function JourneyPanel({ siteData }: { siteData: SiteData }) {
  const { experiences, education } = siteData;
  return (
    <PanelShell>
      <ZoneTag index={4} title="The Journey" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        Milestones along the path
      </h2>
      <div className="relative mt-5 space-y-5 border-l border-white/10 pl-5">
        {experiences.slice(0, 4).map((exp) => (
          <div key={exp.id} className="relative">
            <span
              className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${
                exp.current
                  ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                  : "bg-[var(--site-primary)] shadow-[0_0_10px_rgba(139,92,246,0.8)]"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-white">{exp.role}</h3>
              {exp.current && (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  Current
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-semibold text-[var(--site-accent)]">
              {exp.company} · <span className="text-white/50">{exp.period}</span>
            </p>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-white/60">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
      {education.length > 0 && (
        <>
          <div className="mt-6 mb-4 flex items-center gap-2.5">
            <GraduationCap className="h-4 w-4 text-[var(--site-accent)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              Education
            </span>
          </div>
          <div className="space-y-3">
            {education.slice(0, 2).map((ed) => (
              <div
                key={ed.id}
                className="rounded-2xl border border-sky-400/25 bg-sky-400/[0.06] p-4"
              >
                <h3 className="font-display text-sm font-bold text-white">{ed.degree}</h3>
                <p className="mt-0.5 text-xs text-sky-300/80">
                  {ed.institution} · {ed.period}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelShell>
  );
}

function ServicesPanel({ siteData }: { siteData: SiteData }) {
  const services = siteData.services.slice(0, 4);
  return (
    <PanelShell>
      <ZoneTag index={5} title="Services" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        What I can build for you
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {services.map((sv) => {
          const Icon = serviceIcon(sv.icon);
          return (
            <div
              key={sv.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--site-accent)]/50"
            >
              <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] shadow-lg">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-display text-sm font-bold text-white">{sv.title}</h3>
              <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-white/60">
                {sv.description}
              </p>
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}

function TestimonialsPanel({ siteData }: { siteData: SiteData }) {
  const testimonials = siteData.testimonials.slice(0, 3);
  return (
    <PanelShell>
      <ZoneTag index={6} title="Kind Words" />
      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        Voices from the journey
      </h2>
      <div className="mt-5 space-y-4">
        {testimonials.map((tm) => (
          <figure
            key={tm.id}
            className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="mb-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${
                    s < tm.rating ? "fill-amber-400 text-amber-400" : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <blockquote className="text-xs italic leading-relaxed text-white/70">
              &ldquo;{tm.content}&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              {tm.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tm.avatarUrl}
                  alt={tm.name}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-white/15 object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] font-display text-[11px] font-bold text-white">
                  {tm.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              )}
              <div>
                <div className="text-xs font-semibold text-white">{tm.name}</div>
                <div className="text-[10px] text-white/50">
                  {tm.role}
                  {tm.company ? ` · ${tm.company}` : ""}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </PanelShell>
  );
}

function ContactPanel({
  siteData,
  onScrollTo,
}: {
  siteData: SiteData;
  onScrollTo: (zone: number) => void;
}) {
  const { settings, socialLinks } = siteData;
  return (
    <PanelShell className="text-center">
      <ZoneTag index={7} title="Final Destination" />
      <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
        Let&apos;s build something{" "}
        <span className="text-gradient">extraordinary</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
        The portal is open — reach out and let&apos;s turn your next idea into a flagship
        product.
      </p>

      <div className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
        <a
          href={`mailto:${settings.email}`}
          data-cursor
          className="glass flex items-center gap-3 rounded-2xl border border-white/12 px-4 py-3 transition-all hover:border-[var(--site-primary)]/60"
        >
          <Mail className="h-4 w-4 shrink-0 text-[var(--site-accent)]" />
          <span className="truncate text-sm text-white/85">{settings.email}</span>
        </a>
        {settings.phone && (
          <div className="glass flex items-center gap-3 rounded-2xl border border-white/12 px-4 py-3">
            <Phone className="h-4 w-4 shrink-0 text-[var(--site-accent)]" />
            <span className="text-sm text-white/85">{settings.phone}</span>
          </div>
        )}
        <div className="glass flex items-center gap-3 rounded-2xl border border-white/12 px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--site-accent)]" />
          <span className="text-sm text-white/85">{settings.location}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {socialLinks.map((s) => {
          const Icon = socialIcon(s.platform || s.icon);
          return (
            <Magnetic key={s.id} strength={0.45}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                data-cursor
                className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-white/65 transition-all hover:-translate-y-1 hover:border-[var(--site-primary)]/60 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            </Magnetic>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Magnetic>
          <a
            href={`mailto:${settings.email}`}
            data-cursor
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.65)]"
          >
            <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            Send a Message
            <Mail className="h-4 w-4" />
          </a>
        </Magnetic>
        {settings.resumeUrl && (
          <Magnetic>
            <a
              href={settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="glass inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/85 hover:text-white"
            >
              <Download className="h-4 w-4 text-[var(--site-accent)]" />
              Resume
            </a>
          </Magnetic>
        )}
      </div>

      <button
        onClick={() => onScrollTo(0)}
        data-cursor
        className="mx-auto mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[var(--site-accent)]"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        Back to the beginning
      </button>
    </PanelShell>
  );
}

/* ------------------------------------------------------------------ */
/* ZonePanels — positioned shells driven per-frame by the scene loop   */
/* ------------------------------------------------------------------ */

/** Static positioning per panel side (motion is applied to inner element). */
const SIDE_CLASS: Record<string, string> = {
  center:
    "left-1/2 top-1/2 w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2",
  left: "inset-x-3 bottom-[5.5rem] sm:bottom-auto sm:left-[4.5%] sm:right-auto sm:top-1/2 sm:w-[25rem] sm:-translate-y-1/2 lg:w-[27rem]",
  right:
    "inset-x-3 bottom-[5.5rem] sm:bottom-auto sm:right-[4.5%] sm:left-auto sm:top-1/2 sm:w-[25rem] sm:-translate-y-1/2 lg:w-[27rem]",
};

export function ZonePanels({
  siteData,
  registerPanel,
  onScrollTo,
}: {
  siteData: SiteData;
  registerPanel: (index: number, el: HTMLDivElement | null) => void;
  onScrollTo: (zone: number) => void;
}) {
  const panels: React.ReactNode[] = [
    <HeroPanel key="hero" siteData={siteData} onScrollTo={onScrollTo} />,
    <AboutPanel key="about" siteData={siteData} />,
    <SkillsPanel key="skills" siteData={siteData} />,
    <ProjectsPanel key="projects" siteData={siteData} />,
    <JourneyPanel key="journey" siteData={siteData} />,
    <ServicesPanel key="services" siteData={siteData} />,
    <TestimonialsPanel key="testimonials" siteData={siteData} />,
    <ContactPanel key="contact" siteData={siteData} onScrollTo={onScrollTo} />,
  ];

  return (
    <>
      {ZONE_META.map((zone, i) => (
        <div
          key={zone.id}
          ref={(el) => registerPanel(i, el)}
          className={`absolute z-20 ${SIDE_CLASS[zone.panelSide]}`}
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <div className="will-change-transform" style={{ transform: "translate3d(0,44px,0)" }}>
            {panels[i]}
          </div>
        </div>
      ))}
    </>
  );
}
