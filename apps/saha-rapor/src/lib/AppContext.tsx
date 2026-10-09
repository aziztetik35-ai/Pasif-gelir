import { getLocales } from "expo-localization";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { resolveLang, translate, type StringKey } from "./i18n";
import { getAppUserId, initPurchases, isProActive, purchasesEnabled } from "./purchases";
import { deleteFile, loadReports, loadSettings, saveReports, saveSettings } from "./storage";
import { DEFAULT_SETTINGS, FREE_REPORT_LIMIT, type Lang, type Report, type Settings } from "./types";

interface AppState {
  ready: boolean;
  settings: Settings;
  reports: Report[];
  lang: Lang;
  isPro: boolean;
  /** Free reports left. Infinity for Pro or development builds without purchases. */
  freeLeft: number;
  canCreateReport: boolean;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  saveReport: (report: Report, isNew: boolean) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refreshPro: () => Promise<boolean>;
  appUserId: () => Promise<string>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // The latest settings, also between renders. Avoids lost updates when two changes come quickly.
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  const [reports, setReports] = useState<Report[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    (async () => {
      initPurchases();
      const [s, r, pro] = await Promise.all([loadSettings(), loadReports(), isProActive()]);
      settingsRef.current = s;
      setSettings(s);
      setReports(r);
      setIsPro(pro);
      setReady(true);
    })();
  }, []);

  const lang: Lang = settings.lang ?? resolveLang(getLocales()[0]?.languageCode);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    await saveSettings(next);
  }, []);

  const saveReport = useCallback(
    async (report: Report, isNew: boolean) => {
      const list = isNew ? [report, ...reports] : reports.map((r) => (r.id === report.id ? report : r));
      setReports(list);
      await saveReports(list);
      if (isNew) await updateSettings({ reportsCreated: settingsRef.current.reportsCreated + 1 });
    },
    [reports, updateSettings],
  );

  const deleteReport = useCallback(
    async (id: string) => {
      const target = reports.find((r) => r.id === id);
      target?.photos.forEach(deleteFile);
      const list = reports.filter((r) => r.id !== id);
      setReports(list);
      await saveReports(list);
    },
    [reports],
  );

  const refreshPro = useCallback(async () => {
    const pro = await isProActive();
    setIsPro(pro);
    return pro;
  }, []);

  const appUserId = useCallback(() => getAppUserId(settings.deviceId), [settings.deviceId]);

  // Development builds without RevenueCat keys have no limit, so the app can be tested.
  const unlimited = isPro || (!purchasesEnabled() && __DEV__);
  const freeLeft = unlimited ? Infinity : Math.max(0, FREE_REPORT_LIMIT - settings.reportsCreated);

  const value = useMemo<AppState>(
    () => ({
      ready,
      settings,
      reports,
      lang,
      isPro,
      freeLeft,
      canCreateReport: freeLeft > 0,
      t,
      updateSettings,
      saveReport,
      deleteReport,
      refreshPro,
      appUserId,
    }),
    [ready, settings, reports, lang, isPro, freeLeft, t, updateSettings, saveReport, deleteReport, refreshPro, appUserId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
