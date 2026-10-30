/**
 * Portfolio CMS core — all entity CRUD, settings, site-data and contact
 * logic, written once against the SqlClient interface so it runs on both
 * Cloudflare D1 (production) and local SQLite (development) unchanged.
 */
import { q, placeholders, type SqlClient } from "./sql";
import { ApiError } from "./http";

export type FieldType = "string" | "number" | "boolean";

export interface EntityDef {
  /** SQLite table name. */
  table: string;
  fields: Record<string, FieldType>;
  /** Allow unauthenticated create (contact messages). */
  publicCreate?: boolean;
}

export const ENTITIES: Record<string, EntityDef> = {
  skills: {
    table: "skill",
    fields: { name: "string", category: "string", level: "number", icon: "string", order: "number" },
  },
  projects: {
    table: "project",
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
    table: "experience",
    fields: { role: "string", company: "string", period: "string", description: "string", current: "boolean", order: "number" },
  },
  education: {
    table: "education",
    fields: { degree: "string", institution: "string", period: "string", description: "string", order: "number" },
  },
  services: {
    table: "service",
    fields: { title: "string", description: "string", icon: "string", order: "number" },
  },
  testimonials: {
    table: "testimonial",
    fields: { name: "string", role: "string", company: "string", content: "string", avatarUrl: "string", rating: "number", order: "number" },
  },
  "social-links": {
    table: "social_link",
    fields: { platform: "string", url: "string", icon: "string", order: "number" },
  },
  stats: {
    table: "stat",
    fields: { label: "string", value: "number", suffix: "string", order: "number" },
  },
  messages: {
    table: "message",
    fields: { name: "string", email: "string", subject: "string", content: "string", read: "boolean" },
    publicCreate: true,
  },
};

/** Coerces and filters a payload according to the entity field types. */
export function sanitize(
  def: EntityDef,
  body: Record<string, unknown>,
  opts: { allowOrder?: boolean } = {}
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, type] of Object.entries(def.fields)) {
    if (!(key in body)) continue;
    if (key === "order" && !opts.allowOrder) continue;
    const raw = body[key];
    if (type === "number") {
      const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
      if (!Number.isNaN(n)) out[key] = Math.round(n);
    } else if (type === "boolean") {
      out[key] = raw === true || raw === "true" || raw === 1 ? 1 : 0;
    } else {
      // Allow up to 600KB for data-URI images (imageUrl / avatarUrl), 20KB for text fields
      const maxLen = key === "imageUrl" || key === "avatarUrl" ? 600000 : 20000;
      out[key] = raw == null ? "" : String(raw).slice(0, maxLen);
    }
  }
  return out;
}

/** Convert raw SQLite rows (0/1 ints, nulls) into clean API shapes. */
function normalizeRow(def: EntityDef, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const [k, t] of Object.entries(def.fields)) {
    if (t === "boolean") out[k] = Boolean(out[k]);
    else if (t === "number") out[k] = out[k] == null ? 0 : Number(out[k]);
    else if (out[k] == null) out[k] = "";
  }
  if (typeof out.id !== "string") out.id = String(out.id ?? "");
  return out;
}

export async function listEntity(
  sql: SqlClient,
  def: EntityDef
): Promise<Record<string, unknown>[]> {
  const orderBy = def.fields.order ? q("order") : q("createdAt");
  const rows = await sql
    .prepare(`SELECT * FROM ${q(def.table)} ORDER BY ${orderBy} ASC`)
    .all<Record<string, unknown>>();
  return rows.map((r) => normalizeRow(def, r));
}

export async function createEntity(
  sql: SqlClient,
  def: EntityDef,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const data = sanitize(def, body, { allowOrder: true });

  if (def.fields.order && data.order === undefined) {
    const row = await sql
      .prepare(`SELECT MAX(${q("order")}) AS "m" FROM ${q(def.table)}`)
      .first<{ m: number | null }>();
    data.order = (row?.m ?? 0) + 1;
  }

  const id = crypto.randomUUID();
  const cols = ["id", ...Object.keys(data), "createdAt"];
  const vals: unknown[] = [id, ...Object.values(data), new Date().toISOString()];

  await sql.prepare(
    `INSERT INTO ${q(def.table)} (${cols.map(q).join(", ")}) VALUES (${placeholders(cols.length)})`,
    ...vals
  ).run();

  const created = await sql.prepare(
    `SELECT * FROM ${q(def.table)} WHERE ${q("id")} = ?`,
    id
  ).first<Record<string, unknown>>();
  return normalizeRow(def, created ?? { id });
}

export async function updateEntity(
  sql: SqlClient,
  def: EntityDef,
  id: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const data = sanitize(def, body, { allowOrder: true });
  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }
  const sets = Object.keys(data).map((k) => `${q(k)} = ?`).join(", ");
  await sql.prepare(
    `UPDATE ${q(def.table)} SET ${sets} WHERE ${q("id")} = ?`,
    ...Object.values(data),
    id
  ).run();

  const row = await sql.prepare(
    `SELECT * FROM ${q(def.table)} WHERE ${q("id")} = ?`,
    id
  ).first<Record<string, unknown>>();
  if (!row) throw new ApiError(404, "Item not found");
  return normalizeRow(def, row);
}

