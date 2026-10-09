/**
 * Dictation with the phone's own speech recognition. It is free: no audio is sent to our servers.
 * Final results are appended to the text. Interim results are shown in grey while the user speaks.
 *
 * Visual: a large microphone button with pulse rings and a live level meter, driven by the
 * recognizer's "volumechange" events. Reduce-motion users get a static button.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Mic, Square } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { SPEECH_LOCALE } from "../lib/i18n";
import type { Lang } from "../lib/types";
import { colors, ctaGradient, fonts, palette, radius } from "../theme";
import { PulseRing } from "./Hero";
import { ScalePress, Txt } from "./ui";

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

function clock(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

const BARS = 7;

function LevelBar({ level, index }: { level: number; index: number }) {
  const h = useSharedValue(6);
  useEffect(() => {
    // Middle bars move more: a simple, readable "voice" shape.
    const weight = 1 - Math.abs(index - (BARS - 1) / 2) / BARS;
    h.set(withTiming(6 + level * 30 * weight, { duration: 120 }));
  }, [level, index, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, style]} />;
}

export function VoiceInput({ value, onChange, lang, labels }: Props) {
  const reduce = useReducedMotion();
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  // Speech events arrive later; they need the latest text, not the text from an old render.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const micScale = useSharedValue(1);
  const micStyle = useAnimatedStyle(() => ({ transform: [{ scale: micScale.value }] }));

  useEffect(() => {
    if (!listening) return;
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(id);
  }, [listening]);

  useSpeechRecognitionEvent("start", () => {
    setListening(true);
    setSeconds(0);
  });
  useSpeechRecognitionEvent("end", () => {
    setListening(false);
    setInterim("");
    setLevel(0);
    micScale.set(withSpring(1));
  });
  useSpeechRecognitionEvent("volumechange", (e) => {
    // value: -2 … 10. Below 0 is silence.
    const v = Math.max(0, Math.min(1, e.value / 10));
    setLevel(v);
    if (!reduce) micScale.set(withSpring(1 + v * 0.12, { damping: 12, stiffness: 220 }));
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
    setLevel(0);
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
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    ExpoSpeechRecognitionModule.start({
      lang: SPEECH_LOCALE[lang],
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      volumeChangeEventOptions: { enabled: true, intervalMillis: 120 },
    });
  }

  function stop() {
    ExpoSpeechRecognitionModule.stop();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.micArea}>
        {listening ? (
          <>
            <PulseRing size={112} color="rgba(234,88,12,0.45)" />
            <PulseRing size={140} color="rgba(234,88,12,0.25)" />
          </>
        ) : null}
        <ScalePress
          onPress={listening ? stop : start}
          accessibilityLabel={listening ? labels.stop : labels.start}
          hapticFeedback={false}
        >
          <Animated.View style={[styles.mic, micStyle]}>
            <LinearGradient
              colors={listening ? ctaGradient : [palette.blue500, palette.blue700]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Wrapped in a View so the icon stays above the absolute gradient on every platform. */}
            <View>{listening ? <Square size={30} color="#FFFFFF" fill="#FFFFFF" /> : <Mic size={38} color="#FFFFFF" strokeWidth={2.2} />}</View>
          </Animated.View>
        </ScalePress>
      </View>

      <View style={styles.statusRow}>
        {listening ? (
          <>
            <View style={styles.liveDot} />
            <Text style={styles.live}>{labels.listening}</Text>
            <Text style={styles.timer}>{clock(seconds)}</Text>
          </>
        ) : (
          <Txt variant="caption">{labels.start}</Txt>
        )}
      </View>

      {listening ? (
        <View style={styles.bars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: BARS }).map((_, i) => (
            <LevelBar key={i} index={i} level={reduce ? 0.3 : level} />
          ))}
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={labels.placeholder}
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={labels.placeholder}
      />
      {interim ? <Text style={styles.interim}>{interim}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  micArea: { height: 150, alignItems: "center", justifyContent: "center" },
  mic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 22 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  live: { fontFamily: fonts.bold, color: colors.accent, fontSize: 14 },
  timer: { fontFamily: fonts.semibold, color: colors.muted, fontSize: 14, fontVariant: ["tabular-nums"] },
  bars: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 40 },
  bar: { width: 6, borderRadius: 3, backgroundColor: colors.accent },
  input: {
    minHeight: 140,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: colors.text,
    backgroundColor: "#FBFCFE",
    textAlignVertical: "top",
  },
  interim: { color: colors.muted, fontStyle: "italic", fontFamily: fonts.regular },
});
