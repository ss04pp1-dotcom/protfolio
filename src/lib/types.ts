/** Shared client-side types for the portfolio site data. */

export interface SiteSettings {
  siteTitle: string;
  ownerName: string;
  heroGreeting: string;
  heroRoles: string;
  heroTagline: string;
  avatarUrl: string;
  aboutTitle: string;
  aboutText: string;
  resumeUrl: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  primaryColor: string;
  accentColor: string;
  marqueeText: string;
  footerText: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  order: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  current: boolean;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl: string;
  rating: number;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SiteData {
  settings: SiteSettings;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  services: Service[];
  testimonials: Testimonial[];
  socialLinks: SocialLink[];
  stats: Stat[];
}
