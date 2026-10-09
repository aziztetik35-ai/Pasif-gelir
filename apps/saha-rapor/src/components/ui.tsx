/**
 * Base UI kit: text, buttons, cards, fields, badges, notices, skeletons.
 * Motion ideas from 21st.dev patterns (shiny CTA button, spotlight-style selected cards, skeleton shimmer),
 * implemented natively with Reanimated. All animations respect the system "reduce motion" setting.
 */
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Check, type LucideIcon } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, ctaGradient, fonts, motion, primaryGradient, radius, shadow, space, staggerDelay } from "../theme";

export { colors };

function haptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

// ---------------------------------------------------------------- text

type Variant = "display" | "h1" | "h2" | "title" | "body" | "caption" | "label" | "overline";

const textStyles: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, color: colors.text, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, color: colors.text, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: colors.text, letterSpacing: -0.2 },
  title: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.textSoft },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.textSoft },
  // No textTransform: "uppercase" — it ignores language rules (Turkish i → İ), so titles keep their written case.
  overline: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, color: colors.muted, letterSpacing: 0.2 },
};

export function Txt({ variant = "body", style, ...props }: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[textStyles[variant], style]} />;
}

// ---------------------------------------------------------------- pressable with spring scale

export function ScalePress({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
  hapticFeedback = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "radio" | "link";
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  hapticFeedback?: boolean;
}) {
  const scale = useSharedValue(1);
  const reduce = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPressIn={() => {
        if (!reduce) scale.set(withSpring(motion.pressScale, { damping: 18, stiffness: 400 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { damping: 14, stiffness: 300 }));
      }}
      onPress={() => {
        if (hapticFeedback) haptic();
        onPress?.();
      }}
    >
      <Animated.View style={[animated, style]}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------- shine sweep (CTA)

function Shine() {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const x = useSharedValue(-1);
  useEffect(() => {
    if (reduce || !w) return;
    x.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, false));
  }, [reduce, w, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * w * 1.2 }, { rotate: "18deg" }] }));
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.shine, style]}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------- button

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  shine?: boolean;
  size?: "md" | "lg";
};

export function Button({ title, onPress, variant = "primary", icon: Icon, disabled, loading, shine, size = "md" }: ButtonProps) {
  const filled = variant === "primary" || variant === "accent";
  const fg = filled ? colors.primaryText : variant === "danger" ? colors.danger : colors.primary;
  const height = size === "lg" ? 58 : 50;
  const content = (
    <View style={[styles.btnInner, { height }]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {Icon ? <Icon size={20} color={fg} strokeWidth={2.4} /> : null}
          <Text style={[styles.btnText, { color: fg, fontSize: size === "lg" ? 17 : 16 }]}>{title}</Text>
        </>
      )}
    </View>
  );
  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={title}
      style={[
        styles.btn,
        filled ? shadow : null,
        variant === "secondary" && styles.btnSecondary,
        variant === "danger" && styles.btnDanger,
        (disabled || loading) && { opacity: 0.55 },
      ]}
    >
      {filled ? (
        <LinearGradient
          colors={variant === "accent" ? ctaGradient : primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
        />
      ) : null}
      {filled && shine && !loading ? <Shine /> : null}
      {content}
    </ScalePress>
  );
}

export function IconButton({ icon: Icon, onPress, label, color = colors.primary, bg = colors.primarySoft }: { icon: LucideIcon; onPress: () => void; label: string; color?: string; bg?: string }) {
  return (
    <ScalePress onPress={onPress} accessibilityLabel={label} style={[styles.iconBtn, { backgroundColor: bg }]}>
      <Icon size={20} color={color} strokeWidth={2.3} />
    </ScalePress>
  );
}

// ---------------------------------------------------------------- card

export function Card({
  title,
  icon: Icon,
  children,
  index = 0,
  style,
  right,
}: {
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  right?: ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(motion.slow).delay(staggerDelay(index))} style={[styles.card, shadow, style]}>
      {title ? (
        <View style={styles.cardHead}>
          {Icon ? (
            <View style={styles.cardIcon}>
              <Icon size={16} color={colors.primary} strokeWidth={2.5} />
            </View>
          ) : null}
          <Txt variant="overline" style={{ flex: 1 }}>
            {title}
          </Txt>
          {right}
        </View>
      ) : null}
      {children}
    </Animated.View>
  );
}

