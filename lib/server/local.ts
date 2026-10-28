import { DatabaseSync, type StatementSync, type SQLInputValue } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { SqlClient, SqlStatement } from "./sql";

let cached: SqlClient | null = null;

function bootstrapSchemaAndSeed(db: DatabaseSync) {
  try {
    const check = db
      .prepare(
        `SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table' AND name='site_setting'`
      )
      .get() as { c: number } | undefined;

    if (!check || check.c === 0) {
      const initPath = join(process.cwd(), "sql", "0000_init.sql");
      const seedPath = join(process.cwd(), "sql", "seed.sql");
      if (existsSync(initPath)) {
        db.exec(readFileSync(initPath, "utf-8"));
      }
      if (existsSync(seedPath)) {
        db.exec(readFileSync(seedPath, "utf-8"));
      }
    } else {
      const mainRow = db
        .prepare(`SELECT "avatarUrl" FROM "site_setting" WHERE "id" = 'main'`)
        .get() as { avatarUrl?: string } | undefined;
      if (!mainRow) {
        const seedPath = join(process.cwd(), "sql", "seed.sql");
        if (existsSync(seedPath)) {
          db.exec(readFileSync(seedPath, "utf-8"));
        }
      } else if (!mainRow.avatarUrl) {
        // Ensure default avatar is populated if empty
        db.prepare(
          `UPDATE "site_setting" SET "avatarUrl" = '/images/avatar.svg' WHERE "id" = 'main'`
        ).run();
      }
    }
  } catch (err) {
    console.error("[sqlite-bootstrap] Failed to initialize schema/seed:", err);
  }
}

export function getLocalClient(): SqlClient {
  if (cached) return cached;

  const dbPath =
    process.env.PORTFOLIO_DB_PATH || join(process.cwd(), "db", "portfolio.db");

  let db: DatabaseSync;
  try {
    mkdirSync(dirname(dbPath), { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA busy_timeout = 5000;");
  } catch (err) {
    console.warn(
      "[sqlite-bootstrap] Filesystem DB unavailable, falling back to in-memory SQLite:",
      err
    );
    db = new DatabaseSync(":memory:");
  }

  bootstrapSchemaAndSeed(db);

  const stmtCache = new Map<string, StatementSync>();

  function getStmt(sql: string): StatementSync {
    let stmt = stmtCache.get(sql);
    if (!stmt) {
      stmt = db.prepare(sql);
      if (stmtCache.size > 200) {
        const firstKey = stmtCache.keys().next().value;
        if (firstKey) stmtCache.delete(firstKey);
      }
      stmtCache.set(sql, stmt);
    }
    return stmt;
  }

  cached = {
    prepare(sql: string, ...params: unknown[]): SqlStatement {
      const safeParams = params as SQLInputValue[];
      return {
        async all<T>() {
          return getStmt(sql).all(...safeParams) as unknown as T[];
        },
        async first<T>() {
          return (getStmt(sql).get(...safeParams) ?? null) as unknown as T | null;
        },
        async run() {
          getStmt(sql).run(...safeParams);
        },
      };
    },
  };

  return cached;
}
