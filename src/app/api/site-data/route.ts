import { getLocalClient } from "@/lib/server/local";
import { getSiteData } from "@/lib/server/core";
import { json, errorResponse } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Public composite endpoint used by the portfolio page. */
export async function GET() {
  try {
    const data = await getSiteData(getLocalClient());
    return json(data, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    return errorResponse(e, "Failed to load site data");
  }
}
