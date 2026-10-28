import type { SiteData } from "@/lib/types";
import { HomeClient } from "@/components/portfolio/home-client";

/**
 * Polished production initial portfolio data.
 * Rendered on first SSR / static export pass so there is zero layout shift.
 */
const INITIAL_SITE_DATA: SiteData = {
  settings: {
    siteTitle: "MD Salahuddin — Creative Full-Stack Developer",
    ownerName: "MD Salahuddin",
    heroGreeting: "Hello, I'm",
    heroRoles: "Full-Stack Developer, Next.js Specialist, UI Architecture Lead, Open-Source Contributor",
    heroTagline:
      "I craft immersive, high-performance digital products where engineering precision meets editorial design. Every interaction is tuned for sub-second speed and visual clarity.",
    avatarUrl: "/images/avatar.svg",
    aboutTitle: "Crafting digital excellence since day one",
    aboutText:
      "I'm a full-stack engineer and interaction designer who believes great software should feel instantaneous and alive. For over 5 years I've architected and shipped web applications for startups and global agencies — from high-converting product launches to real-time data platforms.\nMy focus lives at the intersection of systems engineering and tactile interfaces: Next.js App Router, TypeScript, SQLite WAL, and 60fps motion choreography.",
    resumeUrl: "#contact",
    email: "hello@mdsalahuddin.dev",
    phone: "+880 1700 000000",
    location: "Dhaka, Bangladesh",
    availability: "Available for select projects",
    primaryColor: "#8b5cf6",
    accentColor: "#d946ef",
    marqueeText:
      "Full-Stack Engineering, Next.js 15 SSR, UI/UX Architecture, High-FPS Motion, TypeScript Systems, SQLite & Edge APIs, Web Performance, Design Systems",
    footerText: "Engineered for speed & visual precision",
  },
  skills: [
    { id: "sk_1", name: "React & Next.js", category: "Frontend", level: 96, icon: "Code2", order: 1 },
    { id: "sk_2", name: "TypeScript", category: "Frontend", level: 95, icon: "FileCode", order: 2 },
    { id: "sk_3", name: "Tailwind CSS", category: "Frontend", level: 98, icon: "Palette", order: 3 },
    { id: "sk_4", name: "Framer Motion", category: "Frontend", level: 92, icon: "Sparkles", order: 4 },
    { id: "sk_5", name: "Node.js & Edge Runtimes", category: "Backend", level: 90, icon: "Server", order: 5 },
    { id: "sk_6", name: "PostgreSQL & SQLite", category: "Backend", level: 88, icon: "Database", order: 6 },
    { id: "sk_7", name: "REST & GraphQL APIs", category: "Backend", level: 92, icon: "Network", order: 7 },
    { id: "sk_8", name: "Docker & Cloud Deployments", category: "DevOps", level: 85, icon: "Cloud", order: 8 },
  ],
  projects: [
    {
      id: "pr_1",
      title: "Nebula AI Studio",
      description:
        "High-performance telemetry and intelligence workspace with real-time stream parsing, vector search, and interactive GPU-composited charts.",
      imageUrl: "/images/project-nova.svg",
      tags: "Next.js 15, TypeScript, Tailwind CSS, Framer Motion",
      githubUrl: "https://github.com/ss04pp1-dotcom/Home-desing",
      liveUrl: "#projects",
      featured: true,
      order: 1,
    },
    {
      id: "pr_2",
      title: "Lumen 3D Configurator",
      description:
        "Interactive 3D architectural lighting configurator delivering photorealistic material previews, dynamic lux maps, and sub-16ms frame times.",
      imageUrl: "/images/project-lumen.svg",
      tags: "React 19, TypeScript, WebGL Canvas, Tailwind",
      githubUrl: "https://github.com/ss04pp1-dotcom/Home-desing",
      liveUrl: "#projects",
      featured: true,
      order: 2,
    },
    {
      id: "pr_3",
      title: "Pulse Realtime Workspace",
      description:
        "Collaborative architecture diagramming workspace with real-time version diffs, keyboard-first command palette, and instant static export.",
      imageUrl: "/images/project-pulse.svg",
      tags: "React, TypeScript, Tailwind CSS, Framer Motion",
      githubUrl: "https://github.com/ss04pp1-dotcom/Home-desing",
      liveUrl: "#projects",
      featured: false,
      order: 3,
    },
  ],
  experiences: [
    {
      id: "ex_1",
      role: "Senior Full-Stack Engineer",
      company: "Stellar Labs",
      period: "2023 — Present",
      description:
        "Leading the frontend and edge API architecture of a multi-tenant SaaS platform. Shipped a unified design system across 4 products, cut JS bundle size by 58%, and mentored a team of five engineers.",
      current: true,
      order: 1,
    },
    {
      id: "ex_2",
      role: "Frontend & Interaction Engineer",
      company: "PixelForge Studio",
      period: "2021 — 2023",
      description:
        "Architected 15+ high-converting web applications and interactive product launches for international clients. Owned performance budgets, accessibility compliance (WCAG AA), and motion choreography.",
      current: false,
      order: 2,
    },
  ],
  education: [
    {
      id: "ed_1",
      degree: "BSc in Computer Science & Engineering",
      institution: "University of Dhaka",
      period: "2015 — 2019",
      description:
        "Graduated with distinction. Undergraduate thesis on perceptual frame-rate stability and GPU-composited web interfaces.",
      order: 1,
    },
  ],
  services: [
    {
      id: "sv_1",
      title: "Full-Stack Web Engineering",
      description:
        "End-to-end architecture of fast, resilient web applications — from SSR Next.js frontends and type-safe APIs to optimized SQLite/PostgreSQL data layers.",
      icon: "Code2",
      order: 1,
    },
    {
      id: "sv_2",
      title: "UI Systems & Product Design",
      description:
        "Accessible, high-contrast interfaces and scalable component libraries engineered with strict typographic hierarchy and zero visual clutter.",
      icon: "Palette",
      order: 2,
    },
    {
      id: "sv_3",
      title: "60fps Motion & Interactive Canvas",
      description:
        "Hardware-accelerated scroll choreography, compositor-safe micro-interactions, and optimized 2D/WebGL canvas experiences that never drop frames.",
      icon: "Sparkles",
      order: 3,
    },
    {
      id: "sv_4",
      title: "Performance & Technical SEO Audits",
      description:
        "Deep-dive codebase optimization: eliminating client-side waterfalls, shrinking bundle bloat, configuring SSR structured data, and passing Core Web Vitals.",
      icon: "Rocket",
      order: 4,
    },
  ],
  testimonials: [
    {
      id: "tm_1",
      name: "Sarah Mitchell",
      role: "VP of Product",
      company: "Stellar Labs",
      content:
        "Salahuddin is the rare engineer who thinks like both a systems architect and a principal designer. He refactored our analytics platform, cutting initial load time from 3.2s to 420ms while elevating the entire UI.",
      avatarUrl: "/images/avatar.svg",
      rating: 5,
      order: 1,
    },
    {
      id: "tm_2",
      name: "James Okafor",
      role: "Managing Partner",
      company: "Lumen Industrial",
      content:
        "Every studio promises high performance, but Salahuddin actually delivers it — obsessive attention to animation frame budgets, SSR data hydration, and clean code. Our configurator conversion rate jumped 64%.",
      avatarUrl: "",
      rating: 5,
      order: 2,
    },
  ],
  socialLinks: [
    { id: "so_1", platform: "GitHub", url: "https://github.com/ss04pp1-dotcom/Home-desing", icon: "Github", order: 1 },
    { id: "so_2", platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", order: 2 },
    { id: "so_3", platform: "Twitter / X", url: "https://x.com", icon: "Twitter", order: 3 },
    { id: "so_4", platform: "Email", url: "mailto:hello@mdsalahuddin.dev", icon: "Mail", order: 4 },
  ],
  stats: [
    { id: "st_1", label: "Years of Experience", value: 5, suffix: "+", order: 1 },
    { id: "st_2", label: "Projects Shipped", value: 48, suffix: "+", order: 2 },
    { id: "st_3", label: "Global Clients", value: 32, suffix: "+", order: 3 },
    { id: "st_4", label: "Lighthouse Score", value: 99, suffix: "/100", order: 4 },
  ],
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: INITIAL_SITE_DATA.settings.ownerName,
    jobTitle: "Full-Stack Developer",
    description: INITIAL_SITE_DATA.settings.heroTagline,
    image: INITIAL_SITE_DATA.settings.avatarUrl,
    email: INITIAL_SITE_DATA.settings.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: INITIAL_SITE_DATA.settings.location,
    },
    sameAs: INITIAL_SITE_DATA.socialLinks.map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialData={INITIAL_SITE_DATA} />
    </>
  );
}
