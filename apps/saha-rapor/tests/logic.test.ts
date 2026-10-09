import { describe, expect, it } from "vitest";

import { LANGS, STRINGS, translate, resolveLang } from "../src/lib/i18n";
import { buildReportHtml, escapeHtml, pdfFileName } from "../src/lib/reportHtml";
import { linesToList, parseParts, splitSentences, structureOffline } from "../src/lib/structure";
import { DEFAULT_SETTINGS, type Report } from "../src/lib/types";
import { toReportContent } from "../src/lib/validate";

describe("i18n", () => {
  it("every language has every key with the same placeholders", () => {
    const keys = Object.keys(STRINGS.en);
    for (const lang of LANGS) {
      expect(Object.keys(STRINGS[lang]).sort()).toEqual([...keys].sort());
      for (const k of keys) {
        const en = (STRINGS.en as Record<string, string>)[k].match(/\{\w+\}/g) ?? [];
        const other = (STRINGS[lang] as Record<string, string>)[k].match(/\{\w+\}/g) ?? [];
        expect({ lang, k, vars: other }).toEqual({ lang, k, vars: en });
        expect((STRINGS[lang] as Record<string, string>)[k].length).toBeGreaterThan(0);
      }
    }
  });

  it("fills variables and resolves languages", () => {
    expect(translate("tr", "freeLeft", { n: 2 })).toBe("Kalan ücretsiz rapor: 2");
    expect(resolveLang("pt")).toBe("pt");
    expect(resolveLang("ja")).toBe("en");
    expect(resolveLang(null)).toBe("en");
  });
});

describe("offline formatter", () => {
  it("uses spoken section headers (Turkish)", () => {
    const c = structureOffline({
      lang: "tr",
      trade: "hvac",
      equipment: "Daikin FTXM35",
      transcript:
        "Tespitler: dış ünitede gaz kaçağı var. Yapılan işler: kaçak noktası kaynak yapıldı. Sistem vakumlandı ve gaz dolumu yapıldı. Parçalar: 1 adet filtre drier, 2 kg R32 gaz. Öneriler: 6 ay sonra kontrol edilmeli.",
    });
    expect(c.title).toBe("Klima / HVAC – Daikin FTXM35");
    expect(c.findings).toEqual(["Dış ünitede gaz kaçağı var"]);
    expect(c.workPerformed).toEqual(["Kaçak noktası kaynak yapıldı", "Sistem vakumlandı ve gaz dolumu yapıldı"]);
    expect(c.partsUsed).toEqual([
      { name: "Filtre drier", quantity: "1 adet" },
      { name: "R32 gaz", quantity: "2 kg" },
    ]);
    expect(c.recommendations).toEqual(["6 ay sonra kontrol edilmeli"]);
    expect(c.summary).toBe("");
  });

  it("classifies sentences by keywords without headers (English)", () => {
    const c = structureOffline({
      lang: "en",
      trade: "appliance",
      transcript:
        "The drain pump was broken. I replaced the pump and tested a full cycle. I recommend cleaning the filter every month. We need to come back next week.",
    });
    expect(c.findings).toEqual(["The drain pump was broken"]);
    expect(c.workPerformed).toEqual(["I replaced the pump and tested a full cycle"]);
    expect(c.recommendations).toEqual(["I recommend cleaning the filter every month", "We need to come back next week"]);
    expect(c.followUpRequired).toBe(true);
    expect(c.title).toBe("Appliance repair");
  });

  it("finds faults and parts in plain sentences (English and Turkish)", () => {
    const en = structureOffline({
      lang: "en",
      trade: "electrical",
      transcript:
        "The main breaker in panel B was tripping. I found a loose neutral terminal. I replaced 2 terminal blocks and 3 m cable. I replaced the cover.",
    });
    expect(en.findings).toEqual(["The main breaker in panel B was tripping", "I found a loose neutral terminal"]);
    expect(en.workPerformed).toEqual(["I replaced 2 terminal blocks and 3 m cable", "I replaced the cover"]);
    expect(en.partsUsed).toEqual([
      { name: "Terminal blocks", quantity: "2" },
      { name: "Cable", quantity: "3 m" },
    ]);

    const tr = structureOffline({ lang: "tr", trade: "electrical", transcript: "Kaçak akım rölesi atıyor. 2 adet sigorta değiştirdim." });
    expect(tr.findings).toEqual(["Kaçak akım rölesi atıyor"]);
    expect(tr.partsUsed).toEqual([{ name: "Sigorta", quantity: "2 adet" }]);
  });

  it("splits long sentences without punctuation at connector words", () => {
    const long =
      "ich habe das Gerät geöffnet und die Platine geprüft dann habe ich den Kondensator getauscht und das Gerät wieder zusammengebaut danach lief alles einwandfrei und der Kunde war zufrieden mit der Arbeit heute";
    expect(splitSentences(long).length).toBe(3);
  });

  it("parses parts in both orders", () => {
    expect(parseParts("2 filters, compressor 1, valve")).toEqual([
      { name: "Filters", quantity: "2" },
      { name: "Compressor", quantity: "1" },
      { name: "Valve", quantity: "1" },
    ]);
  });

  it("returns empty lists for empty input", () => {
    const c = structureOffline({ lang: "en", trade: "general", transcript: "   " });
    expect(c.workPerformed).toEqual([]);
    expect(c.followUpRequired).toBe(false);
  });

  it("converts text lines to list items", () => {
    expect(linesToList("- a\n\n• b\n c ")).toEqual(["a", "b", "c"]);
  });
});