export async function deleteEntity(sql: SqlClient, def: EntityDef, id: string): Promise<void> {
  await sql.prepare(`DELETE FROM ${q(def.table)} WHERE ${q("id")} = ?`, id).run();
}

/** Swap an item with its neighbour for manual reordering. */
export async function moveEntity(
  sql: SqlClient,
  def: EntityDef,
  id: string,
  direction: "up" | "down"
): Promise<void> {
  const items = await sql
    .prepare(`SELECT ${q("id")} AS "id", ${q("order")} AS "ord" FROM ${q(def.table)} ORDER BY ${q("order")} ASC`)
    .all<{ id: string; ord: number }>();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new ApiError(404, "Item not found");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const a = items[idx];
  const b = items[swapIdx];
  await sql.prepare(`UPDATE ${q(def.table)} SET ${q("order")} = ? WHERE ${q("id")} = ?`, b.ord, a.id).run();
  await sql.prepare(`UPDATE ${q(def.table)} SET ${q("order")} = ? WHERE ${q("id")} = ?`, a.ord, b.id).run();
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const EDITABLE_SETTINGS = [
  "siteTitle",
  "ownerName",
  "heroGreeting",
  "heroRoles",
  "heroTagline",
  "avatarUrl",
  "aboutTitle",
  "aboutText",
  "resumeUrl",
  "email",
  "phone",
  "location",
  "availability",
  "primaryColor",
  "accentColor",
  "marqueeText",
  "footerText",
  "enable3d",
] as const;

export async function getSettings(
  sql: SqlClient
): Promise<Record<string, unknown> | null> {
  const row = await sql.prepare(`SELECT * FROM "site_setting" WHERE "id" = 'main'`).first<Record<string, unknown>>();
  if (row && (!row.avatarUrl || String(row.avatarUrl).trim() === "")) {
    row.avatarUrl = "/images/avatar.svg";
  }
  return row;
}

export async function putSettings(
  sql: SqlClient,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const data: Record<string, string> = {};
  for (const key of EDITABLE_SETTINGS) {
    if (key in body) {
      // Allow up to 600KB for base64 WebP avatarUrl, 5KB for regular text settings
      const maxLen = key === "avatarUrl" ? 600000 : 5000;
      data[key] = String(body[key] ?? "").slice(0, maxLen);
    }
  }
  for (const ck of ["primaryColor", "accentColor"] as const) {
    if (ck in data && !/^#[0-9a-fA-F]{6}$/.test(data[ck])) {
      throw new ApiError(400, `${ck} must be a hex color like #8b5cf6`);
    }
  }
  if ("enable3d" in data && data.enable3d !== "true" && data.enable3d !== "false") {
    throw new ApiError(400, `enable3d must be "true" or "false"`);
  }

  const now = new Date().toISOString();
  const cols = ["id", ...Object.keys(data), "updatedAt"];
  const vals: unknown[] = ["main", ...Object.values(data), now];
  const updates = [...Object.keys(data).map((k) => `${q(k)} = excluded.${q(k)}`), `${q("updatedAt")} = excluded.${q("updatedAt")}`];

  await sql.prepare(
    `INSERT INTO "site_setting" (${cols.map(q).join(", ")}) VALUES (${placeholders(cols.length)})
     ON CONFLICT(${q("id")}) DO UPDATE SET ${updates.join(", ")}`,
    ...vals
  ).run();

  const row = await getSettings(sql);
  return row ?? { id: "main", ...data, updatedAt: now };
}

/* ------------------------------------------------------------------ */
/* Public composite site data                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_PROJECT_IMAGES = [
  "/images/project-nova.svg",
  "/images/project-lumen.svg",
  "/images/project-pulse.svg",
];

export async function getSiteData(sql: SqlClient) {
  const [settings, skills, projects, experiences, education, services, testimonials, socialLinks, stats] =
    await Promise.all([
      getSettings(sql),
      listEntity(sql, ENTITIES.skills),
      listEntity(sql, ENTITIES.projects),
      listEntity(sql, ENTITIES.experiences),
      listEntity(sql, ENTITIES.education),
      listEntity(sql, ENTITIES.services),
      listEntity(sql, ENTITIES.testimonials),
      listEntity(sql, ENTITIES["social-links"]),
      listEntity(sql, ENTITIES.stats),
    ]);

  const enrichedProjects = projects.map((p, idx) => ({
    ...p,
    imageUrl:
      p.imageUrl && String(p.imageUrl).trim() !== ""
        ? p.imageUrl
        : DEFAULT_PROJECT_IMAGES[idx % DEFAULT_PROJECT_IMAGES.length],
  }));

  return {
    settings,
    skills,
    projects: enrichedProjects,
    experiences,
    education,
    services,
    testimonials,
    socialLinks,
    stats,
  };
}

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */

export async function createContactMessage(
  sql: SqlClient,
  body: Record<string, unknown>
): Promise<void> {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const content = String(body.content || "").trim();

  if (!name || !email || !content) {
    throw new ApiError(400, "Name, email and message are required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }
  if (content.length > 5000) {
    throw new ApiError(400, "Message is too long");
  }

  await createEntity(sql, ENTITIES.messages, {
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    subject: subject.slice(0, 200),
    content,
  });
}
