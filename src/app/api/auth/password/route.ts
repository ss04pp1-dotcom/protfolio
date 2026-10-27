import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin, hashPassword, verifyPassword, unauthorized } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return unauthorized();

  const body = await req.json().catch(() => null);
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");
  const newUsername = String(body?.username || "").trim();

  const record = await db.admin.findFirst({ where: { username: admin.username } });
  if (!record) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (!verifyPassword(currentPassword, record.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const data: { username?: string; passwordHash?: string } = {};
  if (newUsername && newUsername !== record.username) {
    if (newUsername.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    const taken = await db.admin.findFirst({ where: { username: newUsername } });
    if (taken) return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    data.username = newUsername;
  }
  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }
    data.passwordHash = hashPassword(newPassword);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.admin.update({ where: { id: record.id }, data });
  return NextResponse.json({ ok: true, username: data.username || record.username });
}
