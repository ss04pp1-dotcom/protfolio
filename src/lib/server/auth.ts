/**
 * Auth core — PBKDF2 password hashing (WebCrypto, works on both
 * Node 24 and Cloudflare Workers) + DB-backed sessions + cookie helpers.
 */
import type { SqlClient } from "./sql";
import { ApiError } from "./http";

export const SESSION_COOKIE = "portfolio_admin_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds (7 days)

const PBKDF2_ITERATIONS = 100_000;
const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(password: string, saltHex: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(saltHex) as unknown as BufferSource,
      iterations,
    },
    key,
    256
  );
  return toHex(bits);
}

/** Hash format: `pbkdf2:<iterations>:<saltHex>:<hashHex>` */
export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const salt =
    saltHex ?? toHex(crypto.getRandomValues(new Uint8Array(16)));
  return `pbkdf2:${PBKDF2_ITERATIONS}:${salt}:${await derive(password, salt, PBKDF2_ITERATIONS)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
    const iterations = parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations < 1) return false;
    const expected = parts[3];
    const computed = await derive(password, parts[2], iterations);
    if (computed.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export function newToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export async function createSession(sql: SqlClient, adminId: string): Promise<string> {
  const token = newToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_MAX_AGE * 1000);
  await sql.prepare(
    `INSERT INTO "session" ("token","adminId","expiresAt","createdAt") VALUES (?,?,?,?)`,
    token,
    adminId,
    expires.toISOString(),
    now.toISOString()
  ).run();
  return token;
}

export async function destroySession(sql: SqlClient, token: string): Promise<void> {
  await sql.prepare(`DELETE FROM "session" WHERE "token" = ?`, token).run();
}

/** Returns the authenticated admin (id + username) for a session token, or null. */
export async function getAdmin(
  sql: SqlClient,
  token: string | null
): Promise<{ id: string; username: string } | null> {
  if (!token) return null;
  const row = await sql.prepare(
    `SELECT s."expiresAt" AS "expiresAt", a."id" AS "id", a."username" AS "username"
       FROM "session" s JOIN "admin" a ON a."id" = s."adminId"
      WHERE s."token" = ?`,
    token
  ).first<{ expiresAt: string; id: string; username: string }>();
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await destroySession(sql, token);
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function requireAdmin(sql: SqlClient, token: string | null) {
  const admin = await getAdmin(sql, token);
  if (!admin) throw new ApiError(401, "Unauthorized");
  return admin;
}

/* ------------------------------------------------------------------ */
/* Login / account                                                     */
/* ------------------------------------------------------------------ */

export async function loginAdmin(
  sql: SqlClient,
  username: string,
  password: string
): Promise<{ token: string; username: string }> {
  const admin = await sql.prepare(
    `SELECT "id","username","passwordHash" FROM "admin" WHERE "username" = ?`,
    username.trim()
  ).first<{ id: string; username: string; passwordHash: string }>();

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    throw new ApiError(401, "Invalid username or password");
  }
  const token = await createSession(sql, admin.id);
  return { token, username: admin.username };
}

/** Change username and/or password (validates + persists). */
export async function updateAccount(
  sql: SqlClient,
  admin: { id: string; username: string },
  body: Record<string, unknown>
): Promise<{ username: string }> {
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const newUsername = String(body.username || "").trim();

  const record = await sql.prepare(
    `SELECT "id","username","passwordHash" FROM "admin" WHERE "id" = ?`,
    admin.id
  ).first<{ id: string; username: string; passwordHash: string }>();
  if (!record) throw new ApiError(404, "Admin not found");

  if (!(await verifyPassword(currentPassword, record.passwordHash))) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const sets: string[] = [];
  const params: unknown[] = [];
  let finalUsername = record.username;

  if (newUsername && newUsername !== record.username) {
    if (newUsername.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters");
    }
    const taken = await sql.prepare(
      `SELECT "id" FROM "admin" WHERE "username" = ? AND "id" <> ?`,
      newUsername,
      record.id
    ).first();
    if (taken) throw new ApiError(400, "Username already taken");
    sets.push(`"username" = ?`);
    params.push(newUsername);
    finalUsername = newUsername;
  }

  if (newPassword) {
    if (newPassword.length < 6) {
      throw new ApiError(400, "New password must be at least 6 characters");
    }
    sets.push(`"passwordHash" = ?`);
    params.push(await hashPassword(newPassword));
  }

  if (sets.length === 0) throw new ApiError(400, "Nothing to update");

  sets.push(`"updatedAt" = ?`);
  params.push(new Date().toISOString());
  params.push(record.id);
  await sql.prepare(`UPDATE "admin" SET ${sets.join(", ")} WHERE "id" = ?`, ...params).run();

  return { username: finalUsername };
}

/* ------------------------------------------------------------------ */
/* Cookies (identical on both platforms)                               */
/* ------------------------------------------------------------------ */

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return part.slice(idx + 1).trim();
    }
  }
  return null;
}
