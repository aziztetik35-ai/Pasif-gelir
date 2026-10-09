import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { colors } from "../src/components/ui";
import { AppProvider, useApp } from "../src/lib/AppContext";

function Screens() {
  const { ready, t } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerTintColor: colors.primary, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" options={{ title: t("homeTitle") }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="report/new" options={{ title: t("newReport") }} />
      <Stack.Screen name="report/[id]" options={{ title: t("reportSection") }} />
      <Stack.Screen name="settings" options={{ title: t("settingsTitle") }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal", title: "" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Screens />
    </AppProvider>
  );
}
