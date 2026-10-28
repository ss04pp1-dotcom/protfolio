import { NextRequest } from "next/server";
import { getLocalClient } from "@/lib/server/local";
import { createContactMessage } from "@/lib/server/core";
import { json, errorResponse, readJsonBody } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Public contact form endpoint. */
export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    if (!body) return json({ error: "Invalid body" }, 400);
    await createContactMessage(getLocalClient(), body);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to send message");
  }
}
