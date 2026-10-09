/**
 * Offline report formatter. It needs no network and costs nothing.
 *
 * It is used:
 *  - when no AI endpoint is configured,
 *  - when the device is offline,
 *  - when the AI service fails.
 *
 * Method:
 *  1. The technician can say section names ("findings", "parts", "recommendations" ...).
 *     Text after a section name goes into that section.
 *  2. Text without a section name is put into a section by keywords.
 *  3. Text that matches nothing goes into "work performed".
 */
import { tradeLabel } from "./i18n";
import type { Lang, Part, ReportContent, Trade } from "./types";

type Section = "work" | "findings" | "parts" | "recommendations";

/** Spoken section names, all languages together. Lowercase, without accents is not required. */
const HEADERS: Record<Section, string[]> = {
  work: [
    "work performed", "work done", "what i did",
    "yapılan işler", "yapılan iş", "yapılanlar", "yaptıklarım",
    "durchgeführte arbeiten", "arbeiten",
    "trabajos realizados", "trabajo realizado",
    "travaux effectués", "travaux réalisés",
    "lavori eseguiti", "lavori svolti",
    "serviços realizados", "serviço realizado",
    "uitgevoerde werkzaamheden", "werkzaamheden",
  ],
  findings: [
    "findings", "problem", "issue", "fault",
    "tespitler", "tespit", "arıza", "sorun", "problem",
    "befund", "befunde", "fehler", "störung",
    "hallazgos", "avería", "problema",
    "constats", "constat", "panne", "problème",
    "riscontri", "guasto", "problema",
    "constatações", "defeito", "problema",
    "bevindingen", "storing", "probleem",
  ],
  parts: [
    "parts used", "parts", "materials",
    "kullanılan parçalar", "parçalar", "malzemeler", "değişen parçalar",
    "verwendete teile", "teile", "material",
    "piezas utilizadas", "piezas", "materiales",
    "pièces utilisées", "pièces", "matériel",
    "ricambi utilizzati", "ricambi", "materiali",
    "peças utilizadas", "peças", "materiais",
    "gebruikte onderdelen", "onderdelen", "materialen",
  ],
  recommendations: [
    "recommendations", "recommendation", "next steps",
    "öneriler", "öneri", "tavsiyeler", "tavsiye",
    "empfehlungen", "empfehlung",
    "recomendaciones", "recomendación",
    "recommandations", "recommandation",
    "raccomandazioni", "raccomandazione", "consigli",
    "recomendações", "recomendação",
    "aanbevelingen", "aanbeveling", "advies",
  ],
};

/** Keywords that put a sentence without a header into a section. A keyword matches at the start of a word. */
const KEYWORDS: Record<Exclude<Section, "work">, string[]> = {
  findings: [
    "found", "broken", "leak", "worn", "damaged", "not working", "faulty", "error code", "noise", "dirty",
    "tripping", "tripped", "overheat", "burnt", "burned", "alarm", "not starting", "short circuit",
    "doesn't", "does not", "won't", "isn't", "not cooling", "not heating", "no power", "no heat", "low pressure",
    "tespit", "arızalı", "bozuk", "kaçak", "kaçağ", "sızıntı", "sızdır", "aşınmış", "hasarlı", "çalışmıyor", "hata kodu", "ses", "kirli",
    "atıyor", "attı", "aşırı ısın", "yanmış", "alarm veriyor", "kısa devre", "çalışmadı",
    "löst aus", "überhitzt", "verbrannt", "kurzschluss",
    "festgestellt", "defekt", "undicht", "verschlissen", "beschädigt", "funktioniert nicht", "fehlercode",
    "encontr", "roto", "fuga", "desgastad", "dañad", "no funciona", "código de error",
    "constaté", "cassé", "fuite", "usé", "endommagé", "ne fonctionne pas", "code erreur",
    "rilevato", "rotto", "perdita", "usurato", "danneggiato", "non funziona", "codice errore",
    "constatado", "quebrado", "vazamento", "desgastad", "danificad", "não funciona", "código de erro",
    "geconstateerd", "kapot", "lekkage", "versleten", "beschadigd", "werkt niet", "foutcode",
  ],
  parts: [
    "replaced with", "new part", "spare part",
    "yenisiyle değiştir", "yeni parça", "yedek parça",
    "ersatzteil", "neues teil",
    "repuesto", "pieza nueva",
    "pièce de rechange", "pièce neuve",
    "ricambio", "pezzo nuovo",
    "peça de reposição", "peça nova",
    "reserveonderdeel", "nieuw onderdeel",
  ],
  recommendations: [
    "recommend", "should", "suggest", "next visit", "next service", "advise",
    "öner", "tavsiye", "gerekir", "gerekiyor", "yapılmalı", "değiştirilmeli", "bir sonraki",
    "empfehle", "sollte", "nächste wartung", "nächsten",
    "recomiendo", "debería", "próxima",
    "recommande", "devrait", "prochaine",
    "consiglio", "dovrebbe", "prossima",
    "recomendo", "deveria", "próxima",
    "adviseer", "zou moeten", "volgende",
  ],
};

