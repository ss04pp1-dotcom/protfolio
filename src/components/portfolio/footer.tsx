"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Heart, Github, Linkedin, Twitter, Dribbble, Mail, Link as LinkIcon } from "lucide-react";
import type { SiteSettings, SocialLink } from "@/lib/types";
import { NAV_SECTIONS } from "./navbar";
import { Magnetic } from "./magnetic";

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

export function Footer({ settings, socialLinks }: { settings: SiteSettings; socialLinks: SocialLink[] }) {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06]">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <div aria-hidden className="absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-[var(--site-primary)] opacity-[0.08] blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">
          {/* giant name */}
          <a href="#home" data-cursor className="group text-center">
            <span className="font-display text-4xl font-bold tracking-tight text-white/90 transition-all duration-500 group-hover:text-gradient sm:text-5xl md:text-6xl">
              {settings.ownerName}
            </span>
          </a>

          {/* nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {NAV_SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="group relative text-sm text-white/45 transition-colors duration-250 hover:text-white"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* socials */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => {
              const Icon = socialIcon(s.platform || s.icon);
              return (
                <Magnetic key={s.id} strength={0.5}>
                  <motion.a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    data-cursor
                    whileHover={{ y: -4, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 320, damping: 14 }}
                    className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-white/60 transition-colors duration-300 hover:border-[var(--site-accent)]/50 hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </motion.a>
                </Magnetic>
              );
            })}
          </div>

          {/* bottom bar */}
          <div className="flex w-full flex-col items-center gap-3 border-t border-white/[0.06] pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} {settings.ownerName}. {settings.footerText}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-white/40">
              Crafted with
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              </motion.span>
              and Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function BackToTop() {
  return (
    <AnimatePresence>
      <motion.a
        href="#home"
        aria-label="Back to top"
        initial={{ opacity: 0, scale: 0.6, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: 16 }}
        data-cursor
        className="fixed bottom-6 right-6 z-[85] flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white shadow-[0_12px_36px_-10px_rgba(139,92,246,0.75)] transition-transform duration-300 hover:scale-110"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.a>
    </AnimatePresence>
  );
}
