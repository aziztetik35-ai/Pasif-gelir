import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

import { Button, colors, Notice, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { config } from "../src/lib/config";
import { buy, getPackages, purchasesEnabled, restore } from "../src/lib/purchases";
import { FREE_REPORT_LIMIT } from "../src/lib/types";

export default function Paywall() {
  const { t, refreshPro, freeLeft } = useApp();
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

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.scroll}>
      <Text style={ui.h1}>{t("pwTitle")}</Text>
      <Text style={ui.p}>{t("pwSubtitle")}</Text>
      {freeLeft === 0 ? <Notice text={t("pwLimit", { n: FREE_REPORT_LIMIT })} /> : null}

      <View style={{ gap: 8 }}>
        {(["pwFeat1", "pwFeat2", "pwFeat3", "pwFeat4"] as const).map((k) => (
          <Text key={k} style={styles.feature}>
            ✓ {t(k)}
          </Text>
        ))}
      </View>

      {!purchasesEnabled() ? <Notice text={t("pwNotConfigured")} /> : null}
      {packages === null ? <ActivityIndicator color={colors.primary} /> : null}
      {packages && packages.length === 0 && purchasesEnabled() ? <Notice text={t("pwNoOffers")} /> : null}

      {packages?.map((p) => {
        const isSel = p.identifier === selected;
        return (
          <Pressable
            key={p.identifier}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSel }}
            onPress={() => setSelected(p.identifier)}
            style={[styles.plan, isSel && styles.planSel]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>{label(p)}</Text>
              {p.packageType === "ANNUAL" ? <Text style={styles.badge}>{t("pwBestValue")}</Text> : null}
            </View>
            <Text style={styles.price}>{p.product.priceString}</Text>
          </Pressable>
        );
      })}

      {packages && packages.length > 0 ? <Button title={t("pwSubscribe")} onPress={subscribe} loading={busy} disabled={!selected} /> : null}
      {message ? <Notice text={message} /> : null}
      {purchasesEnabled() ? <Button title={t("restore")} variant="secondary" onPress={onRestore} disabled={busy} /> : null}

      <Text style={styles.terms}>{t("pwTerms")}</Text>
      <View style={[ui.row, { justifyContent: "center" }]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  feature: { fontSize: 16, color: colors.text },
  plan: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, backgroundColor: colors.card },
  planSel: { borderColor: colors.primary, borderWidth: 2, backgroundColor: "#E8EFFF" },
  planTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  badge: { color: colors.success, fontWeight: "700", marginTop: 2 },
  price: { fontSize: 17, fontWeight: "700", color: colors.text },
  terms: { fontSize: 12, color: colors.muted, textAlign: "center" },
  link: { color: colors.primary, fontSize: 13, textDecorationLine: "underline" },
});
