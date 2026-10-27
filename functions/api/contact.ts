/** /api/contact — public contact form endpoint. */
import { createContactMessage } from "../../src/lib/server/core";
import { json, errorResponse, readJsonBody } from "../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../_context";

export const onRequestPost = async (context: FunctionContext): Promise<Response> => {
  try {
    const body = await readJsonBody(context.request);
    if (!body) return json({ error: "Invalid body" }, 400);
    await createContactMessage(sqlFrom(context), body);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to send message");
  }
};
