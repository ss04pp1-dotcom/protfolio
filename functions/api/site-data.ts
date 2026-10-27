/** /api/site-data — public composite endpoint used by the portfolio page. */
import { getSiteData } from "../../src/lib/server/core";
import { json, errorResponse } from "../../src/lib/server/http";
import { sqlFrom, type FunctionContext } from "../_context";

export const onRequestGet = async (context: FunctionContext): Promise<Response> => {
  try {
    const data = await getSiteData(sqlFrom(context));
    return json(data, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to load site data");
  }
};
