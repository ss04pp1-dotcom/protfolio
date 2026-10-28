import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { requireAdmin, updateAccount, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const sql = getLocalClient();
    const admin = await requireAdmin(sql, readCookie(req, SESSION_COOKIE));
    const body = await readJsonBody(req);
    if (!body) return json({ error: "Invalid body" }, 400);
    const result = await updateAccount(sql, admin, body);
    return json({ ok: true, username: result.username });
  } catch (e) {
    return errorResponse(e, "Failed to update account");
  }
}
