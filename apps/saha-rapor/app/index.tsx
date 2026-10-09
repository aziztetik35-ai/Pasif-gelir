import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CalendarClock, ChevronRight, ClipboardList, FileText, Plus, Settings, Sparkles, TriangleAlert } from "lucide-react-native";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuroraBackground, CountUp, TRADE_ICONS } from "../src/components/Hero";
import { Badge, Button, IconButton, ScalePress, Txt, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { formatDate } from "../src/lib/reportHtml";
import { colors, fonts, radius, shadow, space, staggerDelay } from "../src/theme";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toLocaleUpperCase() || "•";
}

export default function Home() {
  const { settings, reports, t, lang, canCreateReport, freeLeft, isPro } = useApp();
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => {
    const now = new Date();
    const month = reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const followUps = reports.filter((r) => r.content.followUpRequired).length;
    return { total: reports.length, month, followUps };
  }, [reports]);

  if (!settings.onboarded) return <Redirect href="/onboarding" />;

  function newReport() {
    router.push(canCreateReport ? "/report/new" : "/paywall");
  }

  const firstName = settings.technicianName.trim().split(/\s+/)[0];
  const TradeIcon = TRADE_ICONS[settings.trade];

  const header = (
    <View style={{ gap: space.lg }}>
      <AuroraBackground style={[styles.hero, { paddingTop: insets.top + space.md }]}>
        <View style={styles.heroTop}>
          <View style={styles.tradeChip}>
            <TradeIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.tradeChipText} numberOfLines={1}>
              {settings.companyName || t("appName")}
            </Text>
          </View>
          <IconButton icon={Settings} label={t("settings")} onPress={() => router.push("/settings")} color="#FFFFFF" bg="rgba(255,255,255,0.14)" />
        </View>
        <Animated.Text entering={FadeInDown.duration(450)} style={styles.hello}>
          {t("hello")}
          {firstName ? `, ${firstName}` : ""} 👋
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(450).delay(80)} style={styles.tagline}>
          {t("heroTagline")}
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(450).delay(160)}>
          <Button title={t("newReport")} icon={Plus} size="lg" variant="accent" shine onPress={newReport} />
        </Animated.View>
      </AuroraBackground>

      {/* Bento stats */}
      <View style={styles.bento}>
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={[styles.tile, styles.tileWide, shadow]}>
          <View style={[styles.tileIcon, { backgroundColor: colors.primarySoft }]}>
            <ClipboardList size={18} color={colors.primary} strokeWidth={2.4} />
          </View>
          <CountUp value={stats.total} style={styles.tileNumber} />
          <Txt variant="caption">{t("statTotal")}</Txt>
        </Animated.View>
        <View style={{ flex: 1, gap: space.md }}>
          <Animated.View entering={FadeInDown.duration(400).delay(260)} style={[styles.tile, styles.tileSmall, shadow]}>
            <View style={styles.tileRow}>
              <CalendarClock size={18} color={colors.success} strokeWidth={2.4} />
              <CountUp value={stats.month} style={styles.tileNumberSm} />
            </View>
            <Txt variant="caption" numberOfLines={2}>
              {t("statMonth")}
            </Txt>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(320)} style={[styles.tile, styles.tileSmall, shadow]}>
            <View style={styles.tileRow}>
              <TriangleAlert size={18} color={colors.warn} strokeWidth={2.4} />
              <CountUp value={stats.followUps} style={styles.tileNumberSm} />
            </View>
            <Txt variant="caption" numberOfLines={2}>
              {t("statFollowUp")}
            </Txt>
          </Animated.View>
        </View>
      </View>

      {!isPro && Number.isFinite(freeLeft) ? (
        <ScalePress onPress={() => router.push("/paywall")} accessibilityLabel={t("upgrade")} style={styles.proBanner}>
          <Sparkles size={18} color={colors.accent} strokeWidth={2.4} />
          <Text style={styles.proText}>{t("freeLeft", { n: freeLeft })}</Text>
          <Text style={styles.proLink}>{t("upgrade")}</Text>
        </ScalePress>
      ) : null}

      {reports.length ? (
        <Txt variant="overline" style={{ paddingHorizontal: space.lg }}>
          {t("recentReports")}
        </Txt>
      ) : null}
    </View>
  );

  return (
    <View style={ui.screen}>
      <StatusBar style="light" />
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, gap: space.md }}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: space.xs }}
        initialNumToRender={10}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FileText size={30} color={colors.primary} strokeWidth={2} />
            </View>
            <Txt variant="h2">{t("noReports")}</Txt>
            <Txt variant="body" style={{ textAlign: "center" }}>
              {t("noReportsHint")}
            </Txt>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(350).delay(staggerDelay(index))} style={{ paddingHorizontal: space.lg }}>
            <ScalePress onPress={() => router.push(`/report/${item.id}`)} accessibilityLabel={item.customerName} style={[styles.item, shadow]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(item.customerName)}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt variant="title" numberOfLines={1}>
                  {item.customerName}
                </Txt>
                <Txt variant="caption" numberOfLines={1} style={{ color: colors.textSoft }}>
                  {item.content.title}
                </Txt>
                <View style={styles.metaRow}>
                  <Txt variant="caption">
                    {item.number} · {formatDate(item.createdAt, lang)}
                  </Txt>
                  {item.content.followUpRequired ? <Badge text={t("followUpBadge")} tone="warn" /> : null}
                  {item.source === "ai" ? <Badge text="AI" tone="accent" icon={Sparkles} /> : null}
                </View>
              </View>
              <ChevronRight size={20} color={colors.placeholder} />
            </ScalePress>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    gap: space.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.sm },
  tradeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: "75%",
  },
  tradeChipText: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 13 },
  hello: { color: "#FFFFFF", fontFamily: fonts.extrabold, fontSize: 30, letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.75)", fontFamily: fonts.semibold, fontSize: 15, marginBottom: space.sm },

  bento: { flexDirection: "row", gap: space.md, paddingHorizontal: space.lg },
  tile: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: 6 },
  tileWide: { flex: 1, justifyContent: "space-between" },
  tileSmall: { flex: 1, paddingVertical: 12, gap: 2 },
  tileRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tileIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tileNumber: { fontFamily: fonts.extrabold, fontSize: 40, color: colors.text, letterSpacing: -1 },
  tileNumberSm: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text },

  proBanner: {
    marginHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  proText: { flex: 1, fontFamily: fonts.semibold, color: colors.text, fontSize: 14 },
  proLink: { fontFamily: fonts.bold, color: colors.accent, fontSize: 14 },

  empty: { alignItems: "center", gap: 10, paddingTop: 24, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },

  item: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14 },
  avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.extrabold, color: colors.primary, fontSize: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
});
