"use client";

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

/**
 * PortfolioSite — composes every animated section of the public site.
 */
export function PortfolioSite({
  data,
  onAdminClick,
}: {
  data: SiteData;
  onAdminClick: () => void;
}) {
  const { settings } = data;
  const roles = settings.heroRoles.split(",").map((r) => r.trim()).filter(Boolean);
  const marqueeItems = settings.marqueeText.split(",").map((m) => m.trim()).filter(Boolean);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar ownerName={settings.ownerName} onAdminClick={onAdminClick} />
      <main className="relative z-10 flex-1">
        <Hero
          ownerName={settings.ownerName}
          greeting={settings.heroGreeting}
          roles={roles}
          tagline={settings.heroTagline}
          availability={settings.availability}
          socialLinks={data.socialLinks}
          stats={data.stats}
        />
        <About settings={settings} marqueeItems={marqueeItems} />
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
    </div>
  );
}
