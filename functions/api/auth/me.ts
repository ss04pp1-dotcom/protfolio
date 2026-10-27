/** /api/auth/me — GET → current admin (401 when logged out). */
import { getAdmin, readCookie, SESSION_COOKIE } from "../../../src/lib/server/auth";
import { json } from "../../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../../_context";

export const onRequestGet = async (context: FunctionContext): Promise<Response> => {
  const sql = sqlFrom(context);
  const admin = await getAdmin(sql, readCookie(context.request, SESSION_COOKIE));
  if (!admin) return json({ error: "Unauthorized" }, 401);
  return json({ username: admin.username });
};
