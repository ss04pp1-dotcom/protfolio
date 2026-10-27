/**
 * Idempotent local DB bootstrap — creates db/portfolio.db ONLY when it
 * is missing or empty (non-destructive: existing data is never wiped).
 *
 * Wired as `bun run db:push` so the sandbox/dev startup script keeps
 * working; also safe to run anytime.
 *
 * Usage: bun scripts/ensure-local-db.ts   (or: bun run db:push)
 */
import { Database } from "bun:sqlite";
import { existsSync, rmSync, mkdirSync } from "node:fs";

mkdirSync("db", { recursive: true });

const DB_PATH = "db/portfolio.db";

function isEmptyOrMissing(): boolean {
  if (!existsSync(DB_PATH)) return true;
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.query(
      `SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'`
    ).get() as { c: number };
    db.close();
    return row.c === 0;
  } catch {
    // Corrupt/unreadable file → treat as empty and rebuild it.
    return true;
  }
}

if (!isEmptyOrMissing()) {
  console.log(`✓ ${DB_PATH} already exists — nothing to do (existing data kept).`);
  process.exit(0);
}

console.log(`→ ${DB_PATH} missing or empty — creating from sql/0000_init.sql + sql/seed.sql…`);
if (existsSync(DB_PATH)) rmSync(DB_PATH);

const initSql = await Bun.file("sql/0000_init.sql").text();
const seedSql = await Bun.file("sql/seed.sql").text();

const db = new Database(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(initSql);
db.exec(seedSql);

const n = (db.query(`SELECT COUNT(*) AS c FROM "skill"`).get() as { c: number }).c;
db.close();
console.log(`✓ local database ready at ${DB_PATH} (${n} skills seeded)`);
