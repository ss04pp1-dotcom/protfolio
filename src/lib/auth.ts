import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE = "portfolio_admin_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const derived = scryptSync(password, salt, 64);
    const target = Buffer.from(hash, "hex");
    return derived.length === target.length && timingSafeEqual(derived, target);
  } catch {
    return false;
  }
}

export function newSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: { token, adminId, expiresAt: newSessionExpiry() },
  });
  return token;
}

export async function destroySession(token: string) {
  await db.session.delete({ where: { token } }).catch(() => {});
}

/** Returns the authenticated admin username or null. */
export async function getAdmin(): Promise<{ username: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await destroySession(token);
    return null;
  }

  return { username: session.admin.username };
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
