import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompanyForm, TradeList } from "../src/components/CompanyForm";
import { Button, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";

export default function Onboarding() {
  const { t, updateSettings } = useApp();
  const [step, setStep] = useState(0);

  async function finish() {
    await updateSettings({ onboarded: true });
    router.replace("/");
  }

  return (
    <SafeAreaView style={ui.screen}>
      <ScrollView contentContainerStyle={[ui.scroll, { paddingTop: 32 }]} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 56 }}>📝</Text>
            <Text style={ui.h1}>{t("obWelcomeTitle")}</Text>
            <Text style={ui.p}>{t("obWelcomeText")}</Text>
            <Button title={t("continue")} onPress={() => setStep(1)} />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 16 }}>
            <Text style={ui.h1}>{t("obTradeTitle")}</Text>
            <TradeList />
            <Button title={t("continue")} onPress={() => setStep(2)} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 16 }}>
            <Text style={ui.h1}>{t("obCompanyTitle")}</Text>
            <Text style={ui.p}>{t("obCompanyHint")}</Text>
            <CompanyForm />
            <Button title={t("obFinish")} onPress={finish} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
