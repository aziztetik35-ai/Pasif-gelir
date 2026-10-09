/**
 * Calls the report AI service (Cloudflare Worker, see apps/saha-rapor-ai).
 * If the service is not configured, not reachable, or returns bad data,
 * the offline formatter is used. The user always gets a report.
 */
import { config } from "./config";
import { structureOffline, type StructureInput } from "./structure";
import type { ReportContent } from "./types";
import { toReportContent } from "./validate";

export interface StructureResult {
  content: ReportContent;
  source: "ai" | "basic";
}

const TIMEOUT_MS = 25_000;

export async function structureReport(input: StructureInput & { appUserId: string }): Promise<StructureResult> {
  const offline = (): StructureResult => ({ content: structureOffline(input), source: "basic" });
  if (!config.aiEndpoint) return offline();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${config.aiEndpoint.replace(/\/$/, "")}/v1/structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-app-key": config.appKey },
      body: JSON.stringify({
        transcript: input.transcript,
        language: input.lang,
        trade: input.trade,
        equipment: input.equipment ?? "",
        appUserId: input.appUserId,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return offline();
    const data = (await res.json()) as { report?: unknown };
    const content = toReportContent(data.report);
    return content ? { content, source: "ai" } : offline();
  } catch {
    return offline();
  } finally {
    clearTimeout(timer);
  }
}