describe("AI response validation", () => {
  it("accepts a good report and trims bad fields", () => {
    const c = toReportContent({
      title: " Repair ",
      summary: "ok",
      workPerformed: ["a", 3, ""],
      findings: "not a list",
      partsUsed: [{ name: "Filter", quantity: "" }, { quantity: "2" }],
      recommendations: [],
      followUpRequired: "yes",
    });
    expect(c).toEqual({
      title: "Repair",
      summary: "ok",
      workPerformed: ["a"],
      findings: [],
      partsUsed: [{ name: "Filter", quantity: "1" }],
      recommendations: [],
      followUpRequired: false,
    });
  });

  it("rejects empty or wrong data", () => {
    expect(toReportContent(null)).toBeNull();
    expect(toReportContent("text")).toBeNull();
    expect(toReportContent({ foo: 1 })).toBeNull();
  });
});

describe("PDF html", () => {
  const report: Report = {
    id: "x1",
    number: "SR-2026-0007",
    createdAt: "2026-10-09T10:00:00.000Z",
    customerName: "ACME <script>alert(1)</script>",
    customerAddress: "Main St 1",
    customerContact: "",
    equipment: "Pump P-101",
    transcript: "",
    content: {
      title: "Pump repair",
      summary: "Seal leak fixed",
      workPerformed: ["Replaced seal"],
      findings: ["Seal leak"],
      partsUsed: [{ name: "Seal kit", quantity: "1" }],
      recommendations: ["Check in 6 months"],
      followUpRequired: true,
    },
    photos: [],
    signature: { paths: ["M1 1 L10 10", "M5 5 L6 6\"><script>"], width: 300, height: 180 },
    signerName: "",
    source: "ai",
  };

  it("escapes user text and contains all sections", () => {
    const html = buildReportHtml(report, { ...DEFAULT_SETTINGS, companyName: "Tetik Servis" }, "en", { logo: null, photos: [] });
    expect(html).not.toContain("<script>");
    expect(html).toContain("ACME &lt;script&gt;");
    for (const s of ["Tetik Servis", "Pump repair", "Seal leak", "Replaced seal", "Seal kit", "Check in 6 months", "SR-2026-0007", "Follow-up visit required"]) {
      expect(html).toContain(s);
    }
    expect(html).toContain('viewBox="0 0 300 180"');
  });

  it("makes a safe file name", () => {
    expect(pdfFileName(report)).toBe("Report_SR-2026-0007.pdf");
    expect(escapeHtml(`"'&`)).toBe("&quot;&#39;&amp;");
  });
});
