import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public composite endpoint used by the portfolio page. */
export async function GET() {
  try {
    const [settings, skills, projects, experiences, education, services, testimonials, socialLinks, stats] =
      await Promise.all([
        db.siteSetting.findUnique({ where: { id: "main" } }),
        db.skill.findMany({ orderBy: [{ order: "asc" }] }),
        db.project.findMany({ orderBy: [{ order: "asc" }] }),
        db.experience.findMany({ orderBy: [{ order: "asc" }] }),
        db.education.findMany({ orderBy: [{ order: "asc" }] }),
        db.service.findMany({ orderBy: [{ order: "asc" }] }),
        db.testimonial.findMany({ orderBy: [{ order: "asc" }] }),
        db.socialLink.findMany({ orderBy: [{ order: "asc" }] }),
        db.stat.findMany({ orderBy: [{ order: "asc" }] }),
      ]);

    return NextResponse.json(
      {
        settings,
        skills,
        projects,
        experiences,
        education,
        services,
        testimonials,
        socialLinks,
        stats,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("site-data error", e);
    return NextResponse.json({ error: "Failed to load site data" }, { status: 500 });
  }
}
