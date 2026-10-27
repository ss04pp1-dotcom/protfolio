/** /api/crud/[entity]/[id] — PUT (admin) update/move, DELETE (admin). */
import { ENTITIES, updateEntity, deleteEntity, moveEntity } from "../../../src/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "../../../src/lib/server/auth";
import { json, errorResponse, readJsonBody } from "../../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../../_context";

type Ctx = FunctionContext<{ entity: string; id: string }>;

export const onRequestPut = async (context: Ctx): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));

    const { entity, id } = context.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const body = await readJsonBody(context.request);
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
};

export const onRequestDelete = async (context: Ctx): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));

    const { entity, id } = context.params;
    const def = ENTITIES[entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    await deleteEntity(sql, def, id);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Delete failed");
  }
};
