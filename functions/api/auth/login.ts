/** /api/auth/login — POST { username, password } → session cookie. */
import { loginAdmin, sessionCookie } from "../../../src/lib/server/auth";
import { json, errorResponse, readJsonBody } from "../../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../../_context";

export const onRequestPost = async (context: FunctionContext): Promise<Response> => {
  try {
    const body = await readJsonBody(context.request);
    if (!body?.username || !body?.password) {
      return json({ error: "Username and password required" }, 400);
    }
    const sql = sqlFrom(context);
    const { token, username } = await loginAdmin(sql, String(body.username), String(body.password));
    return json({ ok: true, username }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    return errorResponse(e, "Login failed");
  }
};
