"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings2,
  Sparkles,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Wrench,
  MessageSquareQuote,
  Link2,
  TrendingUp,
  Mail,
  UserCog,
  X,
  LogOut,
  Eye,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import type { SiteData, Message } from "@/lib/types";
import { CountUp } from "@/components/portfolio/count-up";
import { SettingsManager } from "./managers/settings-manager";
import { MessagesManager } from "./managers/messages-manager";
import { AccountManager } from "./managers/account-manager";
import { CrudShell, type FieldDef } from "./shared/crud-shell";

type SectionId =
  | "overview"
  | "settings"
  | "skills"
  | "projects"
  | "experiences"
  | "education"
  | "services"
  | "testimonials"
  | "social-links"
  | "stats"
  | "messages"
  | "account";

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "settings", label: "Site Settings", icon: Settings2 },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "experiences", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "services", label: "Services", icon: Wrench },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "social-links", label: "Social Links", icon: Link2 },
  { id: "stats", label: "Hero Stats", icon: TrendingUp },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "account", label: "Account", icon: UserCog },
];

export function AdminDashboard({
  username,
  onLogout,
  onClose,
  siteData,
  refreshSite,
}: {
  username: string;
  onLogout: () => void;
  onClose: () => void;
  siteData: SiteData;
  refreshSite: () => void;
}) {
  const [section, setSection] = useState<SectionId>("overview");
  const [unread, setUnread] = useState(0);
  const [currentUsername, setCurrentUsername] = useState(username);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    onLogout();
  }

  async function refreshUnread() {
    try {
      const res = await fetch("/api/crud/messages", { cache: "no-store" });
      if (!res.ok) return;
      const list = (await res.json()) as Message[];
      setUnread(list.filter((m) => !m.read).length);
    } catch {}
  }

  // ping unread count on mount + when messages section closes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, not a sync setState
    refreshUnread();
  }, [section]);

  return (
    <div className="flex h-full overflow-hidden rounded-none border-white/10 bg-[#0d0a16] sm:rounded-3xl sm:border">
      {/* ---------- Sidebar ---------- */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-black/25 md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_8px_24px_-6px_rgba(139,92,246,0.7)]">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-white">Control Room</div>
            <div className="truncate text-xs text-white/40">Hi, {currentUsername}</div>
          </div>
          <button onClick={onClose} aria-label="Close admin" data-cursor className="ml-auto rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Admin sections">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              data-cursor
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                section === id ? "text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              {section === id && (
                <motion.span
                  layoutId="admin-nav-active"
                  transition={{ type: "spring", stiffness: 340, damping: 30 }}
                  className="absolute inset-0 rounded-xl border border-[var(--site-primary)]/30 bg-gradient-to-r from-[var(--site-primary)]/20 to-[var(--site-accent)]/10"
                />
              )}
              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10 flex-1">{label}</span>
              {id === "messages" && unread > 0 && (
                <span className="relative z-10 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/[0.06] p-3">
          <button
            onClick={onClose}
            data-cursor
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Eye className="h-4 w-4" /> View Site
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300/70 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 md:hidden">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as SectionId)}
            aria-label="Admin section"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none"
          >
            {NAV.map(({ id, label }) => (
              <option key={id} value={id} className="bg-[#14101f]">
                {label} {id === "messages" && unread > 0 ? `(${unread})` : ""}
              </option>
            ))}
          </select>
          <button onClick={onClose} aria-label="Close admin" className="glass rounded-xl p-2.5 text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          {/* ambient glow */}
          <div aria-hidden className="pointer-events-none sticky top-0 -z-10 h-40 w-full bg-gradient-to-b from-[var(--site-primary)]/[0.07] to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="p-5 sm:p-8"
            >
              {section === "overview" && (
                <Overview siteData={siteData} unread={unread} onGo={setSection} onLogout={handleLogout} />
              )}
              {section === "settings" && <SettingsManager settings={siteData.settings} onChanged={refreshSite} />}
              {section === "skills" && <SkillsManager onChanged={refreshSite} />}
              {section === "projects" && <ProjectsManager onChanged={refreshSite} />}
              {section === "experiences" && <ExperiencesManager onChanged={refreshSite} />}
              {section === "education" && <EducationManager onChanged={refreshSite} />}
              {section === "services" && <ServicesManager onChanged={refreshSite} />}
              {section === "testimonials" && <TestimonialsManager onChanged={refreshSite} />}
              {section === "social-links" && <SocialLinksManager onChanged={refreshSite} />}
              {section === "stats" && <StatsManager onChanged={refreshSite} />}
              {section === "messages" && <MessagesManager onChanged={refreshUnread} />}
              {section === "account" && (
                <AccountManager
                  username={currentUsername}
                  onUsernameChanged={(u) => setCurrentUsername(u)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview({
  siteData,
  unread,
  onGo,
  onLogout,
}: {
  siteData: SiteData;
  unread: number;
  onGo: (s: SectionId) => void;
  onLogout: () => void;
}) {
  const cards: { label: string; value: number; icon: typeof LayoutDashboard; section: SectionId }[] = [
    { label: "Projects", value: siteData.projects.length, icon: FolderGit2, section: "projects" },
    { label: "Skills", value: siteData.skills.length, icon: Sparkles, section: "skills" },
    { label: "Testimonials", value: siteData.testimonials.length, icon: MessageSquareQuote, section: "testimonials" },
    { label: "Services", value: siteData.services.length, icon: Wrench, section: "services" },
    { label: "Experience", value: siteData.experiences.length, icon: Briefcase, section: "experiences" },
    { label: "Unread Messages", value: unread, icon: Mail, section: "messages" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient">{siteData.settings.ownerName.split(" ")[0]}</span>
          </h3>
          <p className="mt-1 text-sm text-white/45">Everything you change here goes live instantly.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Log Out
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.button
            key={c.label}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            whileHover={{ y: -4 }}
            onClick={() => onGo(c.section)}
            data-cursor
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left transition-colors duration-300 hover:border-[var(--site-primary)]/40"
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--site-primary)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25" />
            <c.icon className="h-5 w-5 text-[var(--site-accent)]" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              <CountUp value={c.value} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/40">{c.label}</div>
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/60" />
          </motion.button>
        ))}
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <h4 className="flex items-center gap-2 font-display text-base font-semibold text-white">
          <ExternalLink className="h-4 w-4 text-[var(--site-accent)]" /> Quick tips
        </h4>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/50">
          <li>· Change your name, roles and tagline from <b className="text-white/75">Site Settings → Hero</b>.</li>
          <li>· Recolor the entire site (buttons, glows, cursor, particles) from <b className="text-white/75">Site Settings → Theme</b>.</li>
          <li>· Reorder any list with the ▲▼ arrows — the live site follows your order.</li>
          <li>· Change the default password from <b className="text-white/75">Account</b> after your first login.</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Thin CRUD managers ---------------- */

const inputHint = " ";

function SkillsManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "name", label: "Skill Name", type: "text", required: true, placeholder: "e.g. React / Next.js" },
    { name: "category", label: "Category", type: "text", placeholder: "Frontend / Backend / Design…" },
    { name: "level", label: "Proficiency", type: "number", placeholder: "0 – 100", hint: "0–100, powers the animated bar" },
    { name: "icon", label: "Icon", type: "icon" },
  ];
  return (
    <CrudShell
      entity="skills"
      title="Skills"
      description="Powers the animated skill bars and the scrolling marquee."
      fields={fields}
      defaults={{ category: "Other", level: 80, icon: "Sparkles" }}
      titleKey="name"
      subtitleKeys={["category", "level"]}
      onChanged={onChanged}
    />
  );
}

function ProjectsManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "title", label: "Project Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", placeholder: "What makes this project special?" },
    { name: "imageUrl", label: "Cover Image", type: "image" },
    { name: "tags", label: "Tech Tags", type: "text", placeholder: "React, Next.js, Prisma", hint: "Comma separated — powers the filter pills" },
    { name: "githubUrl", label: "GitHub URL", type: "url" },
    { name: "liveUrl", label: "Live Demo URL", type: "url" },
    { name: "featured", label: "Featured (gold badge)", type: "boolean" },
  ];
  return (
    <CrudShell
      entity="projects"
      title="Projects"
      description="Shown in the tilting, filterable project grid."
      fields={fields}
      defaults={{ featured: false }}
      titleKey="title"
      subtitleKeys={["tags", "featured"]}
      mediaKey="imageUrl"
      onChanged={onChanged}
    />
  );
}

function ExperiencesManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "role", label: "Role / Job Title", type: "text", required: true },
    { name: "company", label: "Company", type: "text", required: true },
    { name: "period", label: "Period", type: "text", placeholder: "2023 — Present" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "current", label: "Current role (pulsing badge)", type: "boolean" },
  ];
  return (
    <CrudShell
      entity="experiences"
      title="Experience"
      description="The animated timeline under 'Journey'."
      fields={fields}
      defaults={{ current: false }}
      titleKey="role"
      subtitleKeys={["company", "period", "current"]}
      onChanged={onChanged}
    />
  );
}

function EducationManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "degree", label: "Degree / Program", type: "text", required: true },
    { name: "institution", label: "Institution", type: "text", required: true },
    { name: "period", label: "Period", type: "text", placeholder: "2015 — 2019" },
    { name: "description", label: "Description", type: "textarea" },
  ];
  return (
    <CrudShell
      entity="education"
      title="Education"
      description="Shown in the Education tab of the timeline."
      fields={fields}
      defaults={{}}
      titleKey="degree"
      subtitleKeys={["institution", "period"]}
      onChanged={onChanged}
    />
  );
}

function ServicesManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "title", label: "Service Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "icon", label: "Icon", type: "icon" },
  ];
  return (
    <CrudShell
      entity="services"
      title="Services"
      description="The spotlight cards section."
      fields={fields}
      defaults={{ icon: "Sparkles" }}
      titleKey="title"
      subtitleKeys={[]}
      onChanged={onChanged}
    />
  );
}

function TestimonialsManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "name", label: "Person Name", type: "text", required: true },
    { name: "role", label: "Their Role", type: "text", placeholder: "Product Lead" },
    { name: "company", label: "Company", type: "text" },
    { name: "content", label: "Testimonial", type: "textarea", span: 2 },
    { name: "avatarUrl", label: "Avatar", type: "image" },
    { name: "rating", label: "Star Rating", type: "rating" },
  ];
  return (
    <CrudShell
      entity="testimonials"
      title="Testimonials"
      description="Client praise in the auto-playing carousel."
      fields={fields}
      defaults={{ rating: 5 }}
      titleKey="name"
      subtitleKeys={["role", "company"]}
      mediaKey="avatarUrl"
      onChanged={onChanged}
    />
  );
}

function SocialLinksManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "platform", label: "Platform", type: "text", required: true, placeholder: "GitHub / LinkedIn / X…" },
    { name: "url", label: "Profile URL", type: "url", required: true, placeholder: "https://…" },
    { name: "icon", label: "Icon", type: "icon" },
  ];
  return (
    <CrudShell
      entity="social-links"
      title="Social Links"
      description="Magnetic icon rows in the hero + footer."
      fields={fields}
      defaults={{ icon: "Link" }}
      titleKey="platform"
      subtitleKeys={["url"]}
      onChanged={onChanged}
    />
  );
}

function StatsManager({ onChanged }: { onChanged: () => void }) {
  const fields: FieldDef[] = [
    { name: "label", label: "Label", type: "text", required: true, placeholder: "Years of Experience" },
    { name: "value", label: "Number", type: "number", required: true, hint: "Animates from 0 when scrolled into view" },
    { name: "suffix", label: "Suffix", type: "text", placeholder: "+ / K / (blank)" },
  ];
  return (
    <CrudShell
      entity="stats"
      title="Hero Stats"
      description="The counting numbers under your hero intro."
      fields={fields}
      defaults={{ suffix: "+" }}
      titleKey="label"
      subtitleKeys={["value", "suffix"]}
      onChanged={onChanged}
    />
  );
}
