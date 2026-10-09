import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { deleteFile, storeImage } from "../lib/storage";
import { MAX_PHOTOS } from "../lib/types";
import { Button, colors, styles as ui } from "./ui";

type Props = {
  photos: string[];
  onChange: (photos: string[]) => void;
  labels: { camera: string; gallery: string; max: string; cameraDenied: string };
};

export function PhotoPicker({ photos, onChange, labels }: Props) {
  const [busy, setBusy] = useState(false);
  const left = MAX_PHOTOS - photos.length;

  async function add(fromCamera: boolean) {
    if (left <= 0) {
      Alert.alert(labels.max);
      return;
    }
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(labels.cameraDenied);
        return;
      }
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: "images",
      quality: 0.8,
      allowsMultipleSelection: !fromCamera,
      selectionLimit: left,
    };
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;
    setBusy(true);
    try {
      const stored: string[] = [];
      for (const asset of result.assets.slice(0, left)) {
        stored.push(await storeImage(asset.uri, ["photos"], 1280));
      }
      onChange([...photos, ...stored]);
    } finally {
      setBusy(false);
    }
  }

  function remove(uri: string) {
    deleteFile(uri);
    onChange(photos.filter((p) => p !== uri));
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={ui.row}>
        <View style={{ flex: 1 }}>
          <Button title={labels.camera} icon="📷" variant="secondary" onPress={() => add(true)} loading={busy} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={labels.gallery} icon="🖼" variant="secondary" onPress={() => add(false)} disabled={busy} />
        </View>
      </View>
      {photos.length ? (
        <View style={styles.grid}>
          {photos.map((uri) => (
            <View key={uri} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable accessibilityLabel="Remove photo" onPress={() => remove(uri)} style={styles.remove}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { width: "31%", aspectRatio: 1 },
  thumb: { width: "100%", height: "100%", borderRadius: 8, backgroundColor: colors.border },
  remove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "#fff", fontWeight: "700" },
});
