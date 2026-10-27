/** /api/auth/logout — POST → clears session. */
import { destroySession, clearSessionCookie, readCookie, SESSION_COOKIE } from "../../../src/lib/server/auth";
import { json } from "../../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../../_context";

export const onRequestPost = async (context: FunctionContext): Promise<Response> => {
  const sql = sqlFrom(context);
  const token = readCookie(context.request, SESSION_COOKIE);
  if (token) await destroySession(sql, token);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
};
