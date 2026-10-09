/**
 * Report AI service (Cloudflare Worker).
 *
 * POST /v1/structure  { transcript, language, trade, equipment, appUserId }
 *   → 200 { report, model }
 *
 * Cost control:
 *  - Model: Claude Haiku 5.5 by default (cheapest current Claude model), effort "low", thinking off.
 *  - Free users: FREE_AI_LIMIT reports in total. Pro users: PRO_MONTHLY_LIMIT reports per month.
 *  - All users together: GLOBAL_DAILY_LIMIT reports per day (protects the bill).
 * When the service says no (429/5xx), the app formats the report offline, so the user is never blocked.
 */
import Anthropic from "@anthropic-ai/sdk";

import {
  buildUserMessage,
  dayKey,
  entitlementActive,
  monthKey,
  parseRequest,
  REPORT_SCHEMA,
  SYSTEM_PROMPT,
  toReportContent,
  type ReportContent,
  type StructureRequest,
} from "./report";

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** Shared key sent by the app in the x-app-key header. Optional but recommended. */
  APP_KEY?: string;
  /** RevenueCat secret API key (v1). Without it every user is treated as free. */
  REVENUECAT_SECRET?: string;
  ENTITLEMENT_ID?: string;
  MODEL?: string;
  FREE_AI_LIMIT?: string;
  PRO_MONTHLY_LIMIT?: string;
  GLOBAL_DAILY_LIMIT?: string;
  USAGE: KVNamespace;
}

export interface Deps {
  callModel: (env: Env, req: StructureRequest) => Promise<ModelResult>;
  isPro: (env: Env, appUserId: string) => Promise<boolean>;
}

export type ModelResult = { ok: true; report: ReportContent; model: string } | { ok: false; status: number; error: string };

const DEFAULT_MODEL = "claude-haiku-5-5";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function readCount(kv: KVNamespace, key: string): Promise<number> {
  return Number((await kv.get(key)) ?? "0") || 0;
}

/** KV counters are not atomic. A small overshoot under parallel requests is acceptable here. */
async function bump(kv: KVNamespace, key: string, ttlSeconds?: number): Promise<void> {
  const n = (await readCount(kv, key)) + 1;
  await kv.put(key, String(n), ttlSeconds ? { expirationTtl: ttlSeconds } : undefined);
}

export async function callClaude(env: Env, req: StructureRequest): Promise<ModelResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 20_000 });
  const model = env.MODEL || DEFAULT_MODEL;
  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      thinking: { type: "disabled" },
      output_config: { effort: "low", format: { type: "json_schema", schema: REPORT_SCHEMA } },
      messages: [{ role: "user", content: buildUserMessage(req) }],
    });
    if (response.stop_reason === "refusal") return { ok: false, status: 422, error: "refused" };
    if (response.stop_reason === "max_tokens") return { ok: false, status: 502, error: "output too long" };
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return { ok: false, status: 502, error: "no text in response" };
    let parsed: unknown;
    try {
      parsed = JSON.parse(text.text);
    } catch {
      return { ok: false, status: 502, error: "invalid JSON from model" };
    }
    const report = toReportContent(parsed);
    return report ? { ok: true, report, model: response.model } : { ok: false, status: 502, error: "empty report" };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { ok: false, status: 503, error: "model rate limited" };
    if (e instanceof Anthropic.APIError) return { ok: false, status: 502, error: `model error ${e.status ?? ""}`.trim() };
    return { ok: false, status: 502, error: "model not reachable" };
  }
}

export async function revenueCatIsPro(env: Env, appUserId: string): Promise<boolean> {
  if (!env.REVENUECAT_SECRET) return false;
  const cacheKey = `ent:${appUserId}`;
  const cached = await env.USAGE.get(cacheKey);
  if (cached !== null) return cached === "1";
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { authorization: `Bearer ${env.REVENUECAT_SECRET}` },
  });
  if (!res.ok) return false;
  const pro = entitlementActive(await res.json(), env.ENTITLEMENT_ID || "pro");
  await env.USAGE.put(cacheKey, pro ? "1" : "0", { expirationTtl: 3600 });
  return pro;
}

const defaultDeps: Deps = { callModel: callClaude, isPro: revenueCatIsPro };

export async function handle(request: Request, env: Env, deps: Deps = defaultDeps): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") return json({ ok: true });
  if (url.pathname !== "/v1/structure") return json({ error: "not found" }, 404);
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (env.APP_KEY && request.headers.get("x-app-key") !== env.APP_KEY) return json({ error: "unauthorized" }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const parsed = parseRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const req = parsed.value;

  // 1. Global daily limit
  const now = new Date();
  const dayCounter = `day:${dayKey(now)}`;
  if ((await readCount(env.USAGE, dayCounter)) >= num(env.GLOBAL_DAILY_LIMIT, 5000)) {
    return json({ error: "daily capacity reached" }, 429);
  }

  // 2. Per-user limit
  const pro = await deps.isPro(env, req.appUserId);
  const userCounter = pro ? `pro:${req.appUserId}:${monthKey(now)}` : `free:${req.appUserId}`;
  const limit = pro ? num(env.PRO_MONTHLY_LIMIT, 300) : num(env.FREE_AI_LIMIT, 3);
  if ((await readCount(env.USAGE, userCounter)) >= limit) return json({ error: "limit reached", pro }, 429);

  // 3. Model call
  const result = await deps.callModel(env, req);
  if (!result.ok) return json({ error: result.error }, result.status);

  await Promise.all([
    bump(env.USAGE, dayCounter, 2 * 86400),
    bump(env.USAGE, userCounter, pro ? 40 * 86400 : undefined),
  ]);
  return json({ report: result.report, model: result.model });
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env);
  },
};
