import { describe, expect, it, vi } from "vitest";

import { handle, type Deps, type Env } from "../src/index";
import { buildUserMessage, entitlementActive, parseRequest, REPORT_SCHEMA, toReportContent } from "../src/report";

/** In-memory stand-in for a KV namespace (only the methods the worker uses). */
function fakeKv() {
  const store = new Map<string, string>();
  return {
    store,
    kv: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => {
        store.set(k, v);
      },
    } as unknown as KVNamespace,
  };
}

const REPORT = {
  title: "Pump repair",
  summary: "Leak fixed.",
  workPerformed: ["Seal replaced"],
  findings: ["Seal leak"],
  partsUsed: [{ name: "Seal kit", quantity: "1" }],
  recommendations: [],
  followUpRequired: false,
};

function setup(opts: { pro?: boolean; env?: Partial<Env> } = {}) {
  const { store, kv } = fakeKv();
  const env: Env = { ANTHROPIC_API_KEY: "test", APP_KEY: "secret", USAGE: kv, ...opts.env };
  const callModel = vi.fn<Deps["callModel"]>(async () => ({ ok: true, report: REPORT, model: "claude-haiku-5-5" }));
  const deps: Deps = { callModel, isPro: async () => opts.pro ?? false };
  return { env, deps, callModel, store };
}

function post(body: unknown, key = "secret") {
  return new Request("https://w.example/v1/structure", {
    method: "POST",
    headers: { "content-type": "application/json", "x-app-key": key },
    body: JSON.stringify(body),
  });
}

const BODY = { transcript: "Seal was leaking, I replaced it.", language: "en", trade: "machine", equipment: "P-101", appUserId: "$RCAnonymousID:abc123" };

describe("handler", () => {
  it("returns the report and counts usage", async () => {
    const { env, deps, store } = setup();
    const res = await handle(post(BODY), env, deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ report: REPORT, model: "claude-haiku-5-5" });
    expect(store.get("free:$RCAnonymousID:abc123")).toBe("1");
    expect([...store.keys()].some((k) => k.startsWith("day:"))).toBe(true);
  });

  it("rejects a wrong app key", async () => {
    const { env, deps } = setup();
    expect((await handle(post(BODY, "wrong"), env, deps)).status).toBe(401);
  });

  it("rejects bad input", async () => {
    const { env, deps, callModel } = setup();
    expect((await handle(post({ ...BODY, transcript: "" }), env, deps)).status).toBe(400);
    expect((await handle(post({ ...BODY, language: "ja" }), env, deps)).status).toBe(400);
    expect((await handle(post({ ...BODY, appUserId: "x" }), env, deps)).status).toBe(400);
    expect(callModel).not.toHaveBeenCalled();
  });

  it("stops free users after the free limit", async () => {
    const { env, deps, callModel } = setup({ env: { FREE_AI_LIMIT: "2" } });
    expect((await handle(post(BODY), env, deps)).status).toBe(200);
    expect((await handle(post(BODY), env, deps)).status).toBe(200);
    expect((await handle(post(BODY), env, deps)).status).toBe(429);
    expect(callModel).toHaveBeenCalledTimes(2);
  });

  it("uses the monthly limit for pro users", async () => {
    const { env, deps, store } = setup({ pro: true, env: { FREE_AI_LIMIT: "0" } });
    expect((await handle(post(BODY), env, deps)).status).toBe(200);
    expect([...store.keys()].some((k) => k.startsWith("pro:$RCAnonymousID:abc123:"))).toBe(true);
  });

  it("stops everyone at the global daily limit", async () => {
    const { env, deps } = setup({ env: { GLOBAL_DAILY_LIMIT: "1" } });
    expect((await handle(post(BODY), env, deps)).status).toBe(200);
    expect((await handle(post({ ...BODY, appUserId: "other-user-1" }), env, deps)).status).toBe(429);
  });

  it("does not count failed model calls", async () => {
    const { env, deps, store } = setup();
    deps.callModel = async () => ({ ok: false, status: 502, error: "x" });
    expect((await handle(post(BODY), env, deps)).status).toBe(502);
    expect(store.size).toBe(0);
  });

  it("answers health checks and unknown routes", async () => {
    const { env, deps } = setup();
    expect((await handle(new Request("https://w.example/health"), env, deps)).status).toBe(200);
    expect((await handle(new Request("https://w.example/nope"), env, deps)).status).toBe(404);
  });
});

describe("helpers", () => {
  it("builds the user message with the notes inside tags", () => {
    const p = parseRequest(BODY);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    const msg = buildUserMessage(p.value);
    expect(msg).toContain("Report language: English");
    expect(msg).toContain("Equipment: P-101");
    expect(msg).toContain("<notes>\nSeal was leaking, I replaced it.\n</notes>");
  });

  it("schema requires every field and allows no extra fields", () => {
    expect(REPORT_SCHEMA.additionalProperties).toBe(false);
    expect([...REPORT_SCHEMA.required].sort()).toEqual(Object.keys(REPORT_SCHEMA.properties).sort());
  });

  it("validates model output", () => {
    expect(toReportContent(REPORT)).toEqual(REPORT);
    expect(toReportContent({})).toBeNull();
  });

  it("reads RevenueCat entitlements", () => {
    const now = Date.parse("2026-10-09T00:00:00Z");
    const sub = (expires: string | null) => ({ subscriber: { entitlements: { pro: { expires_date: expires } } } });
    expect(entitlementActive(sub("2026-11-01T00:00:00Z"), "pro", now)).toBe(true);
    expect(entitlementActive(sub("2026-09-01T00:00:00Z"), "pro", now)).toBe(false);
    expect(entitlementActive(sub(null), "pro", now)).toBe(true);
    expect(entitlementActive({ subscriber: { entitlements: {} } }, "pro", now)).toBe(false);
  });
});