// ---------------------------------------------------------------- field

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="label">{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, props.multiline && styles.inputMulti, focused && styles.inputFocused, style]}
      />
    </View>
  );
}

// ---------------------------------------------------------------- notice, badge

export function Notice({ text, tone = "warn", icon: Icon }: { text: string; tone?: "warn" | "info" | "success"; icon?: LucideIcon }) {
  const map = {
    warn: { bg: colors.warnSoft, fg: colors.warn },
    info: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
  }[tone];
  return (
    <Animated.View entering={FadeInDown.duration(motion.base)} style={[styles.notice, { backgroundColor: map.bg }]}>
      {Icon ? <Icon size={18} color={map.fg} strokeWidth={2.4} /> : null}
      <Text style={[styles.noticeText, { color: map.fg }]}>{text}</Text>
    </Animated.View>
  );
}

export function Badge({ text, tone = "info", icon: Icon }: { text: string; tone?: "info" | "warn" | "success" | "accent"; icon?: LucideIcon }) {
  const map = {
    info: { bg: colors.primarySoft, fg: colors.primary },
    warn: { bg: colors.warnSoft, fg: colors.warn },
    success: { bg: colors.successSoft, fg: colors.success },
    accent: { bg: colors.accentSoft, fg: colors.accent },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      {Icon ? <Icon size={12} color={map.fg} strokeWidth={2.6} /> : null}
      <Text style={[styles.badgeText, { color: map.fg }]}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- choice tile

export function Choice({
  label,
  selected,
  onPress,
  icon: Icon,
  compact,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <ScalePress
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.choice, compact && styles.choiceCompact, selected && styles.choiceSelected]}
    >
      {Icon ? (
        <View style={[styles.choiceIcon, selected && { backgroundColor: colors.primary }]}>
          <Icon size={20} color={selected ? colors.primaryText : colors.primary} strokeWidth={2.3} />
        </View>
      ) : null}
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]} numberOfLines={2}>
        {label}
      </Text>
      {selected ? (
        <View style={styles.choiceCheck}>
          <Check size={14} color={colors.primaryText} strokeWidth={3} />
        </View>
      ) : null}
    </ScalePress>
  );
}

// ---------------------------------------------------------------- skeleton shimmer

export function Skeleton({ height = 14, width = "100%", style }: { height?: number; width?: ViewStyle["width"]; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const x = useSharedValue(-1);
  useEffect(() => {
    if (reduce || !w) return;
    x.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, false));
  }, [reduce, w, x]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * w }] }));
  return (
    <View style={[styles.skeleton, { height, width }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {reduce ? null : (
        <Animated.View style={[StyleSheet.absoluteFill, anim]}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.7)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, paddingBottom: 56, gap: space.lg },
  row: { flexDirection: "row", gap: space.md, alignItems: "center" },
  label: textStyles.label,
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    backgroundColor: "#FBFCFE",
  },
  inputMulti: { minHeight: 96, textAlignVertical: "top" },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.card },

  btn: { borderRadius: radius.md, overflow: "hidden" },
  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18 },
  btnText: { fontFamily: fonts.bold, letterSpacing: 0.1 },
  btnSecondary: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  btnDanger: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.dangerSoft },
  shine: { position: "absolute", top: -20, bottom: -20, left: "-60%", width: "45%" },
  iconBtn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  cardHead: { flexDirection: "row", alignItems: "center", gap: space.sm },
  cardIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },

  notice: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: radius.md, padding: 12 },
  noticeText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.2 },

  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.card,
    minHeight: 56,
  },
  choiceCompact: { paddingVertical: 10, minHeight: 48 },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  choiceText: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  choiceTextSelected: { color: colors.primary },
  choiceCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },

  skeleton: { backgroundColor: "#E7ECF4", borderRadius: 8, overflow: "hidden" },
});
