import { db } from "./db";

export type FieldType = "string" | "number" | "boolean";

export interface EntityDef {
  // Prisma delegate name on db client
  delegate: string;
  fields: Record<string, FieldType>;
  // allow public create (messages) — false by default
  publicCreate?: boolean;
}

export const ENTITIES: Record<string, EntityDef> = {
  skills: {
    delegate: "skill",
    fields: { name: "string", category: "string", level: "number", icon: "string", order: "number" },
  },
  projects: {
    delegate: "project",
    fields: {
      title: "string",
      description: "string",
      imageUrl: "string",
      tags: "string",
      githubUrl: "string",
      liveUrl: "string",
      featured: "boolean",
      order: "number",
    },
  },
  experiences: {
    delegate: "experience",
    fields: { role: "string", company: "string", period: "string", description: "string", current: "boolean", order: "number" },
  },
  education: {
    delegate: "education",
    fields: { degree: "string", institution: "string", period: "string", description: "string", order: "number" },
  },
  services: {
    delegate: "service",
    fields: { title: "string", description: "string", icon: "string", order: "number" },
  },
  testimonials: {
    delegate: "testimonial",
    fields: { name: "string", role: "string", company: "string", content: "string", avatarUrl: "string", rating: "number", order: "number" },
  },
  "social-links": {
    delegate: "socialLink",
    fields: { platform: "string", url: "string", icon: "string", order: "number" },
  },
  stats: {
    delegate: "stat",
    fields: { label: "string", value: "number", suffix: "string", order: "number" },
  },
  messages: {
    delegate: "message",
    fields: { name: "string", email: "string", subject: "string", content: "string", read: "boolean" },
    publicCreate: true,
  },
};

type PrismaDelegate = {
  findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
  delete: (args: unknown) => Promise<Record<string, unknown>>;
  aggregate: (args: unknown) => Promise<{ _max: { order: number | null } }>;
};

export function getDelegate(entity: EntityDef): PrismaDelegate {
  const d = (db as unknown as Record<string, unknown>)[entity.delegate];
  if (!d) throw new Error(`Unknown delegate ${entity.delegate}`);
  return d as unknown as PrismaDelegate;
}

/** Coerces and filters a payload according to the entity field types. */
export function sanitize(
  entity: EntityDef,
  body: Record<string, unknown>,
  opts: { allowOrder?: boolean } = {}
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, type] of Object.entries(entity.fields)) {
    if (!(key in body)) continue;
    if (key === "order" && !opts.allowOrder) continue;
    const raw = body[key];
    if (type === "number") {
      const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
      if (!Number.isNaN(n)) out[key] = Math.round(n);
    } else if (type === "boolean") {
      out[key] = Boolean(raw);
    } else {
      out[key] = raw == null ? "" : String(raw).slice(0, 20000);
    }
  }
  return out;
}
