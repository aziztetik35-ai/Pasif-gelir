/** Builds the HTML that expo-print turns into the PDF report. Pure function: easy to test. */
import { translate, SPEECH_LOCALE } from "./i18n";
import type { Lang, Report, Settings, Signature } from "./types";

export interface HtmlImages {
  /** data URI of the company logo, or null */
  logo: string | null;
  /** data URIs of the photos, same order as report.photos */
  photos: string[];
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDate(iso: string, lang: Lang): string {
  try {
    return new Date(iso).toLocaleDateString(SPEECH_LOCALE[lang], { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function list(items: string[]): string {
  if (!items.length) return "";
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function section(title: string, body: string): string {
  if (!body) return "";
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

/** SVG path data only contains commands and numbers. Anything else is removed. */
function safePath(d: string): string {
  return d.replace(/[^MLQCZmlqcz0-9.,\s-]/g, "");
}

export function signatureSvg(sig: Signature): string {
  const paths = sig.paths
    .map((d) => `<path d="${safePath(d)}" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sig.width} ${sig.height}" width="240" height="${Math.round((240 * sig.height) / Math.max(sig.width, 1))}">${paths}</svg>`;
}

export function buildReportHtml(report: Report, settings: Settings, lang: Lang, images: HtmlImages): string {
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  const c = report.content;

  const companyLines = [settings.address, settings.phone, settings.email].filter(Boolean).map(escapeHtml).join("<br>");
  const logo = images.logo ? `<img class="logo" src="${images.logo}" alt="">` : "";

  const meta = [
    [t("reportNo"), report.number],
    [t("date"), formatDate(report.createdAt, lang)],
    [t("technician"), settings.technicianName],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  const customer = [
    [t("customer"), report.customerName],
    [t("customerAddress"), report.customerAddress],
    [t("customerContact"), report.customerContact],
    [t("equipment"), report.equipment],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  const parts = c.partsUsed.length
    ? `<table class="parts"><thead><tr><th>${escapeHtml(t("partName"))}</th><th class="qty">${escapeHtml(t("quantity"))}</th></tr></thead><tbody>${c.partsUsed
        .map((p) => `<tr><td>${escapeHtml(p.name)}</td><td class="qty">${escapeHtml(p.quantity)}</td></tr>`)
        .join("")}</tbody></table>`
    : "";

  const photos = images.photos.length
    ? `<div class="photos">${images.photos.map((src) => `<img src="${src}" alt="">`).join("")}</div>`
    : "";

  const followUp = c.followUpRequired ? `<p class="followup">⚠ ${escapeHtml(t("followUp"))}</p>` : "";

  const signature = report.signature && report.signature.paths.length
    ? `<div class="sig"><div class="sigbox">${signatureSvg(report.signature)}</div><div class="signame">${escapeHtml(report.signerName || report.customerName)}</div></div>`
    : "";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page { margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Roboto, Arial, sans-serif; color: #1b2433; font-size: 11pt; line-height: 1.45; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1f5eff; padding-bottom: 10px; margin-bottom: 14px; }
  .company { font-size: 9.5pt; color: #4a5568; }
  .company strong { display: block; font-size: 14pt; color: #1b2433; }
  .logo { max-height: 60px; max-width: 180px; object-fit: contain; }
  h1 { font-size: 17pt; margin: 4px 0 10px; }
  h2 { font-size: 11.5pt; color: #1f5eff; text-transform: uppercase; letter-spacing: .4px; margin: 16px 0 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
  table { border-collapse: collapse; width: 100%; }
  .meta th, .meta td { text-align: left; padding: 3px 8px 3px 0; vertical-align: top; font-size: 10pt; }
  .meta th { color: #4a5568; font-weight: 600; width: 34%; }
  .grid { display: flex; gap: 18px; }
  .grid > div { flex: 1; }
  .summary { background: #f4f6fa; border-left: 4px solid #1f5eff; padding: 8px 10px; margin: 10px 0; }
  ul { margin: 4px 0 0 18px; padding: 0; }
  li { margin: 2px 0; }
  .parts th, .parts td { border: 1px solid #d9dee7; padding: 5px 8px; text-align: left; font-size: 10pt; }
  .parts thead th { background: #f4f6fa; }
  .parts .qty { width: 80px; text-align: center; }
  .followup { color: #b45309; font-weight: 600; margin-top: 10px; }
  .photos { display: flex; flex-wrap: wrap; gap: 8px; }
  .photos img { width: calc(50% - 4px); height: 190px; object-fit: cover; border-radius: 4px; border: 1px solid #d9dee7; page-break-inside: avoid; }
  .sig { margin-top: 6px; page-break-inside: avoid; }
  .sigbox { border-bottom: 1px solid #1b2433; display: inline-block; min-width: 240px; padding-bottom: 2px; }
  .signame { font-size: 10pt; color: #4a5568; margin-top: 3px; }
  footer { margin-top: 24px; font-size: 8pt; color: #a0aec0; text-align: center; }
</style>
</head>
<body>
<header>
  <div class="company"><strong>${escapeHtml(settings.companyName || t("appName"))}</strong>${companyLines}</div>
  ${logo}
</header>
<h1>${escapeHtml(c.title)}</h1>
<div class="grid">
  <div><table class="meta">${meta}</table></div>
  <div><table class="meta">${customer}</table></div>
</div>
${c.summary ? `<div class="summary">${escapeHtml(c.summary)}</div>` : ""}
${section(t("findings"), list(c.findings))}
${section(t("workPerformed"), list(c.workPerformed))}
${section(t("partsUsed"), parts)}
${section(t("recommendations"), list(c.recommendations))}
${followUp}
${section(t("photos"), photos)}
${section(t("signature"), signature)}
<footer>${escapeHtml(t("createdWith"))}</footer>
</body>
</html>`;
}

/** Safe file name for the PDF, e.g. "Report_SR-2026-0007.pdf". */
export function pdfFileName(report: Report): string {
  return `Report_${report.number.replace(/[^A-Za-z0-9-]/g, "_")}.pdf`;
}
