import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Public contact form endpoint. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const content = String(body?.content || "").trim();

    if (!name || !email || !content) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    await db.message.create({
      data: { name: name.slice(0, 120), email: email.slice(0, 200), subject: subject.slice(0, 200), content },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact error", e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
