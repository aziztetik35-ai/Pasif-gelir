import type { ReportContent } from "./types";

function str(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function strList(v: unknown, maxItems = 30): string[] {
  return Array.isArray(v) ? v.map((x) => str(x, 600)).filter(Boolean).slice(0, maxItems) : [];
}

/** Accept only the known report shape. Unknown data becomes empty values, never an exception. */
export function toReportContent(raw: unknown): ReportContent | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const parts = Array.isArray(o.partsUsed)
    ? o.partsUsed
        .map((p) => {
          const q = (p ?? {}) as Record<string, unknown>;
          return { name: str(q.name, 200), quantity: str(q.quantity, 40) || "1" };
        })
        .filter((p) => p.name)
        .slice(0, 50)
    : [];
  const content: ReportContent = {
    title: str(o.title, 160),
    summary: str(o.summary, 1000),
    workPerformed: strList(o.workPerformed),
    findings: strList(o.findings),
    partsUsed: parts,
    recommendations: strList(o.recommendations),
    followUpRequired: o.followUpRequired === true,
  };
  const empty =
    !content.title &&
    !content.summary &&
    !content.workPerformed.length &&
    !content.findings.length &&
    !content.recommendations.length &&
    !content.partsUsed.length;
  return empty ? null : content;
}