/** "I found ..." / "buldum": the sentence is a finding, also when it names a repair word. */
const DISCOVERY = [
  "found", "noticed", "detected", "discovered", "diagnosed",
  "buldum", "tespit", "gördüm", "fark ettim", "belirledim",
  "festgestellt", "gefunden", "bemerkt",
  "encontr", "detecté", "noté",
  "constaté", "trouvé", "remarqué",
  "rilevato", "trovato", "notato",
  "constat", "notei", "detectei",
  "geconstateerd", "gevonden", "opgemerkt",
];

/**
 * Repair actions. A sentence with one of these is "work performed",
 * also when it names the fault ("Kaçağı kaynakla kapattım" = "I welded the leak shut").
 */
const REPAIR_VERBS = [
  "fixed", "repaired", "cleaned", "sealed", "adjusted", "tightened", "refilled", "recharged", "welded", "reset",
  "tested", "connected", "flushed", "lubricated", "calibrated", "used",
  "kapattım", "kapatıldı", "onardım", "onarıldı", "tamir ettim", "tamir edildi", "temizledim", "temizlendi",
  "yaptım", "yapıldı", "ayarladım", "ayarlandı", "bağladım", "bağlandı", "sıktım", "doldurdum", "dolduruldu",
  "kullandım", "kullanıldı", "kaynak", "test ettim", "sıfırladım", "resetledim", "yağladım", "kalibre ettim",
  "giderdim", "giderildi", "düzelttim", "düzeltildi", "monte ettim", "vakumladım", "vakumlandı",
  "repariert", "gereinigt", "abgedichtet", "eingestellt", "nachgefüllt", "verwendet", "behoben", "geprüft",
  "reparé", "limpié", "sellé", "ajusté", "rellené", "utilicé", "arreglé", "comprobé",
  "réparé", "nettoyé", "rempli", "utilisé", "vérifié",
  "riparato", "pulito", "regolato", "riempito", "utilizzato", "usato", "controllato",
  "reparei", "limpei", "ajustei", "usei", "utilizei", "verifiquei", "consertei",
  "gerepareerd", "gereinigd", "afgesteld", "bijgevuld", "gebruikt", "gecontroleerd", "verholpen",
];

/** Negative verb forms that describe a fault: "soğutmuyor" (does not cool), "çalışmadı" (did not work). */
const NEGATIVE_FORMS = /\p{L}{2,}m[ıiuü]yor|\p{L}{2,}m[ae]d[ıi](?!\p{L})/u;

const FOLLOW_UP = [
  "follow-up", "follow up", "come back", "return visit", "next visit",
  "tekrar gel", "tekrar ziyaret", "yeniden gel", "parça gelince",
  "erneut", "folgetermin", "wiederkommen",
  "volver", "nueva visita", "seguimiento",
  "revenir", "nouvelle visite",
  "tornare", "nuova visita",
  "voltar", "nova visita", "retorno",
  "terugkomen", "vervolgbezoek",
];

/** Words that join steps in speech without punctuation. Used to split long sentences. */
const CONNECTORS = [
  "and then", "after that", "then",
  "daha sonra", "ardından", "sonra",
  "danach", "dann",
  "después", "luego",
  "ensuite", "puis",
  "dopodiché", "poi",
  "depois", "em seguida",
  "daarna", "toen",
];

