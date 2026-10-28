import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { getSettings, putSettings } from "@/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings(getLocalClient());
    return json(settings, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to load settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getLocalClient();
    await requireAdmin(sql, readCookie(req, SESSION_COOKIE));

    const body = await readJsonBody(req);
    if (!body) return json({ error: "Invalid body" }, 400);

    const settings = await putSettings(sql, body);
    return json(settings);
  } catch (e) {
    return errorResponse(e, "Failed to save settings");
  }
}
