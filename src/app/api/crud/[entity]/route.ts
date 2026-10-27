import { NextRequest, NextResponse } from "next/server";
import { getAdmin, unauthorized } from "@/lib/auth";
import { ENTITIES, getDelegate, sanitize } from "@/lib/entities";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await getAdmin();
  if (!admin) return unauthorized();

  const { entity } = await ctx.params;
  const def = ENTITIES[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });

  const items = await getDelegate(def).findMany({
    orderBy: def.fields.order ? [{ order: "asc" }] : [{ createdAt: "asc" }],
  });
  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { entity } = await ctx.params;
  const def = ENTITIES[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Public create only allowed for whitelisted entities (messages)
  if (!def.publicCreate) {
    const admin = await getAdmin();
    if (!admin) return unauthorized();
  }

  const data = sanitize(def, body, { allowOrder: true });

  if (def.fields.order && data.order === undefined) {
    const agg = await getDelegate(def).aggregate({ _max: { order: true } });
    data.order = (agg._max.order ?? 0) + 1;
  }

  try {
    const item = await getDelegate(def).create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(`create ${entity} error`, e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