/** Verbs that mean "I replaced / installed". Quantities near them are parts. */
const REPLACE_VERBS = [
  "replaced", "installed", "fitted", "changed",
  "değiştirdim", "değiştirildi", "taktım", "takıldı", "yeniledim", "yenilendi",
  "ersetzt", "getauscht", "eingebaut", "gewechselt",
  "reemplacé", "reemplazado", "cambié", "instalé",
  "remplacé", "changé", "installé",
  "sostituito", "cambiato", "installato",
  "substituí", "troquei", "instalei",
  "vervangen", "geplaatst", "geïnstalleerd",
  // "I used 2 kg R32" also names parts.
  "used", "kullandım", "kullanıldı", "verwendet", "utilicé", "utilisé", "utilizzato", "usei", "utilizei", "gebruikt",
];

/** Spoken numbers at the start of a part: "iki kilo gaz" → "2 kilo gaz". Only words that are not common in other uses. */
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
  eins: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, zehn: 10,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  deux: 2, trois: 3, quatre: 4, cinq: 5,
  due: 2, tre: 3, quattro: 4, cinque: 5,
  dois: 2, duas: 2, três: 3, quatro: 4,
  twee: 2, drie: 3,
};

const QTY_WORDS = "x|adet|kilo|kilos|kilogram|kilograms|kilogramm|gram|grams|gr|g|pcs|pc|pieces|piece|stück|stk|unidades|unidad|pièces|pièce|pezzi|pezzo|peças|peça|stuks|stuk|m|metre|metres|meter|meters|metro|metros|mètres|metri|lt|l|litre|liter|litros|kg";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lower(s: string): string {
  return s.toLocaleLowerCase();
}

function capitalize(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toLocaleUpperCase() + t.slice(1) : t;
}

function clean(s: string): string {
  return capitalize(s.replace(/\s+/g, " ").replace(/^[\s,;:.-]+|[\s,;:-]+$/g, ""));
}

/** Split text into sentences. Long sentences without punctuation are split at connector words. */
export function splitSentences(text: string): string[] {
  const parts = text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  const connectorRe = new RegExp(`\\s+(?:${CONNECTORS.map(escapeRe).join("|")})\\s+`, "iu");
  for (const p of parts) {
    if (p.length > 160) {
      out.push(...p.split(connectorRe).map((s) => s.trim()).filter(Boolean));
    } else {
      out.push(p);
    }
  }
  return out.map((s) => s.replace(/[.!?]+$/, "").trim()).filter((s) => s.length > 1);
}

/** Find a spoken section header at the start of a text. */
function matchHeader(sentence: string): { section: Section; rest: string } | null {
  const l = lower(sentence);
  let best: { section: Section; len: number } | null = null;
  for (const section of Object.keys(HEADERS) as Section[]) {
    for (const h of HEADERS[section]) {
      const re = new RegExp(`^${escapeRe(h)}(?:\\s*[:\\-–]|\\s|$)`, "iu");
      if (re.test(l) && (!best || h.length > best.len)) best = { section, len: h.length };
    }
  }
  if (!best) return null;
  const rest = sentence.slice(best.len).replace(/^\s*[:\-–]?\s*/, "");
  return { section: best.section, rest };
}

/** True if one of the words starts a word in the text. "attı" matches "sigorta attı", not "kapattım". */
function hasWord(text: string, words: string[]): boolean {
  return words.some((w) => {
    let i = text.indexOf(w);
    while (i >= 0) {
      if (i === 0 || !/[\p{L}\p{N}]/u.test(text.charAt(i - 1))) return true;
      i = text.indexOf(w, i + 1);
    }
    return false;
  });
}

function classify(sentence: string): Section {
  const l = lower(sentence);
  // "We must come back next week" is a recommendation for the customer.
  if (hasWord(l, FOLLOW_UP)) return "recommendations";
  if (hasWord(l, KEYWORDS.recommendations)) return "recommendations";
  if (hasWord(l, DISCOVERY)) return "findings";
  if (hasWord(l, KEYWORDS.parts)) return "parts";
  if (hasWord(l, REPAIR_VERBS) || hasWord(l, REPLACE_VERBS)) return "work";
  if (hasWord(l, KEYWORDS.findings) || NEGATIVE_FORMS.test(l)) return "findings";
  return "work";
}

