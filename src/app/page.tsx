"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SiteData } from "@/lib/types";
import { PortfolioSite } from "@/components/portfolio/portfolio-site";
import { Preloader } from "@/components/portfolio/preloader";
import { CustomCursor } from "@/components/portfolio/custom-cursor";
import { ParticleField } from "@/components/portfolio/particle-field";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { AdminGate } from "@/components/admin/admin-gate";

/** Fallback content shown before the first successful data fetch. */
const FALLBACK: SiteData = {
  settings: {
    siteTitle: "Portfolio — Creative Developer",
    ownerName: "Your Name",
    heroGreeting: "Hello, I'm",
    heroRoles: "Full-Stack Developer, Creative Coder",
    heroTagline: "",
    avatarUrl: "",
    aboutTitle: "About Me",
    aboutText: "",
    resumeUrl: "",
    email: "",
    phone: "",
    location: "",
    availability: "Available for work",
    primaryColor: "#8b5cf6",
    accentColor: "#d946ef",
    marqueeText: "",
    footerText: "",
  },
  skills: [],
  projects: [],
  experiences: [],
  education: [],
  services: [],
  testimonials: [],
  socialLinks: [],
  stats: [],
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [preloading, setPreloading] = useState(true);
  const [site, setSite] = useState<SiteData>(FALLBACK);
  const [fetchError, setFetchError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const refreshSite = useCallback(async () => {
    try {
      const res = await fetch("/api/site-data", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SiteData;
      if (data.settings) setSite(data);
      setFetchError(false);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSite();
  }, [refreshSite]);

  // live theme colors + tab title from settings
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--site-primary", site.settings.primaryColor || "#8b5cf6");
    root.style.setProperty("--site-accent", site.settings.accentColor || "#d946ef");
    if (site.settings.siteTitle) document.title = site.settings.siteTitle;
  }, [site.settings.primaryColor, site.settings.accentColor, site.settings.siteTitle]);

  // lock page scroll while admin overlay is open
  useEffect(() => {
    document.body.style.overflow = adminOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [adminOpen]);

  const handleAdminClose = () => {
    setAdminOpen(false);
    refreshSite(); // pick up any changes made in the panel
  };

  return (
    <>
      <Preloader name={site.settings.ownerName} onDone={() => setPreloading(false)} />
      <CustomCursor />
      <ParticleField />
      <ScrollProgress />

      {/* main site */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative"
      >
        <PortfolioSite data={site} onAdminClick={() => setAdminOpen(true)} />

        {/* loading / error states */}
        <AnimatePresence>
          {loading && (
            <motion.div
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2"
            >
              <span className="glass rounded-full px-5 py-2.5 text-sm text-white/60">Loading site data…</span>
            </motion.div>
          )}
        </AnimatePresence>
        {fetchError && !loading && (
          <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2">
            <button
              onClick={refreshSite}
              className="glass rounded-full px-5 py-2.5 text-sm text-rose-300"
            >
              Couldn&apos;t reach the server — tap to retry
            </button>
          </div>
        )}
      </motion.div>

      {/* admin overlay */}
      <AdminGate open={adminOpen} onClose={handleAdminClose} siteData={site} refreshSite={refreshSite} />
    </>
  );
}
