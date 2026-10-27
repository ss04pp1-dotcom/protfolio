-- ============================================================
-- Portfolio CMS schema — shared by Cloudflare D1 (production)
-- and node:sqlite / bun:sqlite (local development).
-- All identifiers are quoted so names like "order" stay safe.
-- Idempotent: safe to run on every deploy.
-- ============================================================

CREATE TABLE IF NOT EXISTS "admin" (
  "id"           TEXT PRIMARY KEY,
  "username"     TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt"    TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
  "updatedAt"    TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "session" (
  "token"     TEXT PRIMARY KEY,
  "adminId"   TEXT NOT NULL REFERENCES "admin"("id") ON DELETE CASCADE,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);
CREATE INDEX IF NOT EXISTS "session_adminId_idx" ON "session"("adminId");

CREATE TABLE IF NOT EXISTS "site_setting" (
  "id"           TEXT PRIMARY KEY,
  "siteTitle"    TEXT NOT NULL DEFAULT 'Portfolio',
  "ownerName"    TEXT NOT NULL DEFAULT 'Your Name',
  "heroGreeting" TEXT NOT NULL DEFAULT 'Hello, I''m',
  "heroRoles"    TEXT NOT NULL DEFAULT 'Full-Stack Developer, UI/UX Designer, Creative Coder',
  "heroTagline"  TEXT NOT NULL DEFAULT '',
  "avatarUrl"    TEXT NOT NULL DEFAULT '',
  "aboutTitle"   TEXT NOT NULL DEFAULT 'About Me',
  "aboutText"    TEXT NOT NULL DEFAULT '',
  "resumeUrl"    TEXT NOT NULL DEFAULT '',
  "email"        TEXT NOT NULL DEFAULT '',
  "phone"        TEXT NOT NULL DEFAULT '',
  "location"     TEXT NOT NULL DEFAULT '',
  "availability" TEXT NOT NULL DEFAULT 'Available for work',
  "primaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
  "accentColor"  TEXT NOT NULL DEFAULT '#d946ef',
  "marqueeText"  TEXT NOT NULL DEFAULT '',
  "footerText"   TEXT NOT NULL DEFAULT '',
  "updatedAt"    TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "skill" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL DEFAULT '',
  "category"  TEXT NOT NULL DEFAULT 'Other',
  "level"     INTEGER NOT NULL DEFAULT 80,
  "icon"      TEXT NOT NULL DEFAULT 'Sparkles',
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "project" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "imageUrl"    TEXT NOT NULL DEFAULT '',
  "tags"        TEXT NOT NULL DEFAULT '',
  "githubUrl"   TEXT NOT NULL DEFAULT '',
  "liveUrl"     TEXT NOT NULL DEFAULT '',
  "featured"    INTEGER NOT NULL DEFAULT 0,
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "experience" (
  "id"          TEXT PRIMARY KEY,
  "role"        TEXT NOT NULL DEFAULT '',
  "company"     TEXT NOT NULL DEFAULT '',
  "period"      TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "current"     INTEGER NOT NULL DEFAULT 0,
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "education" (
  "id"          TEXT PRIMARY KEY,
  "degree"      TEXT NOT NULL DEFAULT '',
  "institution" TEXT NOT NULL DEFAULT '',
  "period"      TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "service" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "icon"        TEXT NOT NULL DEFAULT 'Sparkles',
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "testimonial" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL DEFAULT '',
  "role"      TEXT NOT NULL DEFAULT '',
  "company"   TEXT NOT NULL DEFAULT '',
  "content"   TEXT NOT NULL DEFAULT '',
  "avatarUrl" TEXT NOT NULL DEFAULT '',
  "rating"    INTEGER NOT NULL DEFAULT 5,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "social_link" (
  "id"       TEXT PRIMARY KEY,
  "platform" TEXT NOT NULL DEFAULT '',
  "url"      TEXT NOT NULL DEFAULT '',
  "icon"     TEXT NOT NULL DEFAULT 'Link',
  "order"    INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "stat" (
  "id"     TEXT PRIMARY KEY,
  "label"  TEXT NOT NULL DEFAULT '',
  "value"  INTEGER NOT NULL DEFAULT 0,
  "suffix" TEXT NOT NULL DEFAULT '+',
  "order"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);

CREATE TABLE IF NOT EXISTS "message" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL DEFAULT '',
  "email"     TEXT NOT NULL DEFAULT '',
  "subject"   TEXT NOT NULL DEFAULT '',
  "content"   TEXT NOT NULL DEFAULT '',
  "read"      INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);
CREATE INDEX IF NOT EXISTS "message_createdAt_idx" ON "message"("createdAt");

-- Deployment bookkeeping (used by the GitHub Action to detect first-run seeding).
CREATE TABLE IF NOT EXISTS "_meta" (
  "key"   TEXT PRIMARY KEY,
  "value" TEXT NOT NULL DEFAULT ''
);
