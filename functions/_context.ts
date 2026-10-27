/**
 * Shared context helpers for Cloudflare Pages Functions.
 * NOTE: files prefixed with "_" are NOT routed by Cloudflare Pages —
 * this file is a helper module only.
 */
import { d1Client, type D1Like } from "../src/lib/server/d1";
import type { SqlClient } from "../src/lib/server/sql";

export type Env = { DB: D1Like };

export interface FunctionContext<P = Record<string, string>> {
  request: Request;
  env: Env;
  params: P;
}

/** Build the shared SqlClient from the D1 binding. */
export function sqlFrom(context: FunctionContext): SqlClient {
  return d1Client(context.env.DB);
}
