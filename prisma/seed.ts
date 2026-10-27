/**
 * Seed script — creates the admin account + rich demo content.
 * Run: bun --env-file=.env prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const db = new PrismaClient();

function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // ---------- Admin ----------
  const existingAdmin = await db.admin.findFirst();
  if (!existingAdmin) {
    await db.admin.create({
      data: { username: "admin", passwordHash: hashPassword("admin123") },
    });
    console.log("Admin created -> username: admin | password: admin123");
  } else {
    console.log("Admin already exists, skipping");
  }

  // ---------- Site Settings ----------
  const existingSettings = await db.siteSetting.findUnique({ where: { id: "main" } });
  if (!existingSettings) {
    await db.siteSetting.create({
      data: {
        id: "main",
        siteTitle: "Arif Rahman — Creative Full-Stack Developer",
        ownerName: "Arif Rahman",
        heroGreeting: "Hello, I'm",
        heroRoles: "Full-Stack Developer, Next.js Specialist, UI Animation Lover, Open-Source Contributor",
        heroTagline:
          "I craft immersive digital experiences where engineering meets art. Every pixel moves with purpose, every interaction tells a story. Let's build something people remember.",
        avatarUrl: "",
        aboutTitle: "Crafting digital magic since day one",
        aboutText:
          "I'm a passionate developer & designer who believes great software should feel alive. For over 5 years I've been building web products for startups and agencies across the globe — from silky-smooth marketing sites to complex data platforms.\n\nMy sweet spot lives at the intersection of code and motion: interfaces that respond, flow and delight. When I'm not shipping features, you'll find me sketching interface ideas, contributing to open source, or exploring generative art.",
        resumeUrl: "",
        email: "hello@arifrahman.dev",
        phone: "+880 1700 000000",
        location: "Dhaka, Bangladesh",
        availability: "Available for freelance",
        primaryColor: "#8b5cf6",
        accentColor: "#d946ef",
        marqueeText: "Creative Development, UI/UX Design, Motion Design, Web Animations, React & Next.js, Brand Identity, Open Source, Performance",
        footerText: "Designed & built with passion",
      },
    });
    console.log("Site settings created");
  }

  // ---------- Skills ----------
  const skillCount = await db.skill.count();
  if (skillCount === 0) {
    await db.skill.createMany({
      data: [
        { name: "React / Next.js", category: "Frontend", level: 95, icon: "Atom", order: 1 },
        { name: "TypeScript", category: "Frontend", level: 92, icon: "Braces", order: 2 },
        { name: "Tailwind CSS", category: "Frontend", level: 94, icon: "Wind", order: 3 },
        { name: "Framer Motion", category: "Frontend", level: 90, icon: "Sparkles", order: 4 },
        { name: "Node.js / Bun", category: "Backend", level: 88, icon: "Server", order: 5 },
        { name: "PostgreSQL / Prisma", category: "Backend", level: 85, icon: "Database", order: 6 },
        { name: "REST & GraphQL APIs", category: "Backend", level: 86, icon: "Workflow", order: 7 },
        { name: "Docker & CI/CD", category: "DevOps", level: 78, icon: "Container", order: 8 },
        { name: "Cloudflare Workers", category: "DevOps", level: 80, icon: "Cloud", order: 9 },
        { name: "Figma / UI Design", category: "Design", level: 87, icon: "Palette", order: 10 },
        { name: "Motion & Micro-interactions", category: "Design", level: 91, icon: "Zap", order: 11 },
        { name: "3D & WebGL basics", category: "Design", level: 68, icon: "Boxes", order: 12 },
      ],
    });
    console.log("Skills created");
  }

  // ---------- Projects ----------
  const projectCount = await db.project.count();
  if (projectCount === 0) {
    await db.project.createMany({
      data: [
        {
          title: "Nebula — SaaS Analytics Platform",
          description:
            "A real-time analytics dashboard processing 2M+ events daily. Built with Next.js, WebSockets and a custom charting engine with buttery 60fps animations, dark-mode design system and role-based access.",
          imageUrl: "https://picsum.photos/seed/nebula42/960/640",
          tags: "Next.js, TypeScript, WebSockets, Prisma",
          githubUrl: "https://github.com",
          liveUrl: "https://example.com",
          featured: true,
          order: 1,
        },
        {
          title: "Lumen — Immersive Agency Site",
          description:
            "An award-style agency website with scroll-driven storytelling, WebGL hero shaders and page transitions. Scored 98 on Lighthouse while shipping 40+ bespoke animations.",
          imageUrl: "https://picsum.photos/seed/lumen7/960/640",
          tags: "React, GLSL, GSAP, Framer Motion",
          githubUrl: "https://github.com",
          liveUrl: "https://example.com",
          featured: true,
          order: 2,
        },
        {
          title: "Pulse — Team Chat App",
          description:
            "Realtime team messaging with threads, presence indicators, optimistic UI and offline sync. Handles 10k concurrent connections on a pocket-friendly infra budget.",
          imageUrl: "https://picsum.photos/seed/pulse19/960/640",
          tags: "Next.js, Socket.io, Redis, Zustand",
          githubUrl: "https://github.com",
          liveUrl: "",
          featured: false,
          order: 3,
        },
        {
          title: "Atlas — Travel Journal PWA",
          description:
            "An offline-first progressive web app for globetrotters. Map-based timeline, photo stories, background sync and app-like feel with home-screen install support.",
          imageUrl: "https://picsum.photos/seed/atlas88/960/640",
          tags: "PWA, Mapbox, IndexedDB, Workbox",
          githubUrl: "",
          liveUrl: "https://example.com",
          featured: false,
          order: 4,
        },
        {
          title: "Forge — Headless Commerce Starter",
          description:
            "A blazing-fast storefront starter for headless e-commerce. Edge-rendered product pages, animated cart drawer, one-click checkout flow and a 100/100 SEO score.",
          imageUrl: "https://picsum.photos/seed/forge55/960/640",
          tags: "Next.js, Stripe, Edge Runtime",
          githubUrl: "https://github.com",
          liveUrl: "https://example.com",
          featured: false,
          order: 5,
        },
        {
          title: "Echo — AI Writing Companion",
          description:
            "A distraction-free editor with AI-assisted rewriting, animated suggestion cards and markdown export. Streams tokens with typewriter rendering for a magical feel.",
          imageUrl: "https://picsum.photos/seed/echo23/960/640",
          tags: "React, LLM API, Streaming, Tiptap",
          githubUrl: "https://github.com",
          liveUrl: "",
          featured: false,
          order: 6,
        },
      ],
    });
    console.log("Projects created");
  }

  // ---------- Experience ----------
  const expCount = await db.experience.count();
  if (expCount === 0) {
    await db.experience.createMany({
      data: [
        {
          role: "Senior Full-Stack Engineer",
          company: "Stellar Labs",
          period: "2023 — Present",
          description:
            "Leading the frontend architecture of a multi-tenant SaaS platform. Shipped a design system used by 4 products, cut bundle size by 45% and mentor a team of five engineers.",
          current: true,
          order: 1,
        },
        {
          role: "Frontend Engineer",
          company: "PixelForge Studio",
          period: "2021 — 2023",
          description:
            "Built 15+ marketing sites and web apps for international clients. Owned motion design and interaction quality across projects, winning two site-of-the-day awards.",
          current: false,
          order: 2,
        },
        {
          role: "Junior Web Developer",
          company: "CodeCraft Agency",
          period: "2019 — 2021",
          description:
            "Cut my teeth building responsive WordPress and React sites. Learned to sweat the details — accessibility, performance budgets and pixel-perfect delivery.",
          current: false,
          order: 3,
        },
      ],
    });
    console.log("Experience created");
  }

  // ---------- Education ----------
  const eduCount = await db.education.count();
  if (eduCount === 0) {
    await db.education.createMany({
      data: [
        {
          degree: "BSc in Computer Science & Engineering",
          institution: "University of Dhaka",
          period: "2015 — 2019",
          description:
            "Graduated with distinction. Thesis on perceptual performance of animated web interfaces. Led the programming club and organised two national hackathons.",
          order: 1,
        },
        {
          degree: "Diploma in Interactive Design",
          institution: "Bangladesh Design Institute",
          period: "2014 — 2015",
          description:
            "Foundation year in visual design, typography and color theory — the secret sauce behind my developer-designer hybrid skill set.",
          order: 2,
        },
      ],
    });
    console.log("Education created");
  }

  // ---------- Services ----------
  const serviceCount = await db.service.count();
  if (serviceCount === 0) {
    await db.service.createMany({
      data: [
        {
          title: "Web Development",
          description:
            "End-to-end development of fast, scalable web apps — from architecture and APIs to pixel-perfect responsive frontends that pass Core Web Vitals with flying colors.",
          icon: "Code2",
          order: 1,
        },
        {
          title: "UI/UX Design",
          description:
            "Interfaces that feel effortless. Research, wireframes, high-fidelity prototypes and design systems that keep your product consistent as it grows.",
          icon: "Palette",
          order: 2,
        },
        {
          title: "Motion & Interaction",
          description:
            "Scroll choreography, micro-interactions, page transitions and WebGL moments — the details that make visitors say wow and remember your brand.",
          icon: "Sparkles",
          order: 3,
        },
        {
          title: "Performance & SEO",
          description:
            "Audits and hands-on optimization: bundle diets, edge caching, structured data and accessibility passes that lift both rankings and conversions.",
          icon: "Rocket",
          order: 4,
        },
      ],
    });
    console.log("Services created");
  }

  // ---------- Testimonials ----------
  const testiCount = await db.testimonial.count();
  if (testiCount === 0) {
    await db.testimonial.createMany({
      data: [
        {
          name: "Sarah Mitchell",
          role: "Product Lead",
          company: "Stellar Labs",
          content:
            "Arif is the rare engineer who thinks like a designer. He rebuilt our dashboard and our users literally emailed us to say it felt magical. Delivery was early, quality was exceptional.",
          avatarUrl: "",
          rating: 5,
          order: 1,
        },
        {
          name: "James Okafor",
          role: "Founder",
          company: "Lumen Agency",
          content:
            "Every agency promises 'premium'. Arif actually delivers it — obsessive attention to animation timing, loading states, the works. Our site won an award the month it launched.",
          avatarUrl: "",
          rating: 5,
          order: 2,
        },
        {
          name: "Nadia Chen",
          role: "CTO",
          company: "PulseChat",
          content:
            "He took a vague idea and turned it into a realtime app our investors called 'deceptively simple'. Communication was crisp, architecture was clean, code was a joy to review.",
          avatarUrl: "",
          rating: 5,
          order: 3,
        },
        {
          name: "Tomás Rivera",
          role: "Marketing Director",
          company: "Atlas Travel",
          content:
            "Our engagement doubled after the redesign. The site doesn't just look animated — it converts. Arif understood business goals first, then made the tech serve them.",
          avatarUrl: "",
          rating: 5,
          order: 4,
        },
      ],
    });
    console.log("Testimonials created");
  }

  // ---------- Social Links ----------
  const socialCount = await db.socialLink.count();
  if (socialCount === 0) {
    await db.socialLink.createMany({
      data: [
        { platform: "GitHub", url: "https://github.com", icon: "Github", order: 1 },
        { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", order: 2 },
        { platform: "Twitter / X", url: "https://x.com", icon: "Twitter", order: 3 },
        { platform: "Dribbble", url: "https://dribbble.com", icon: "Dribbble", order: 4 },
        { platform: "Email", url: "mailto:hello@arifrahman.dev", icon: "Mail", order: 5 },
      ],
    });
    console.log("Social links created");
  }

  // ---------- Stats ----------
  const statCount = await db.stat.count();
  if (statCount === 0) {
    await db.stat.createMany({
      data: [
        { label: "Years of Experience", value: 5, suffix: "+", order: 1 },
        { label: "Projects Completed", value: 48, suffix: "+", order: 2 },
        { label: "Happy Clients", value: 32, suffix: "+", order: 3 },
        { label: "Awards & Mentions", value: 7, suffix: "", order: 4 },
      ],
    });
    console.log("Stats created");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
