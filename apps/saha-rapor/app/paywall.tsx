import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Crown, FileText, Globe, Mic, PenLine, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuroraBackground, PulseRing } from "../src/components/Hero";
import { Button, IconButton, Notice, ScalePress, Txt, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { config } from "../src/lib/config";
import { buy, getPackages, purchasesEnabled, restore } from "../src/lib/purchases";
import { FREE_REPORT_LIMIT } from "../src/lib/types";
import { colors, fonts, radius, shadow, space } from "../src/theme";

export default function Paywall() {
  const { t, refreshPro, freeLeft } = useApp();
  const insets = useSafeAreaInsets();
  // null = still loading. Without purchases there is nothing to load.
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(() => (purchasesEnabled() ? null : []));
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!purchasesEnabled()) return;
    getPackages()
      .then((list) => {
        setPackages(list);
        // Pre-select the yearly plan when it exists.
        const yearly = list.find((p) => p.packageType === "ANNUAL") ?? list[0];
        setSelected(yearly?.identifier ?? null);
      })
      .catch(() => setPackages([]));
  }, []);

  async function subscribe() {
    const pkg = packages?.find((p) => p.identifier === selected);
    if (!pkg) return;
    setBusy(true);
    setMessage("");
    const result = await buy(pkg);
    setBusy(false);
    if (result === "purchased") {
      await refreshPro();
      router.back();
    } else if (result === "failed") {
      setMessage(t("error"));
    }
  }

  async function onRestore() {
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    if (ok) {
      await refreshPro();
      router.back();
    } else {
      setMessage(t("nothingToRestore"));
    }
  }

  const label = (p: PurchasesPackage) => (p.packageType === "ANNUAL" ? t("pwYearly") : p.packageType === "MONTHLY" ? t("pwMonthly") : p.product.title);
  const features = [
    { icon: FileText, key: "pwFeat1" as const },
    { icon: Mic, key: "pwFeat2" as const },
    { icon: PenLine, key: "pwFeat3" as const },
    { icon: Globe, key: "pwFeat4" as const },
  ];

  return (
    <View style={ui.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <AuroraBackground style={[styles.hero, { paddingTop: insets.top + space.md }]}>
          <View style={{ alignSelf: "flex-end" }}>
            <IconButton icon={X} label={t("cancel")} onPress={() => router.back()} color="#FFFFFF" bg="rgba(255,255,255,0.14)" />
          </View>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.crownStage}>
            <PulseRing size={96} color="rgba(249,115,22,0.45)" />
            <View style={styles.crown}>
              <Crown size={40} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
            {t("pwTitle")}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(400).delay(80)} style={styles.subtitle}>
            {t("pwSubtitle")}
          </Animated.Text>
        </AuroraBackground>

        <View style={[ui.scroll, { paddingTop: space.xl }]}>
          {freeLeft === 0 ? <Notice text={t("pwLimit", { n: FREE_REPORT_LIMIT })} /> : null}

          <View style={{ gap: space.md }}>
            {features.map((f, i) => (
              <Animated.View key={f.key} entering={FadeInDown.duration(350).delay(120 + i * 60)} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <f.icon size={18} color={colors.primary} strokeWidth={2.4} />
                </View>
                <Txt variant="title" style={{ flex: 1 }}>
                  {t(f.key)}
                </Txt>
                <Check size={18} color={colors.success} strokeWidth={3} />
              </Animated.View>
            ))}
          </View>

          {!purchasesEnabled() ? <Notice text={t("pwNotConfigured")} tone="info" /> : null}
          {packages === null ? <ActivityIndicator color={colors.primary} /> : null}
          {packages && packages.length === 0 && purchasesEnabled() ? <Notice text={t("pwNoOffers")} /> : null}

          {packages?.map((p, i) => {
            const isSel = p.identifier === selected;
            const yearly = p.packageType === "ANNUAL";
            return (
              <Animated.View key={p.identifier} entering={FadeInDown.duration(350).delay(360 + i * 60)}>
                <ScalePress
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSel }}
                  accessibilityLabel={`${label(p)} ${p.product.priceString}`}
                  onPress={() => setSelected(p.identifier)}
                  style={[styles.plan, shadow, isSel && styles.planSel]}
                >
                  <View style={[styles.radio, isSel && styles.radioSel]}>{isSel ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}</View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.planTitle}>{label(p)}</Text>
                    {yearly ? <Text style={styles.best}>{t("pwBestValue")}</Text> : null}
                  </View>
                  <Text style={styles.price}>{p.product.priceString}</Text>
                </ScalePress>
              </Animated.View>
            );
          })}

          {packages && packages.length > 0 ? (
            <Button title={t("pwSubscribe")} icon={Crown} size="lg" variant="accent" shine onPress={subscribe} loading={busy} disabled={!selected} />
          ) : null}
          {message ? <Notice text={message} /> : null}
          {purchasesEnabled() ? <Button title={t("restore")} variant="secondary" onPress={onRestore} disabled={busy} /> : null}

          <Txt variant="caption" style={{ textAlign: "center" }}>
            {t("pwTerms")}
          </Txt>
          <View style={[ui.row, { justifyContent: "center", gap: space.lg }]}>
            {config.termsUrl ? (
              <Text style={styles.link} onPress={() => Linking.openURL(config.termsUrl)}>
                {t("terms")}
              </Text>
            ) : null}
            {config.privacyUrl ? (
              <Text style={styles.link} onPress={() => Linking.openURL(config.privacyUrl)}>
                {t("privacy")}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
    gap: space.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  crownStage: { alignSelf: "center", width: 140, height: 120, alignItems: "center", justifyContent: "center" },
  crown: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.extrabold, fontSize: 28, color: "#FFFFFF", textAlign: "center", letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.medium, fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  feature: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.lg,
    padding: 16,
    backgroundColor: colors.card,
  },
  planSel: { borderColor: colors.accent, backgroundColor: "#FFF8F3" },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioSel: { borderColor: colors.accent, backgroundColor: colors.accent },
  planTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  best: { fontFamily: fonts.bold, fontSize: 12, color: colors.success, letterSpacing: 0.3 },
  price: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.text },
  link: { color: colors.primary, fontSize: 13, fontFamily: fonts.semibold, textDecorationLine: "underline" },
});
