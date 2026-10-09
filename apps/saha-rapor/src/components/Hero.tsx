/**
 * Signature visuals.
 *  - AuroraBackground: deep-blue gradient with slowly drifting light orbs
 *    (inspired by the animated hero backgrounds on 21st.dev and motionsites.ai).
 *  - CountUp: numbers that count up once (21st.dev "Numbers" / "Stats & KPIs" pattern).
 *  - StepDots: onboarding progress (stepper pattern).
 * Every loop stops when the system "reduce motion" setting is on.
 */
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowUpDown,
  Briefcase,
  Cog,
  Droplets,
  ShieldCheck,
  Snowflake,
  WashingMachine,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { Trade } from "../lib/types";
import { colors, heroGradient, palette } from "../theme";

export const TRADE_ICONS: Record<Trade, LucideIcon> = {
  hvac: Snowflake,
  electrical: Zap,
  elevator: ArrowUpDown,
  appliance: WashingMachine,
  machine: Cog,
  security: ShieldCheck,
  plumbing: Droplets,
  general: Briefcase,
};

function Orb({ size, color, from, to, duration }: { size: number; color: string; from: [number, number]; to: [number, number]; duration: number }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [reduce, duration, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: from[0] + (to[0] - from[0]) * t.value },
      { translateY: from[1] + (to[1] - from[1]) * t.value },
      { scale: 1 + 0.12 * t.value },
    ],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

export function AuroraBackground({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.aurora, style]}>
      <LinearGradient colors={heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Orb size={260} color="rgba(59,130,246,0.35)" from={[-80, -60]} to={[40, 10]} duration={9000} />
      <Orb size={200} color="rgba(125,211,252,0.16)" from={[220, 40]} to={[140, -30]} duration={11000} />
      {/* one small warm orb: the safety-orange accent, kept light so it does not turn muddy on blue */}
      <Orb size={120} color="rgba(251,146,60,0.18)" from={[150, 190]} to={[230, 130]} duration={13000} />
      {/* fine grid lines: a quiet "blueprint" texture for a technical product */}
      <View pointerEvents="none" style={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridV, { left: `${(i + 1) * 12.5}%` }]} />
        ))}
      </View>
      {children}
    </View>
  );
}

/** Gently pulsing ring, used behind hero icons. */
export function PulseRing({ size, color = "rgba(255,255,255,0.25)" }: { size: number; color?: string }) {
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  const o = useSharedValue(0.6);
  useEffect(() => {
    if (reduce) return;
    s.set(withRepeat(withTiming(1.5, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false));
    o.set(withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false));
  }, [reduce, s, o]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }, style]} />;
}

/** Count from 0 to value once (JS timer; small numbers only). */
export function CountUp({ value, style, suffix = "" }: { value: number; style?: StyleProp<TextStyle>; suffix?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const start = Date.now();
    const duration = 700;
    let frame = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduce]);
  return (
    <Text style={style}>
      {reduce ? value : shown}
      {suffix}
    </Text>
  );
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.dots} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step + 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === step} done={i < step} />
      ))}
    </View>
  );
}

function Dot({ active, done }: { active: boolean; done: boolean }) {
  const w = useSharedValue(active ? 26 : 8);
  useEffect(() => {
    w.set(withSpring(active ? 26 : 8, { damping: 16, stiffness: 220 }));
  }, [active, w]);
  const style = useAnimatedStyle(() => ({ width: w.value }));
  return <Animated.View style={[styles.dot, style, { backgroundColor: active || done ? colors.accent : "rgba(255,255,255,0.35)" }]} />;
}

/** Pop-in check mark for "saved" moments. */
export function SuccessBurst({ size = 84, children }: { size?: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const s = useSharedValue(reduce ? 1 : 0.4);
  useEffect(() => {
    if (reduce) return;
    s.set(withSequence(withSpring(1.12, { damping: 9, stiffness: 260 }), withSpring(1, { damping: 12 })));
  }, [reduce, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size * 1.6, height: size * 1.6 }}>
      <PulseRing size={size} color="rgba(5,150,105,0.35)" />
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: palette.green600, alignItems: "center", justifyContent: "center" }, style]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  aurora: { overflow: "hidden", backgroundColor: palette.navy },
  grid: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.07 },
  gridV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#FFFFFF" },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
});
