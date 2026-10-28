import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { destroySession, clearSessionCookie, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sql = getLocalClient();
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await destroySession(sql, token);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
