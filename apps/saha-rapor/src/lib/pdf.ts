import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { buildReportHtml, pdfFileName } from "./reportHtml";
import { toDataUri } from "./storage";
import type { Lang, Report, Settings } from "./types";

/** Create the PDF file for a report and return its URI. */
export async function createPdf(report: Report, settings: Settings, lang: Lang): Promise<string> {
  const logo = settings.logoUri ? await toDataUri(settings.logoUri) : null;
  const photos = (await Promise.all(report.photos.map(toDataUri))).filter((x): x is string => !!x);
  const html = buildReportHtml(report, settings, lang, { logo, photos });
  const { uri } = await Print.printToFileAsync({ html });

  // Give the file a readable name, so the customer sees "Report_SR-2026-0007.pdf".
  const named = new File(Paths.cache, pdfFileName(report));
  if (named.exists) named.delete();
  new File(uri).moveSync(named);
  return named.uri;
}

export async function sharePdf(uri: string, title: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: title });
}
