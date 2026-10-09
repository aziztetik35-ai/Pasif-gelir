/** Pure helpers for the report AI service: request checks, prompt, JSON schema, result checks. */

export const LANGS = ["en", "tr", "de", "es", "fr", "it", "pt", "nl"] as const;
export const TRADES = ["hvac", "electrical", "elevator", "appliance", "machine", "security", "plumbing", "general"] as const;

export type Lang = (typeof LANGS)[number];
export type Trade = (typeof TRADES)[number];

const LANGUAGE_NAMES: Record<Lang, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
};

const TRADE_NAMES: Record<Trade, string> = {
  hvac: "HVAC / air conditioning",
  electrical: "electrical installation",
  elevator: "elevator maintenance",
  appliance: "home appliance repair",
  machine: "industrial machine maintenance",
  security: "security systems",
  plumbing: "plumbing",
  general: "general service",
};

export const MAX_TRANSCRIPT = 8000;

export interface StructureRequest {
  transcript: string;
  language: Lang;
  trade: Trade;
  equipment: string;
  appUserId: string;
}

export interface Part {
  name: string;
  quantity: string;
}

export interface ReportContent {
  title: string;
  summary: string;
  workPerformed: string[];
  findings: string[];
  partsUsed: Part[];
  recommendations: string[];
  followUpRequired: boolean;
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseRequest(body: unknown): Parsed<StructureRequest> {
  if (!body || typeof body !== "object") return { ok: false, error: "body must be a JSON object" };
  const b = body as Record<string, unknown>;
  const transcript = typeof b.transcript === "string" ? b.transcript.trim() : "";
  if (!transcript) return { ok: false, error: "transcript is required" };
  if (transcript.length > MAX_TRANSCRIPT) return { ok: false, error: `transcript is longer than ${MAX_TRANSCRIPT} characters` };
  const language = (LANGS as readonly string[]).includes(b.language as string) ? (b.language as Lang) : null;
  if (!language) return { ok: false, error: "language is not supported" };
  const trade = (TRADES as readonly string[]).includes(b.trade as string) ? (b.trade as Trade) : "general";
  const equipment = typeof b.equipment === "string" ? b.equipment.trim().slice(0, 200) : "";
  const appUserId = typeof b.appUserId === "string" ? b.appUserId.trim() : "";
  if (!/^[A-Za-z0-9_$:.\-]{6,128}$/.test(appUserId)) return { ok: false, error: "appUserId is not valid" };
  return { ok: true, value: { transcript, language, trade, equipment, appUserId } };
}

/** JSON schema for structured outputs. All fields are required, no extra fields. */
export const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "workPerformed", "findings", "partsUsed", "recommendations", "followUpRequired"],
  properties: {
    title: { type: "string", description: "Short report title, max 80 characters." },
    summary: { type: "string", description: "One or two sentences for the customer." },
    workPerformed: { type: "array", items: { type: "string" }, description: "Work steps the technician did." },
    findings: { type: "array", items: { type: "string" }, description: "Faults, damage and measured values found." },
    partsUsed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "quantity"],
        properties: {
          name: { type: "string" },
          quantity: { type: "string", description: "Quantity with unit, e.g. \"2\" or \"1.5 m\". Use \"1\" if not said." },
        },
      },
    },
    recommendations: { type: "array", items: { type: "string" }, description: "Advice for the customer and next steps." },
    followUpRequired: { type: "boolean", description: "True only if the technician said another visit is needed." },
  },
} as const;

/** Stable system prompt (the same for every request, so it can be cached). */
export const SYSTEM_PROMPT = `You turn a field technician's dictated notes into a clear, professional service report for the customer.

Rules:
- Use only facts from the notes. Do not invent measurements, part numbers, prices, dates or work that was not mentioned.
- Correct speech-recognition mistakes only when the meaning is obvious from the context.
- Write short, plain sentences in a professional tone. Use the technician's first-person actions as neutral statements (for example "The filter was replaced.").
- Put each fact in exactly one list: findings (what was wrong or measured), workPerformed (what was done), partsUsed (parts and materials with quantity), recommendations (advice and next steps).
- Leave a list empty when the notes say nothing about it.
- Write every text value in the requested report language, even if the notes are in another language.`;

export function buildUserMessage(req: StructureRequest): string {
  const lines = [
    `Report language: ${LANGUAGE_NAMES[req.language]}`,
    `Trade: ${TRADE_NAMES[req.trade]}`,
  ];
  if (req.equipment) lines.push(`Equipment: ${req.equipment}`);
  lines.push("", "Technician's notes:", "<notes>", req.transcript, "</notes>");
  return lines.join("\n");
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => str(x, 600)).filter(Boolean).slice(0, 30) : [];
}

/** Check the model output. Returns null when it is not a usable report. */
export function toReportContent(raw: unknown): ReportContent | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const partsUsed = Array.isArray(o.partsUsed)
    ? o.partsUsed
        .map((p) => {
          const q = (p ?? {}) as Record<string, unknown>;
          return { name: str(q.name, 200), quantity: str(q.quantity, 40) || "1" };
        })
        .filter((p) => p.name)
        .slice(0, 50)
    : [];
  const c: ReportContent = {
    title: str(o.title, 160),
    summary: str(o.summary, 1000),
    workPerformed: strList(o.workPerformed),
    findings: strList(o.findings),
    partsUsed,
    recommendations: strList(o.recommendations),
    followUpRequired: o.followUpRequired === true,
  };
  const empty = !c.title && !c.summary && !c.workPerformed.length && !c.findings.length && !c.recommendations.length && !partsUsed.length;
  return empty ? null : c;
}

/** RevenueCat v1 subscriber response → is the entitlement active now? */
export function entitlementActive(data: unknown, entitlementId: string, now = Date.now()): boolean {
  const ent = (data as { subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> } })?.subscriber
    ?.entitlements?.[entitlementId];
  if (!ent) return false;
  if (ent.expires_date === null || ent.expires_date === undefined) return true; // lifetime purchase
  const t = Date.parse(ent.expires_date);
  return Number.isFinite(t) && t > now;
}

export function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(d = new Date()): string {
  return `${monthKey(d)}${String(d.getUTCDate()).padStart(2, "0")}`;
}
