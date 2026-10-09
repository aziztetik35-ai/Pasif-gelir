import { router } from "expo-router";
import { Briefcase, Building, Crown, FileText, Globe, RotateCcw, ShieldCheck, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { CompanyForm, TradeList } from "../src/components/CompanyForm";
import { showTestPanel, TestPanel } from "../src/components/TestPanel";
import { Badge, Button, Card, Choice, Txt, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { config } from "../src/lib/config";
import { LANG_NAMES, LANGS } from "../src/lib/i18n";
import { purchasesEnabled, restore } from "../src/lib/purchases";
import { colors, fonts, radius } from "../src/theme";

export default function SettingsScreen() {
  const { t, settings, updateSettings, isPro, refreshPro } = useApp();
  const [restoring, setRestoring] = useState(false);

  async function onRestore() {
    setRestoring(true);
    try {
      const ok = await restore();
      await refreshPro();
      Alert.alert(ok ? t("restored") : t("nothingToRestore"));
    } finally {
      setRestoring(false);
    }
  }

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.scroll} keyboardShouldPersistTaps="handled">
      <Card title={t("subscription")} icon={Crown} index={0}>
        <View style={styles.planRow}>
          <View style={[styles.planIcon, { backgroundColor: isPro ? colors.successSoft : colors.accentSoft }]}>
            {isPro ? <ShieldCheck size={22} color={colors.success} strokeWidth={2.4} /> : <Sparkles size={22} color={colors.accent} strokeWidth={2.4} />}
          </View>
          <Text style={styles.planText}>{isPro ? t("proActive") : t("freePlan")}</Text>
          {isPro ? <Badge text="PRO" tone="success" /> : null}
        </View>
        {!isPro ? <Button title={t("upgrade")} icon={Crown} variant="accent" shine onPress={() => router.push("/paywall")} /> : null}
        {purchasesEnabled() ? <Button title={t("restore")} icon={RotateCcw} variant="secondary" onPress={onRestore} loading={restoring} /> : null}
      </Card>

      <Card title={t("company")} icon={Building} index={1}>
        <CompanyForm />
      </Card>

      <Card title={t("trade")} icon={Briefcase} index={2}>
        <TradeList />
      </Card>

      <Card title={t("language")} icon={Globe} index={3}>
        <View style={styles.langGrid}>
          <View style={styles.langCell}>
            <Choice compact label={t("deviceLanguage")} selected={settings.lang === null} onPress={() => updateSettings({ lang: null })} />
          </View>
          {LANGS.map((l) => (
            <View key={l} style={styles.langCell}>
              <Choice compact label={LANG_NAMES[l]} selected={settings.lang === l} onPress={() => updateSettings({ lang: l })} />
            </View>
          ))}
        </View>
      </Card>

      {showTestPanel() ? <TestPanel index={4} /> : null}

      {config.privacyUrl ? <Button title={t("privacy")} icon={ShieldCheck} variant="secondary" onPress={() => Linking.openURL(config.privacyUrl)} /> : null}
      {config.termsUrl ? <Button title={t("terms")} icon={FileText} variant="secondary" onPress={() => Linking.openURL(config.termsUrl)} /> : null}
      <Txt variant="caption" style={{ textAlign: "center" }}>
        {t("version")} {config.version}
      </Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  planText: { flex: 1, fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langCell: { width: "48%", flexGrow: 1 },
});
