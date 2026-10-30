"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import type { SiteData } from "@/lib/types";
import { PortfolioSite } from "@/components/portfolio/portfolio-site";
import { Preloader } from "@/components/portfolio/preloader";
import { CustomCursor } from "@/components/portfolio/custom-cursor";
import { ParticleField } from "@/components/portfolio/particle-field";
import { Scene3D } from "@/components/portfolio/scene-3d";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { AdminGate } from "@/components/admin/admin-gate";
import { WorldScene } from "@/components/portfolio/scroll-world/world-scene";

export function HomeClient({ initialData }: { initialData: SiteData }) {
  const [site, setSite] = useState<SiteData>(initialData);
  const [preloading, setPreloading] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  // Default to the immersive 3D scroll world; classic site stays one click away
  const [viewMode, setViewMode] = useState<"3d" | "classic">("3d");

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

  // Lock body scroll only while the admin overlay is open (the 3D world is
  // driven by natural page scroll — it must stay free while exploring)
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

      <AnimatePresence mode="wait">
        {viewMode === "3d" ? (
          <motion.div
            key="3d-world"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Scroll-driven cinematic 3D world — owns its own scroll track */}
            <WorldScene
              siteData={site}
              onToggleClassicMode={() => setViewMode("classic")}
              onAdminClick={() => setAdminOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="classic-portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <CustomCursor />
            {/* immersive 3D world — admin can switch back to 2D particles (Extras tab) */}
            {site.settings.enable3d === "false" ? <ParticleField /> : <Scene3D />}
            <ScrollProgress />

            {/* Floating button to jump back into the 3D World */}
            <div className="fixed bottom-6 left-6 z-[85]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.scrollTo({ top: 0 });
                  setViewMode("3d");
                }}
                className="group flex items-center gap-2.5 rounded-full border border-[var(--site-primary)]/60 bg-[#120a22]/90 px-5 py-3 text-xs font-bold text-white shadow-[0_10px_35px_rgba(139,92,246,0.6)] backdrop-blur-xl transition-all hover:bg-[var(--site-primary)]"
              >
                <Compass className="h-4 w-4 text-[var(--site-accent)] transition-transform duration-500 group-hover:rotate-180" />
                <span>Enter 3D World</span>
              </motion.button>
            </div>

            <PortfolioSite
              data={site}
              onAdminClick={() => setAdminOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
