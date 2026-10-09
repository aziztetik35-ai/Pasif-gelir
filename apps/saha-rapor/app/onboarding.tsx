import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, FileText, Mic, PenLine, Rocket } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CompanyForm, TradeList } from "../src/components/CompanyForm";
import { AuroraBackground, PulseRing, StepDots } from "../src/components/Hero";
import { Button, Txt, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { colors, fonts, radius, space } from "../src/theme";

const STEPS = 3;

export default function Onboarding() {
  const { t, updateSettings } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  async function finish() {
    await updateSettings({ onboarded: true });
    router.replace("/");
  }

  const titles = [t("obWelcomeTitle"), t("obTradeTitle"), t("obCompanyTitle")];

  return (
    <View style={ui.screen}>
      <StatusBar style="light" />
      <AuroraBackground style={[styles.hero, { paddingTop: insets.top + space.lg }, step > 0 && styles.heroSmall]}>
        <StepDots step={step} total={STEPS} />
        {step === 0 ? (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.iconStage}>
            <PulseRing size={104} />
            <PulseRing size={140} color="rgba(255,255,255,0.12)" />
            <View style={styles.iconCore}>
              <Mic size={40} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </Animated.View>
        ) : null}
        <Animated.Text key={`title-${step}`} entering={FadeInDown.duration(400)} style={[styles.heroTitle, step > 0 && { fontSize: 26 }]}>
          {titles[step]}
        </Animated.Text>
        {step === 0 ? (
          <Animated.Text entering={FadeInDown.duration(400).delay(120)} style={styles.tagline}>
            {t("heroTagline")}
          </Animated.Text>
        ) : null}
      </AuroraBackground>

      <ScrollView contentContainerStyle={[ui.scroll, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <View style={{ gap: space.lg }}>
            <Txt variant="body">{t("obWelcomeText")}</Txt>
            {[
              { icon: Mic, text: t("pwFeat2") },
              { icon: PenLine, text: t("pwFeat3") },
              { icon: FileText, text: t("pwFeat4") },
            ].map((f, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(400).delay(200 + i * 80)} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <f.icon size={20} color={colors.primary} strokeWidth={2.3} />
                </View>
                <Txt variant="title" style={{ flex: 1 }}>
                  {f.text}
                </Txt>
              </Animated.View>
            ))}
            <Button title={t("continue")} icon={ArrowRight} size="lg" variant="accent" shine onPress={() => setStep(1)} />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: space.lg }}>
            <TradeList />
            <Button title={t("continue")} icon={ArrowRight} size="lg" onPress={() => setStep(2)} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: space.lg }}>
            <Txt variant="body">{t("obCompanyHint")}</Txt>
            <CompanyForm />
            <Button title={t("obFinish")} icon={Rocket} size="lg" variant="accent" shine onPress={finish} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
    gap: space.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    minHeight: 360,
    justifyContent: "flex-end",
  },
  heroSmall: { minHeight: 0 },
  iconStage: { alignSelf: "center", width: 160, height: 160, alignItems: "center", justifyContent: "center" },
  iconCore: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, color: "#FFFFFF", letterSpacing: -0.6 },
  tagline: { fontFamily: fonts.semibold, fontSize: 16, color: "rgba(255,255,255,0.78)" },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
});
