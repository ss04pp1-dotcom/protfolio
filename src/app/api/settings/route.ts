import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EDITABLE = [
  "siteTitle",
  "ownerName",
  "heroGreeting",
  "heroRoles",
  "heroTagline",
  "avatarUrl",
  "aboutTitle",
  "aboutText",
  "resumeUrl",
  "email",
  "phone",
  "location",
  "availability",
  "primaryColor",
  "accentColor",
  "marqueeText",
  "footerText",
] as const;

export async function GET() {
  const settings = await db.siteSetting.findUnique({ where: { id: "main" } });
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return unauthorized();

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, string> = {};
  for (const key of EDITABLE) {
    if (key in body) {
      data[key] = String(body[key] ?? "").slice(0, 5000);
    }
  }
  // basic color format validation
  for (const ck of ["primaryColor", "accentColor"] as const) {
    if (ck in data && !/^#[0-9a-fA-F]{6}$/.test(data[ck])) {
      return NextResponse.json({ error: `${ck} must be a hex color like #8b5cf6` }, { status: 400 });
    }
  }

  const settings = await db.siteSetting.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  return NextResponse.json(settings);
}
