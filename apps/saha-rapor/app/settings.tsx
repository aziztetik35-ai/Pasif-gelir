import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";

import { CompanyForm, TradeList } from "../src/components/CompanyForm";
import { Button, Card, Choice, colors, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { config } from "../src/lib/config";
import { LANG_NAMES, LANGS } from "../src/lib/i18n";
import { purchasesEnabled, restore } from "../src/lib/purchases";

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
      <Card title={t("subscription")}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: isPro ? colors.success : colors.text }}>
          {isPro ? t("proActive") : t("freePlan")}
        </Text>
        {!isPro ? <Button title={t("upgrade")} onPress={() => router.push("/paywall")} /> : null}
        {purchasesEnabled() ? <Button title={t("restore")} variant="secondary" onPress={onRestore} loading={restoring} /> : null}
      </Card>

      <Card title={t("company")}>
        <CompanyForm />
      </Card>

      <Card title={t("trade")}>
        <TradeList />
      </Card>

      <Card title={t("language")}>
        <View style={{ gap: 8 }}>
          <Choice label={t("deviceLanguage")} selected={settings.lang === null} onPress={() => updateSettings({ lang: null })} />
          {LANGS.map((l) => (
            <Choice key={l} label={LANG_NAMES[l]} selected={settings.lang === l} onPress={() => updateSettings({ lang: l })} />
          ))}
        </View>
      </Card>

      {config.privacyUrl ? <Button title={t("privacy")} variant="secondary" onPress={() => Linking.openURL(config.privacyUrl)} /> : null}
      {config.termsUrl ? <Button title={t("terms")} variant="secondary" onPress={() => Linking.openURL(config.termsUrl)} /> : null}
      <Text style={[ui.p, { textAlign: "center" }]}>
        {t("version")} {config.version}
      </Text>
    </ScrollView>
  );
}
