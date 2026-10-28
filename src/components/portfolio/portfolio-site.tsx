"use client";

import { useState } from "react";
import type { SiteData } from "@/lib/types";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { About } from "./about";
import { Bento } from "./bento";
import { Skills } from "./skills";
import { Projects } from "./projects";
import { Journey } from "./journey";
import { Services } from "./services";
import { Testimonials } from "./testimonials";
import { Contact } from "./contact";
import { Footer, BackToTop } from "./footer";
import { AuditDrawer } from "./audit-drawer";

/**
 * PortfolioSite — composes every animated section of the public site.
 */
export function PortfolioSite({
  data,
  onAdminClick,
  onAvatarChange,
}: {
  data: SiteData;
  onAdminClick: () => void;
  onAvatarChange?: (newAvatarUrl: string) => Promise<void> | void;
}) {
  const { settings } = data;
  const [auditOpen, setAuditOpen] = useState(false);
  const roles = settings.heroRoles.split(",").map((r) => r.trim()).filter(Boolean);
  const marqueeItems = settings.marqueeText.split(",").map((m) => m.trim()).filter(Boolean);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar
        ownerName={settings.ownerName}
        avatarUrl={settings.avatarUrl}
        onAdminClick={onAdminClick}
        onOpenAudit={() => setAuditOpen(true)}
      />
      <main className="relative z-10 flex-1">
        <Hero
          ownerName={settings.ownerName}
          avatarUrl={settings.avatarUrl}
          greeting={settings.heroGreeting}
          roles={roles}
          tagline={settings.heroTagline}
          availability={settings.availability}
          socialLinks={data.socialLinks}
          stats={data.stats}
          onAvatarChange={onAvatarChange}
          onOpenAudit={() => setAuditOpen(true)}
        />
        <About
          settings={settings}
          marqueeItems={marqueeItems}
          onAvatarChange={onAvatarChange}
        />
        <Bento settings={settings} stats={data.stats} skills={data.skills} projects={data.projects} />
        <Skills skills={data.skills} />
        <Projects projects={data.projects} />
        <Journey experiences={data.experiences} education={data.education} />
        <Services services={data.services} />
        <Testimonials testimonials={data.testimonials} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} socialLinks={data.socialLinks} />
      <BackToTop />
      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
