import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { loginAdmin, sessionCookie } from "@/lib/server/auth";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    if (!body?.username || !body?.password) {
      return json({ error: "Username and password required" }, 400);
    }
    const sql = getLocalClient();
    const { token, username } = await loginAdmin(sql, String(body.username), String(body.password));
    return json({ ok: true, username }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    return errorResponse(e, "Login failed");
  }
}
