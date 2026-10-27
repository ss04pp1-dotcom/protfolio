import { NextRequest, NextResponse } from "next/server";
import { getAdmin, unauthorized } from "@/lib/auth";
import { ENTITIES, getDelegate, sanitize } from "@/lib/entities";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string; id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const admin = await getAdmin();
  if (!admin) return unauthorized();

  const { entity, id } = await ctx.params;
  const def = ENTITIES[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });

  const delegate = getDelegate(def);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    // Reorder helper: { move: "up" | "down" }
    if ((body.move === "up" || body.move === "down") && def.fields.order) {
      const items = (await delegate.findMany({
        orderBy: [{ order: "asc" }],
      })) as { id: string; order: number }[];
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      const swapWith = body.move === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= items.length) return NextResponse.json({ ok: true });

      const a = items[idx];
      const b = items[swapWith];
      await delegate.update({ where: { id: a.id }, data: { order: b.order } });
      await delegate.update({ where: { id: b.id }, data: { order: a.order } });
      return NextResponse.json({ ok: true });
    }

    const data = sanitize(def, body, { allowOrder: true });
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    const item = await delegate.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (e) {
    console.error(`update ${entity} error`, e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await getAdmin();
  if (!admin) return unauthorized();

  const { entity, id } = await ctx.params;
  const def = ENTITIES[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });

  try {
    await getDelegate(def).delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`delete ${entity} error`, e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
