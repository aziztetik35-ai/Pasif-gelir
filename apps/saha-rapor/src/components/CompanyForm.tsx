import * as ImagePicker from "expo-image-picker";
import { Image, View } from "react-native";

import { useApp } from "../lib/AppContext";
import { tradeLabel } from "../lib/i18n";
import { deleteFile, storeImage } from "../lib/storage";
import { TRADES } from "../lib/types";
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
        <Image source={{ uri: settings.logoUri }} style={{ height: 70, width: 180, resizeMode: "contain", alignSelf: "center" }} />
      ) : null}
      <Button title={settings.logoUri ? t("changeLogo") : t("addLogo")} variant="secondary" onPress={pickLogo} />
      {settings.logoUri ? <Button title={t("removeLogo")} variant="danger" onPress={removeLogo} /> : null}
    </View>
  );
}

export function TradeList() {
  const { settings, updateSettings, lang } = useApp();
  return (
    <View style={{ gap: 8 }}>
      {TRADES.map((tr) => (
        <Choice key={tr} label={tradeLabel(lang, tr)} selected={settings.trade === tr} onPress={() => updateSettings({ trade: tr })} />
      ))}
    </View>
  );
}