/** Replace spoken numbers with digits: "iki kilo gaz" → "2 kilo gaz". */
function digitsForNumberWords(text: string): string {
  return text.replace(/\p{L}+/gu, (w) => {
    const n = NUMBER_WORDS[lower(w)];
    return n === undefined ? w : String(n);
  });
}

type ParsedPart = Part & { hasQty: boolean };

function parsePartsDetailed(text: string): ParsedPart[] {
  const items = text
    .split(/[,;]|\s+(?:and|ve|und|y|et|e|en)\s+/iu)
    .map((s) => s.trim())
    .filter(Boolean);
  const qtyFirst = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${QTY_WORDS})?\\.?\\s+(.+)$`, "iu");
  const qtyLast = new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${QTY_WORDS})?$`, "iu");
  return items
    .map((item): ParsedPart => {
      let m = item.match(qtyFirst);
      if (m) return { name: clean(m[3]), quantity: [m[1], m[2]].filter(Boolean).join(" "), hasQty: true };
      m = item.match(qtyLast);
      if (m) return { name: clean(m[1]), quantity: [m[2], m[3]].filter(Boolean).join(" "), hasQty: true };
      return { name: clean(item), quantity: "1", hasQty: false };
    })
    .filter((p) => p.name.length > 0);
}

/** Parse "2 filters, 1x compressor, valve" into parts. Items without a number get quantity "1". */
export function parseParts(text: string): Part[] {
  return parsePartsDetailed(text).map(({ name, quantity }) => ({ name, quantity }));
}

/**
 * "I replaced 2 terminal blocks and 3 m cable" → parts with a quantity.
 * Turkish word order is different ("2 adet filtre değiştirdim"), so the text before the verb is also checked.
 */
export function partsFromSentence(spoken: string): Part[] {
  const sentence = digitsForNumberWords(spoken);
  const l = lower(sentence);
  for (const verb of REPLACE_VERBS) {
    const i = l.indexOf(verb);
    if (i < 0 || (i > 0 && /[\p{L}\p{N}]/u.test(l.charAt(i - 1)))) continue;
    const after = sentence.slice(i + verb.length).replace(/^\s*(?:the|a|an|with)\s+/i, "");
    const before = sentence.slice(0, i);
    const candidate = /\d/.test(after) ? after : before;
    // Only items with a spoken quantity. "I replaced the pump" stays a work step only.
    return parsePartsDetailed(candidate)
      .filter((p) => p.hasQty && p.name.length > 1)
      .map(({ name, quantity }) => ({ name, quantity }));
  }
  return [];
}

export interface StructureInput {
  transcript: string;
  lang: Lang;
  trade: Trade;
  equipment?: string;
}

export function structureOffline(input: StructureInput): ReportContent {
  const buckets: Record<Section, string[]> = { work: [], findings: [], parts: [], recommendations: [] };
  let current: Section | null = null;

  for (const sentence of splitSentences(input.transcript)) {
    const header = matchHeader(sentence);
    if (header) {
      current = header.section;
      if (header.rest) buckets[current].push(header.rest);
      continue;
    }
    buckets[current ?? classify(sentence)].push(sentence);
  }

  const partsUsed = [
    ...buckets.parts.flatMap(parseParts),
    ...[...buckets.work, ...buckets.findings].flatMap(partsFromSentence),
  ];
  const workPerformed = buckets.work.map(clean).filter(Boolean);
  const findings = buckets.findings.map(clean).filter(Boolean);
  const recommendations = buckets.recommendations.map(clean).filter(Boolean);
  const all = lower(input.transcript);

  const label = tradeLabel(input.lang, input.trade);
  const equipment = (input.equipment ?? "").trim();
  return {
    title: equipment ? `${label} – ${equipment}` : label,
    // The offline formatter cannot write a real summary. An empty summary is better than a repeated line.
    summary: "",
    workPerformed,
    findings,
    partsUsed,
    recommendations,
    followUpRequired: hasWord(all, FOLLOW_UP),
  };
}

/** Convert a multi-line text field into list items. */
export function linesToList(text: string): string[] {
  return text.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
}

export function listToLines(items: string[]): string {
  return items.join("\n");
}
