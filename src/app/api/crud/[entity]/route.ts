import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { ENTITIES, listEntity, createEntity } from "@/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const sql = getLocalClient();
    await requireAdmin(sql, readCookie(req, SESSION_COOKIE));

    const { entity } = await ctx.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const items = await listEntity(sql, def);
    return json(items, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to list items");
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const sql = getLocalClient();
    const { entity } = await ctx.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const body = await readJsonBody(req);
    if (!body) return json({ error: "Invalid body" }, 400);

    // Public create only allowed for whitelisted entities (messages)
    if (!def.publicCreate) {
      await requireAdmin(sql, readCookie(req, SESSION_COOKIE));
    }

    const item = await createEntity(sql, def, body);
    return json(item, 201);
  } catch (e) {
    return errorResponse(e, "Create failed");
  }
}
