import type { SiteData } from "@/lib/types";
import { HomeClient } from "@/components/portfolio/home-client";

/**
 * Rich initial data baked into the SSR / static-export HTML so the page
 * renders immediately with zero blank flash (works in both standalone SSR
 * and Cloudflare Pages `output: "export"` builds).
 */
const INITIAL_SITE_DATA: SiteData = {
  settings: {
    siteTitle: "Ariyan Rahman — Creative Developer",
    ownerName: "Ariyan Rahman",
    heroGreeting: "Hello, I'm",
    heroRoles: "Full-Stack Developer, UI/UX Designer, Creative Coder, Problem Solver",
    heroTagline:
      "I craft immersive digital experiences where pixel-perfect design meets rock-solid engineering. Specializing in modern web apps, interactive interfaces, and scalable systems.",
    avatarUrl: "/images/avatar.svg",
    aboutTitle: "Turning bold ideas into interactive reality",
    aboutText:
      "I'm a full-stack developer and creative technologist with 5+ years of experience building fast, accessible and visually unforgettable web products. From design systems to distributed backends, I love owning the entire journey from concept to launch.\nWhen I'm not shipping code, you'll find me exploring generative art, contributing to open source, or mentoring upcoming developers in the community.",
    resumeUrl: "#contact",
    email: "hello@ariyan.dev",
    phone: "+880 1700-000000",
    location: "Dhaka, Bangladesh",
    availability: "Available for freelance",
    primaryColor: "#8b5cf6",
    accentColor: "#d946ef",
    marqueeText:
      "React, Next.js, TypeScript, Node.js, Tailwind, Framer Motion, PostgreSQL, GraphQL, Docker, AWS, Three.js, Figma",
    footerText: "Crafted with passion & lots of coffee.",
  },
  skills: [
    { id: "sk_1", name: "React & Next.js", category: "Frontend", level: 96, icon: "Code2", order: 1 },
    { id: "sk_2", name: "TypeScript", category: "Frontend", level: 94, icon: "FileCode", order: 2 },
    { id: "sk_3", name: "Tailwind CSS", category: "Frontend", level: 95, icon: "Palette", order: 3 },
    { id: "sk_4", name: "Framer Motion & GSAP", category: "Frontend", level: 90, icon: "Sparkles", order: 4 },
    { id: "sk_5", name: "Node.js & Express", category: "Backend", level: 91, icon: "Server", order: 5 },
    { id: "sk_6", name: "PostgreSQL & Prisma", category: "Backend", level: 88, icon: "Database", order: 6 },
    { id: "sk_7", name: "GraphQL & REST APIs", category: "Backend", level: 92, icon: "Network", order: 7 },
    { id: "sk_8", name: "Docker & AWS", category: "DevOps", level: 84, icon: "Cloud", order: 8 },
    { id: "sk_9", name: "UI/UX & Figma", category: "Design", level: 89, icon: "Figma", order: 9 },
  ],
  projects: [
    {
      id: "pr_1",
      title: "Nebula AI Studio",
      description:
        "A real-time collaborative canvas powered by generative AI — featuring infinite zoom, multiplayer cursors, and streaming shader effects.",
      imageUrl: "/images/project-nova.svg",
      tags: "Next.js, TypeScript, WebGL, WebSockets, OpenAI",
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      order: 1,
    },
    {
      id: "pr_2",
      title: "Pulse Fintech Dashboard",
      description:
        "High-frequency analytics and portfolio management suite with sub-second live charts, smart alerts, and glassmorphic dark UI.",
      imageUrl: "/images/project-lumen.svg",
      tags: "React, Tailwind, D3.js, Node.js, PostgreSQL",
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      order: 2,
    },
    {
      id: "pr_3",
      title: "Aether Commerce Engine",
      description:
        "Headless 3D product configurator and storefront delivering a 99 Lighthouse score and 2.4x conversion lift.",
      imageUrl: "/images/project-pulse.svg",
      tags: "Next.js, Three.js, Stripe, Prisma, Redis",
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      order: 3,
    },
  ],
  experiences: [
    {
      id: "ex_1",
      role: "Senior Full-Stack Engineer",
      company: "Hyperion Labs",
      period: "2023 — Present",
      description:
        "Leading frontend architecture and design-system engineering for a suite of AI-native SaaS products serving 200k+ monthly users.",
      current: true,
      order: 1,
    },
    {
      id: "ex_2",
      role: "Full-Stack Developer",
      company: "PixelForge Studio",
      period: "2021 — 2023",
      description:
        "Built interactive marketing sites, custom WebGL experiences, and scalable APIs for global tech brands and high-growth startups.",
      current: false,
      order: 2,
    },
  ],
  education: [
    {
      id: "ed_1",
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "University of Dhaka",
      period: "2016 — 2020",
      description:
        "Graduated with honors. Specialized in software engineering, human-computer interaction, and distributed systems.",
      order: 1,
    },
  ],
  services: [
    {
      id: "sv_1",
      title: "Full-Stack Web Apps",
      description:
        "End-to-end architecture and development of blazing-fast, SEO-ready applications using Next.js, TypeScript, and modern cloud infrastructure.",
      icon: "Layers",
      order: 1,
    },
    {
      id: "sv_2",
      title: "Interactive UI & Motion",
      description:
        "Bespoke interfaces with buttery-smooth micro-interactions, 3D visuals, and design systems that make your brand unforgettable.",
      icon: "Sparkles",
      order: 2,
    },
    {
      id: "sv_3",
      title: "API & System Design",
      description:
        "Resilient REST & GraphQL APIs, database modeling, authentication, and third-party integrations engineered to scale.",
      icon: "Cpu",
      order: 3,
    },
    {
      id: "sv_4",
      title: "Performance & Audits",
      description:
        "Deep-dive Core Web Vitals optimization, accessibility hardening, and codebase refactoring for existing products.",
      icon: "Gauge",
      order: 4,
    },
  ],
  testimonials: [
    {
      id: "tm_1",
      name: "Sarah Jenkins",
      role: "VP of Product",
      company: "Nebula Cloud",
      content:
        "Working with Ariyan was a game-changer. He transformed our complex product vision into an interface our users genuinely love — ahead of schedule.",
      avatarUrl: "",
      rating: 5,
      order: 1,
    },
    {
      id: "tm_2",
      name: "Marcus Vance",
      role: "Founder & CEO",
      company: "Pulse Labs",
      content:
        "Rarely do you find an engineer with both deep systems thinking and an obsessive eye for motion and craft. Worth every penny.",
      avatarUrl: "",
      rating: 5,
      order: 2,
    },
  ],
  socialLinks: [
    { id: "so_1", platform: "GitHub", url: "https://github.com", icon: "Github", order: 1 },
    { id: "so_2", platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", order: 2 },
    { id: "so_3", platform: "Twitter", url: "https://x.com", icon: "Twitter", order: 3 },
  ],
  stats: [
    { id: "st_1", label: "Years of Experience", value: 5, suffix: "+", order: 1 },
    { id: "st_2", label: "Projects Delivered", value: 48, suffix: "+", order: 2 },
    { id: "st_3", label: "Happy Clients", value: 32, suffix: "+", order: 3 },
    { id: "st_4", label: "Client Satisfaction", value: 99, suffix: "%", order: 4 },
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
