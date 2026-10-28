import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { ENTITIES, updateEntity, deleteEntity, moveEntity } from "@/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "@/lib/server/auth";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string; id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const sql = getLocalClient();
    await requireAdmin(sql, readCookie(req, SESSION_COOKIE));

    const { entity, id } = await ctx.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const body = await readJsonBody(req);
    if (!body) return json({ error: "Invalid body" }, 400);

    // Reorder helper: { move: "up" | "down" }
    if ((body.move === "up" || body.move === "down") && def.fields.order) {
      await moveEntity(sql, def, id, body.move);
      return json({ ok: true });
    }

    const item = await updateEntity(sql, def, id, body);
    return json(item);
  } catch (e) {
    return errorResponse(e, "Update failed");
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const sql = getLocalClient();
    await requireAdmin(sql, readCookie(req, SESSION_COOKIE));

    const { entity, id } = await ctx.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    await deleteEntity(sql, def, id);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Delete failed");
  }
}
