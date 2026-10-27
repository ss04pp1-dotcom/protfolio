/**
 * (Re)creates the local development database db/portfolio.db from
 * sql/0000_init.sql + sql/seed.sql. Uses bun:sqlite.
 *
 * Usage: bun scripts/setup-local.ts   (or: bun run db:setup)
 */
import { Database } from "bun:sqlite";
import { rmSync, existsSync, mkdirSync } from "node:fs";

mkdirSync("db", { recursive: true });
const DB_PATH = "db/portfolio.db";

if (existsSync(DB_PATH)) {
  rmSync(DB_PATH);
  console.log(`✓ removed old ${DB_PATH}`);
}

const initSql = await Bun.file("sql/0000_init.sql").text();
const seedSql = await Bun.file("sql/seed.sql").text();

const db = new Database(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(initSql);
db.exec(seedSql);

// sanity check
for (const t of ["admin", "site_setting", "skill", "project", "experience", "education", "service", "testimonial", "social_link", "stat", "message", "_meta"]) {
  const n = (db.query(`SELECT COUNT(*) AS c FROM "${t}"`).get() as { c: number }).c;
  console.log(`  ${t.padEnd(14)} ${n} rows`);
}
db.close();
console.log(`✓ local database ready at ${DB_PATH}`);
