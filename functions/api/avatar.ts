/** /api/avatar — PUT updates site_setting.avatarUrl in Cloudflare D1. */
import { putSettings } from "../../src/lib/server/core";
import { json, errorResponse, readJsonBody } from "../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../_context";

export const onRequestPut = async (context: FunctionContext): Promise<Response> => {
  try {
    const body = await readJsonBody(context.request);
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";
    if (!avatarUrl) {
      return json({ error: "avatarUrl is required" }, 400);
    }
    const settings = await putSettings(sqlFrom(context), { avatarUrl });
    return json({ ok: true, avatarUrl: settings.avatarUrl ?? avatarUrl });
  } catch (e) {
    return errorResponse(e, "Failed to update avatar");
  }
};
