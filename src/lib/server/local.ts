/**
 * Local development adapter — node:sqlite (built into Node 22.5+/24).
 * Used only by the Next.js API routes in local dev; the Cloudflare
 * deployment uses src/lib/server/d1.ts instead.
 */
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import type { SqlClient, SqlStatement } from "./sql";

let cached: SqlClient | null = null;

export function getLocalClient(): SqlClient {
  if (cached) return cached;

  const dbPath =
    process.env.PORTFOLIO_DB_PATH || join(process.cwd(), "db", "portfolio.db");
  const db = new DatabaseSync(dbPath);

  cached = {
    prepare(sql: string, ...params: unknown[]): SqlStatement {
      const stmt = db.prepare(sql);
      return {
        async all<T>() {
          return stmt.all(...params) as unknown as T[];
        },
        async first<T>() {
          return (stmt.get(...params) ?? null) as unknown as T | null;
        },
        async run() {
          stmt.run(...params);
        },
      };
    },
  };
  return cached;
}
