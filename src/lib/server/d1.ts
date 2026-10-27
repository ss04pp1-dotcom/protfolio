/**
 * Cloudflare D1 adapter (production). Implements the same SqlClient
 * interface as the local adapter using structural typing — no external
 * `@cloudflare/workers-types` dependency required.
 */
import type { SqlClient, SqlStatement } from "./sql";

/** Minimal structural shape of a D1 prepared statement / binding. */
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

/** Minimal structural shape of the D1 binding. */
export interface D1Like {
  prepare(sql: string): D1PreparedStatement;
}

export function d1Client(db: D1Like): SqlClient {
  return {
    prepare(sql: string, ...params: unknown[]): SqlStatement {
      const stmt = params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);
      return {
        async all<T>() {
          const res = await stmt.all<T>();
          return res.results as T[];
        },
        async first<T>() {
          return (await stmt.first<T>()) as T | null;
        },
        async run() {
          await stmt.run();
        },
      };
    },
  };
}
