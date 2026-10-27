/** /api/crud/[entity] — GET (admin) list, POST create (public for messages). */
import { ENTITIES, listEntity, createEntity } from "../../src/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "../../src/lib/server/auth";
import { json, errorResponse, readJsonBody } from "../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../_context";

type Ctx = FunctionContext<{ entity: string }>;

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));

    const def = ENTITIES[context.params.entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const items = await listEntity(sql, def);
    return json(items, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to list items");
  }
};

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    const def = ENTITIES[context.params.entity];
    if (!def) return json({ error: "Unknown entity" }, 404);

    const body = await readJsonBody(context.request);
    if (!body) return json({ error: "Invalid body" }, 400);

    // Public create only allowed for whitelisted entities (messages)
    if (!def.publicCreate) {
      await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));
    }

    const item = await createEntity(sql, def, body);
    return json(item, 201);
  } catch (e) {
    return errorResponse(e, "Create failed");
  }
};
