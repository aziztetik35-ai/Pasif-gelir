import { Redirect, router, Stack } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Button, colors, Notice, styles as ui } from "../src/components/ui";
import { useApp } from "../src/lib/AppContext";
import { formatDate } from "../src/lib/reportHtml";

export default function Home() {
  const { settings, reports, t, lang, canCreateReport, freeLeft } = useApp();

  if (!settings.onboarded) return <Redirect href="/onboarding" />;

  function newReport() {
    router.push(canCreateReport ? "/report/new" : "/paywall");
  }

  return (
    <View style={ui.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable accessibilityLabel={t("settings")} onPress={() => router.push("/settings")} hitSlop={12}>
              <Text style={styles.gear}>⚙︎</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={ui.scroll}
        ListHeaderComponent={
          <View style={{ gap: 10 }}>
            <Button title={t("newReport")} icon="＋" onPress={newReport} />
            {Number.isFinite(freeLeft) ? <Notice tone="info" text={t("freeLeft", { n: freeLeft })} /> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t("noReports")}</Text>
            <Text style={ui.p}>{t("noReportsHint")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => router.push(`/report/${item.id}`)}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.customerName}
            </Text>
            <Text style={styles.itemSub} numberOfLines={1}>
              {item.content.title}
            </Text>
            <Text style={styles.itemMeta}>
              {item.number} · {formatDate(item.createdAt, lang)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gear: { fontSize: 24, color: colors.primary },
  empty: { alignItems: "center", gap: 6, paddingTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  item: { backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 2 },
  itemTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  itemSub: { fontSize: 15, color: colors.text },
  itemMeta: { fontSize: 13, color: colors.muted },
});
