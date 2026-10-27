/** /api/auth/password — PUT (admin) → change username/password. */
import { requireAdmin, updateAccount, readCookie, SESSION_COOKIE } from "../../../src/lib/server/auth";
import { json, errorResponse, readJsonBody } from "../../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../../_context";

export const onRequestPut = async (context: FunctionContext): Promise<Response> => {
  try {
    const sql = sqlFrom(context);
    const admin = await requireAdmin(sql, readCookie(context.request, SESSION_COOKIE));
    const body = await readJsonBody(context.request);
    if (!body) return json({ error: "Invalid body" }, 400);
    const result = await updateAccount(sql, admin, body);
    return json({ ok: true, username: result.username });
  } catch (e) {
    return errorResponse(e, "Failed to update account");
  }
};
