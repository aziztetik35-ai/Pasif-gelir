/**
 * Local storage. All data stays on the phone:
 *  - settings and reports: AsyncStorage (JSON)
 *  - photos and logo: files in the app document directory
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { DEFAULT_SETTINGS, type Report, type Settings } from "./types";

const SETTINGS_KEY = "settings.v1";
const REPORTS_KEY = "reports.v1";

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  let s: Settings = { ...DEFAULT_SETTINGS };
  if (raw) {
    try {
      s = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      // Damaged data: start with defaults.
    }
  }
  if (!s.deviceId) {
    s.deviceId = `dev_${newId()}${newId()}`;
    await saveSettings(s);
  }
  return s;
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export async function loadReports(): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Report[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveReports(list: Report[]): Promise<void> {
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Report number such as "SR-2026-0007". */
export function reportNumber(sequence: number, date = new Date()): string {
  return `SR-${date.getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

function dir(...names: string[]): Directory {
  const d = new Directory(Paths.document, ...names);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

/** Resize, compress and copy an image into the app folder. Returns the new file URI. */
export async function storeImage(sourceUri: string, folder: string[], maxWidth: number): Promise<string> {
  const ref = await ImageManipulator.manipulate(sourceUri).resize({ width: maxWidth }).renderAsync();
  const result = await ref.saveAsync({ compress: 0.6, format: SaveFormat.JPEG });
  const target = new File(dir(...folder), `${newId()}.jpg`);
  new File(result.uri).moveSync(target);
  return target.uri;
}

export function deleteFile(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // The file is already gone. Nothing to do.
  }
}

export async function toDataUri(uri: string): Promise<string | null> {
  try {
    const f = new File(uri);
    if (!f.exists) return null;
    return `data:image/jpeg;base64,${await f.base64()}`;
  } catch {
    return null;
  }
}
