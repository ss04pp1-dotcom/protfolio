import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { getAdmin, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sql = getLocalClient();
  const admin = await getAdmin(sql, readCookie(req, SESSION_COOKIE));
  if (!admin) return json({ error: "Unauthorized" }, 401);
  return json({ username: admin.username });
}
