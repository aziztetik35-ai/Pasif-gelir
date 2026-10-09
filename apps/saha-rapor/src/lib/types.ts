export type Lang = "en" | "tr" | "de" | "es" | "fr" | "it" | "pt" | "nl";

export type Trade =
  | "hvac"
  | "electrical"
  | "elevator"
  | "appliance"
  | "machine"
  | "security"
  | "plumbing"
  | "general";

export const TRADES: Trade[] = [
  "hvac",
  "electrical",
  "elevator",
  "appliance",
  "machine",
  "security",
  "plumbing",
  "general",
];

export interface Part {
  name: string;
  quantity: string;
}

/** The structured content of a report. The AI service and the offline formatter both return this shape. */
export interface ReportContent {
  title: string;
  summary: string;
  workPerformed: string[];
  findings: string[];
  partsUsed: Part[];
  recommendations: string[];
  followUpRequired: boolean;
}

export interface Signature {
  /** SVG path data, one entry per stroke. */
  paths: string[];
  width: number;
  height: number;
}

export interface Report {
  id: string;
  number: string;
  createdAt: string; // ISO date
  customerName: string;
  customerAddress: string;
  customerContact: string;
  equipment: string;
  transcript: string;
  content: ReportContent;
  photos: string[]; // file URIs in the document directory
  signature: Signature | null;
  signerName: string;
  /** "ai" when the AI service wrote the content, "basic" for the offline formatter. */
  source: "ai" | "basic";
}

export interface Settings {
  onboarded: boolean;
  lang: Lang | null; // null = follow the device language
  trade: Trade;
  companyName: string;
  technicianName: string;
  phone: string;
  email: string;
  address: string;
  logoUri: string | null;
  reportsCreated: number;
  /** Random id, used when purchases are off. */
  deviceId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  lang: null,
  trade: "general",
  companyName: "",
  technicianName: "",
  phone: "",
  email: "",
  address: "",
  logoUri: null,
  reportsCreated: 0,
  deviceId: "",
};

export const FREE_REPORT_LIMIT = 3;
export const MAX_PHOTOS = 6;
