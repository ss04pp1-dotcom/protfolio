"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SiteData } from "@/lib/types";
import { PortfolioSite } from "@/components/portfolio/portfolio-site";
import { Preloader } from "@/components/portfolio/preloader";
import { CustomCursor } from "@/components/portfolio/custom-cursor";
import { ParticleField } from "@/components/portfolio/particle-field";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { AdminGate } from "@/components/admin/admin-gate";

export function HomeClient({ initialData }: { initialData: SiteData }) {
  const [site, setSite] = useState<SiteData>(initialData);
  const [preloading, setPreloading] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const refreshSite = useCallback(async () => {
    try {
      const res = await fetch("/api/site-data", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SiteData;
      if (data && data.settings) {
        if (!data.settings.avatarUrl) {
          data.settings.avatarUrl = "/images/avatar.svg";
        }
        setSite(data);
      }
    } catch {
      // Retain current state if offline
    }
  }, []);

  useEffect(() => {
    refreshSite();
  }, [refreshSite]);

  // Sync custom theme CSS variables + tab title from settings
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--site-primary", site.settings.primaryColor || "#8b5cf6");
    root.style.setProperty("--site-accent", site.settings.accentColor || "#d946ef");
    if (site.settings.siteTitle) document.title = site.settings.siteTitle;
  }, [site.settings.primaryColor, site.settings.accentColor, site.settings.siteTitle]);

  // Lock body scroll while admin overlay is open
  useEffect(() => {
    document.body.style.overflow = adminOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [adminOpen]);

  const handleAdminClose = () => {
    setAdminOpen(false);
    refreshSite();
  };

  return (
    <>
      {preloading && <Preloader name={site.settings.ownerName} onDone={() => setPreloading(false)} />}
      <CustomCursor />
      <ParticleField />
      <ScrollProgress />

      {/* Main site */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloading ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        className="relative"
      >
        <PortfolioSite
          data={site}
          onAdminClick={() => setAdminOpen(true)}
        />
      </motion.div>

      {/* Admin overlay gated by secure credentials */}
      <AdminGate
        open={adminOpen}
        onClose={handleAdminClose}
        siteData={site}
        refreshSite={refreshSite}
      />
    </>
  );
}
