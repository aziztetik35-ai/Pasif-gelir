import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Trash } from "lucide-react-native";
import { Image, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useApp } from "../lib/AppContext";
import { tradeLabel } from "../lib/i18n";
import { deleteFile, storeImage } from "../lib/storage";
import { TRADES } from "../lib/types";
import { colors, radius, staggerDelay } from "../theme";
import { TRADE_ICONS } from "./Hero";
import { Button, Choice, Field } from "./ui";

/** Company fields, shared by onboarding and settings. Changes are saved at once. */
export function CompanyForm() {
  const { settings, updateSettings, t } = useApp();

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 1 });
    if (result.canceled) return;
    const uri = await storeImage(result.assets[0].uri, ["logo"], 600);
    deleteFile(settings.logoUri);
    await updateSettings({ logoUri: uri });
  }

  async function removeLogo() {
    deleteFile(settings.logoUri);
    await updateSettings({ logoUri: null });
  }

  return (
    <View style={{ gap: 10 }}>
      <Field label={t("companyName")} value={settings.companyName} onChangeText={(v) => updateSettings({ companyName: v })} />
      <Field label={t("technicianName")} value={settings.technicianName} onChangeText={(v) => updateSettings({ technicianName: v })} />
      <Field label={t("phone")} value={settings.phone} keyboardType="phone-pad" onChangeText={(v) => updateSettings({ phone: v })} />
      <Field
        label={t("email")}
        value={settings.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(v) => updateSettings({ email: v })}
      />
      <Field label={t("address")} value={settings.address} multiline onChangeText={(v) => updateSettings({ address: v })} />
      {settings.logoUri ? (
        <View style={{ alignItems: "center", padding: 12, borderRadius: radius.md, backgroundColor: colors.bg }}>
          <Image source={{ uri: settings.logoUri }} style={{ height: 70, width: 180, resizeMode: "contain" }} />
        </View>
      ) : null}
      <Button title={settings.logoUri ? t("changeLogo") : t("addLogo")} icon={ImagePlus} variant="secondary" onPress={pickLogo} />
      {settings.logoUri ? <Button title={t("removeLogo")} icon={Trash} variant="danger" onPress={removeLogo} /> : null}
    </View>
  );
}

export function TradeList() {
  const { settings, updateSettings, lang } = useApp();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {TRADES.map((tr, i) => (
        <Animated.View key={tr} entering={FadeInDown.duration(350).delay(staggerDelay(i))} style={{ width: "48%", flexGrow: 1 }}>
          <Choice
            label={tradeLabel(lang, tr)}
            icon={TRADE_ICONS[tr]}
            selected={settings.trade === tr}
            onPress={() => updateSettings({ trade: tr })}
          />
        </Animated.View>
      ))}
    </View>
  );
}
