/**
 * Shared HTTP helpers usable from both Next.js API routes and
 * Cloudflare Pages Functions (pure Web-standard Request/Response).
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/** Log + convert any thrown value into a 500 JSON response. */
export function errorResponse(e: unknown, fallback = "Server error"): Response {
  if (e instanceof ApiError) {
    return json({ error: e.message }, e.status);
  }
  console.error("[api]", e);
  return json({ error: fallback }, 500);
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
