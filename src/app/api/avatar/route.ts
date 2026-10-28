import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { putSettings } from "@/lib/server/core";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Direct avatar update endpoint so the portfolio owner can upload or reset
 * their profile photo directly from the Hero or About portrait frame.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    if (!body || typeof body.avatarUrl !== "string") {
      return json({ error: "avatarUrl is required" }, 400);
    }
    const avatarUrl = body.avatarUrl.trim();
    const sql = getLocalClient();
    // Allow data URLs up to 500KB or standard URLs
    if (avatarUrl.length > 600_000) {
      return json({ error: "Image is too large. Please choose a smaller photo." }, 400);
    }
    await sql
      .prepare(
        `UPDATE "site_setting" SET "avatarUrl" = ?, "updatedAt" = ? WHERE "id" = 'main'`,
        avatarUrl,
        new Date().toISOString()
      )
      .run();
    const settings = await putSettings(sql, {});
    return json({ ok: true, avatarUrl, settings });
  } catch (e) {
    return errorResponse(e, "Failed to update profile photo");
  }
}
