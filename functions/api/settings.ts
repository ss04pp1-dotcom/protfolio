/** /api/settings — GET public, PUT admin-guarded. */
import { getSettings, putSettings } from "../../src/lib/server/core";
import { requireAdmin, readCookie, SESSION_COOKIE } from "../../src/lib/server/auth";
import { json, errorResponse, readJsonBody } from "../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../_context";

export const onRequestGet = async (context: FunctionContext): Promise<Response> => {
  try {
    const settings = await getSettings(sqlFrom(context));
    return json(settings, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to load settings");
  }
};

export const onRequestPut = async (context: FunctionContext): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));

    const body = await readJsonBody(context.request);
    if (!body) return json({ error: "Invalid body" }, 400);

    const settings = await putSettings(sql, body);
    return json(settings);
  } catch (e) {
    return errorResponse(e, "Failed to save settings");
  }
};
