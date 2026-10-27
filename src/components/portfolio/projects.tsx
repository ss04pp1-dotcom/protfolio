"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, Star, X, Layers3 } from "lucide-react";
import type { Project } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Tilt } from "./tilt";

function parseTags(tags: string): string[] {
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export function Projects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const tags = useMemo(() => {
    const all = new Set<string>();
    projects.forEach((p) => parseTags(p.tags).forEach((t) => all.add(t)));
    return ["All", ...Array.from(all).slice(0, 9)];
  }, [projects]);

  const visible = filter === "All" ? projects : projects.filter((p) => parseTags(p.tags).includes(filter));

  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div aria-hidden className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[var(--site-accent)] opacity-[0.06] blur-[120px]" />

      <SectionHeading
        eyebrow="Selected Work"
        title="Projects That Speak"
        description="Filter by technology, tilt the cards, open one for the full story — every project shipped with obsessive attention to detail."
      />

      {/* filter pills */}
      <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            data-cursor
            className={`relative rounded-full px-4.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
              filter === tag ? "text-white" : "glass text-white/55 hover:text-white"
            }`}
          >
            {filter === tag && (
              <motion.span
                layoutId="project-filter-pill"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_8px_26px_-8px_rgba(217,70,239,0.65)]"
              />
            )}
            <span className="relative z-10">{tag}</span>
          </button>
        ))}
      </Reveal>

      {/* grid */}
      <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={project.featured ? "md:col-span-1 xl:col-span-1" : ""}
            >
              <Tilt max={7} className="group h-full">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(project)}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(project)}
                  data-cursor
                  className="glass relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl transition-all duration-400 hover:-translate-y-1.5 hover:border-[var(--site-primary)]/50 hover:shadow-[0_24px_70px_-24px_rgba(139,92,246,0.6)]"
                >
                  {/* cover */}
                  <div className="relative h-52 shrink-0 overflow-hidden">
                    <ProjectCover project={project} />
                    {/* hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-t from-[#0a0812]/95 via-[#0a0812]/40 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                      <span className="glass flex h-11 w-11 translate-y-3 items-center justify-center rounded-full text-white transition-all duration-400 group-hover:translate-y-0" style={{ transitionDelay: "60ms" }}>
                        <Layers3 className="h-4.5 w-4.5" />
                      </span>
                    </div>
                    {project.featured && (
                      <span className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold text-black shadow-lg">
                        <Star className="h-3 w-3 fill-black" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* body */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-gradient">
                      {project.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-white/50">{project.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {parseTags(project.tags).slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/55 transition-colors duration-300 group-hover:border-[var(--site-primary)]/35 group-hover:text-white/75">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-16 text-center text-white/40">No projects in this category yet.</p>
      )}

      {/* details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelected(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.88, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-3xl shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.title} details`}
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                data-cursor
                className="glass absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all duration-300 hover:rotate-90 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="relative h-56 overflow-hidden rounded-t-3xl sm:h-72">
                <ProjectCover project={selected} big />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14101f] via-transparent to-transparent" />
                {selected.featured && (
                  <span className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-black" /> Featured Project
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-9">
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{selected.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parseTags(selected.tags).map((t) => (
                    <span key={t} className="rounded-full border border-[var(--site-primary)]/30 bg-[var(--site-primary)]/10 px-3.5 py-1.5 font-mono text-xs text-white/75">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-6 leading-relaxed text-white/60">{selected.description}</p>

                <div className="mt-8 flex flex-wrap gap-3.5">
                  {selected.liveUrl && (
                    <a
                      href={selected.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)]"
                    >
                      <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                      Live Demo
                    </a>
                  )}
                  {selected.githubUrl && (
                    <a
                      href={selected.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white/85 transition-all duration-300 hover:border-white/30 hover:text-white"
                    >
                      <Github className="h-4 w-4" />
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectCover({ project, big = false }: { project: Project; big?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initial = project.title.charAt(0).toUpperCase();

  if (!project.imageUrl || failed) {
    return (
      <div className="bg-grid relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1b1530] via-[#151022] to-[#0f0b18]">
        <span className="text-gradient font-display text-8xl font-bold opacity-90">{initial}</span>
        <div className="absolute inset-0 animate-gradient-pan bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(217,70,239,0.15),transparent_55%)] [background-size:220%_220%]" />
      </div>
    );
  }
  return (
    <img
      src={project.imageUrl}
      alt={project.title}
      onError={() => setFailed(true)}
      loading="lazy"
      className={`h-full w-full object-cover transition-transform duration-700 ${big ? "" : "group-hover:scale-110"}`}
    />
  );
}
