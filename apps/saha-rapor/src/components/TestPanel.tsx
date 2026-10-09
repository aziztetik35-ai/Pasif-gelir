/**
 * Tools for phone tests. Shown only in development and test builds (eas.json → preview / development).
 * The store build never shows this panel.
 */
import { router } from "expo-router";
import { FlaskConical, RotateCcw, Sparkles } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useApp } from "../lib/AppContext";
import { config } from "../lib/config";
import { purchasesEnabled } from "../lib/purchases";
import { colors, fonts } from "../theme";
import { Button, Card } from "./ui";

const TEXT = {
  en: {
    title: "Test tools",
    build: "Build",
    ai: "Report AI",
    aiOn: "online",
    aiOff: "offline (free formatter)",
    purchases: "Purchases",
    on: "on",
    off: "off — no report limit",
    created: "Reports created",
    resetCounter: "Reset free report counter",
    replayOnboarding: "Show first setup again",
  },
  tr: {
    title: "Test araçları",
    build: "Sürüm",
    ai: "Rapor AI",
    aiOn: "çevrimiçi",
    aiOff: "çevrimdışı (ücretsiz düzenleyici)",
    purchases: "Satın alma",
    on: "açık",
    off: "kapalı — rapor sınırı yok",
    created: "Oluşturulan rapor",
    resetCounter: "Ücretsiz rapor sayacını sıfırla",
    replayOnboarding: "İlk kurulumu tekrar göster",
  },
};

export function showTestPanel(): boolean {
  return __DEV__ || config.testMode;
}

export function TestPanel({ index }: { index?: number }) {
  const { lang, settings, updateSettings } = useApp();
  const t = lang === "tr" ? TEXT.tr : TEXT.en;

  const rows: [string, string][] = [
    [t.build, `${config.version} · ${__DEV__ ? "development" : "test"} · ${Platform.OS}`],
    [t.ai, config.aiEndpoint ? t.aiOn : t.aiOff],
    [t.purchases, purchasesEnabled() ? t.on : t.off],
    [t.created, String(settings.reportsCreated)],
  ];

  async function replayOnboarding() {
    await updateSettings({ onboarded: false });
    router.replace("/onboarding");
  }

  return (
    <Card title={t.title} icon={FlaskConical} index={index}>
      <View style={styles.rows}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.key}>{k}</Text>
            <Text style={styles.value}>{v}</Text>
          </View>
        ))}
      </View>
      <Button title={t.resetCounter} icon={RotateCcw} variant="secondary" onPress={() => updateSettings({ reportsCreated: 0 })} />
      <Button title={t.replayOnboarding} icon={Sparkles} variant="secondary" onPress={replayOnboarding} />
    </Card>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  key: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  value: { flexShrink: 1, textAlign: "right", fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
});
