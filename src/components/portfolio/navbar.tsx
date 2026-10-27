"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, ShieldCheck, Sparkles } from "lucide-react";
import { Magnetic } from "./magnetic";

export const NAV_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "journey", label: "Journey" },
  { id: "services", label: "Services" },
  { id: "testimonials", label: "Praise" },
  { id: "contact", label: "Contact" },
] as const;

export function Navbar({
  ownerName,
  onAdminClick,
}: {
  ownerName: string;
  onAdminClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 140 && y > prev && !menuOpen);
  });

  // active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initials = ownerName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`fixed inset-x-0 top-0 z-[80] transition-colors duration-300 ${
          scrolled ? "glass-strong shadow-[0_8px_40px_rgba(0,0,0,0.35)]" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          {/* Logo */}
          <a href="#home" className="group flex items-center gap-2.5" data-cursor>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] font-display text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
              {initials || "AR"}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] opacity-40 blur-md transition-opacity group-hover:opacity-70" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              {ownerName.split(" ")[0] || "Portfolio"}
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    active === id ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] transition-all duration-300 ${
                      active === id ? "opacity-0" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Admin button */}
            <Magnetic strength={0.25}>
              <button
                onClick={onAdminClick}
                data-cursor
                className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition-all duration-300 hover:border-[var(--site-primary)]/50 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.3)] sm:flex"
              >
                <ShieldCheck className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:text-[var(--site-accent)]" />
                Admin
              </button>
            </Magnetic>

            {/* Mobile menu toggle */}
            <button
              className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[120] flex flex-col bg-[#0a0812]/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <span className="font-display text-lg font-semibold text-white">Menu</span>
              <button
                className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-1 flex-col items-center justify-center gap-1 px-6 pb-16">
              {NAV_SECTIONS.map(({ id, label }, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ delay: 0.05 + i * 0.055, duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <a
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-3 py-2.5 font-display text-3xl font-bold transition-colors ${
                      active === id ? "text-gradient" : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-70" />
                    {label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 + NAV_SECTIONS.length * 0.055, duration: 0.45 }}
                className="mt-8"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAdminClick();
                  }}
                  className="flex items-center gap-2 rounded-full border border-[var(--site-primary)]/40 bg-[var(--site-primary)]/10 px-6 py-3 font-medium text-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
