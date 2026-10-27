/**
 * Minimal DB-agnostic SQL client interface.
 *
 * Implemented identically by:
 *  - Cloudflare D1      (production — via src/lib/server/d1.ts)
 *  - node:sqlite        (local Next.js dev — via src/lib/server/local.ts)
 *  - bun:sqlite         (local setup scripts)
 *
 * Both runtimes are SQLite, so one shared SQL dialect powers everything.
 */

export interface SqlStatement {
  all<T = Record<string, unknown>>(): Promise<T[]>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<void>;
}

export interface SqlClient {
  prepare(sql: string, ...params: unknown[]): SqlStatement;
}

/** Quote a SQLite identifier (always — keeps `"order"` etc. safe). */
export function q(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

/** Comma-joined `?` placeholders. */
export function placeholders(n: number): string {
  return Array.from({ length: n }, () => "?").join(", ");
}
