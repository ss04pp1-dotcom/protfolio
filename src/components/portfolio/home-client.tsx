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

export function HomeClient({ initialData }: { initialData: SiteData }) {
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const [site, setSite] = useState<SiteData>(initialData);
  const [fetchError, setFetchError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const refreshSite = useCallback(async () => {
    try {
      const res = await fetch("/api/site-data", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SiteData;
      if (data.settings) {
        if (!data.settings.avatarUrl) {
          data.settings.avatarUrl = "/images/avatar.svg";
        }
        setSite(data);
      }
      setFetchError(false);
    } catch {
      // Keep initialData if offline
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
    refreshSite();
  };

  const handleAvatarChange = async (newAvatarUrl: string) => {
    setSite((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        avatarUrl: newAvatarUrl,
      },
    }));

    try {
      await fetch("/api/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });
    } catch {
      // Optimistic state is already updated
    }
  };

  return (
    <>
      {preloading && <Preloader name={site.settings.ownerName} onDone={() => setPreloading(false)} />}
      <CustomCursor />
      <ParticleField />
      <ScrollProgress />

      {/* main site */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloading ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        className="relative"
      >
        <PortfolioSite
          data={site}
          onAdminClick={() => setAdminOpen(true)}
          onAvatarChange={handleAvatarChange}
        />

        {/* loading / error states */}
        <AnimatePresence>
          {loading && (
            <motion.div
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2"
            >
              <span className="glass rounded-full px-5 py-2.5 text-sm text-white/60">
                Syncing site data…
              </span>
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
      <AdminGate
        open={adminOpen}
        onClose={handleAdminClose}
        siteData={site}
        refreshSite={refreshSite}
      />
    </>
  );
}
