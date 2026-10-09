/**
 * Dictation with the phone's own speech recognition. It is free: no audio is sent to our servers.
 * Final results are appended to the text. Interim results are shown in grey while the user speaks.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { SPEECH_LOCALE } from "../lib/i18n";
import type { Lang } from "../lib/types";
import { Button, colors } from "./ui";

type Props = {
  value: string;
  onChange: (text: string) => void;
  lang: Lang;
  labels: { start: string; stop: string; listening: string; placeholder: string; micDenied: string; unavailable: string };
};

function join(a: string, b: string): string {
  const x = a.trim();
  const y = b.trim();
  if (!x) return y;
  if (!y) return x;
  return /[.!?]$/.test(x) ? `${x} ${y}` : `${x}. ${y}`;
}

export function VoiceInput({ value, onChange, lang, labels }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  // Speech events arrive later; they need the latest text, not the text from an old render.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => {
    setListening(false);
    setInterim("");
  });
  useSpeechRecognitionEvent("result", (e) => {
    const text = e.results[0]?.transcript ?? "";
    if (e.isFinal) {
      onChange(join(valueRef.current, text));
      setInterim("");
    } else {
      setInterim(text);
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    setListening(false);
    setInterim("");
    if (e.error === "not-allowed") Alert.alert(labels.micDenied);
    else if (e.error === "service-not-allowed" || e.error === "language-not-supported") Alert.alert(labels.unavailable);
  });

  async function start() {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      Alert.alert(labels.unavailable);
      return;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(labels.micDenied);
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: SPEECH_LOCALE[lang],
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
    });
  }

  return (
    <View style={styles.wrap}>
      <Button
        title={listening ? labels.stop : labels.start}
        icon={listening ? "■" : "🎤"}
        variant={listening ? "secondary" : "primary"}
        onPress={() => (listening ? ExpoSpeechRecognitionModule.stop() : start())}
      />
      {listening ? <Text style={styles.listening}>{labels.listening}</Text> : null}
      <TextInput
        style={styles.input}
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={labels.placeholder}
        placeholderTextColor="#9AA5B5"
      />
      {interim ? <Text style={styles.interim}>{interim}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  listening: { color: colors.danger, fontWeight: "700" },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  interim: { color: colors.muted, fontStyle: "italic" },
});
