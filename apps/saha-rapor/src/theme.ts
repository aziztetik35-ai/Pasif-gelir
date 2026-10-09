/**
 * Design tokens.
 *
 * Source: ui-ux-pro-max-skill data (MIT), product type "Home Services (Plumber/Electrician)":
 *   style "Flat Design + Micro-interactions", palette "Trust Blue + Safety Orange + Professional grey",
 *   font pairing "Enterprise SaaS Mobile (Plus Jakarta Sans)".
 * Motion values follow its motion table: micro-interactions 150–300 ms, list stagger ≤ 40 ms per item.
 */
import { Platform } from "react-native";

export const palette = {
  navy: "#0B1B3F",
  blue900: "#1E3A8A",
  blue700: "#1E40AF",
  blue500: "#3B82F6",
  blue100: "#DBEAFE",
  blue50: "#EFF6FF",
  orange600: "#EA580C",
  orange500: "#F97316",
  orange100: "#FFEDD5",
  green600: "#059669",
  green100: "#D1FAE5",
  red600: "#DC2626",
  red100: "#FEE2E2",
  amber700: "#B45309",
  amber100: "#FEF3C7",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  white: "#FFFFFF",
};

export const colors = {
  bg: "#F5F7FB",
  card: palette.white,
  text: palette.slate900,
  textSoft: palette.slate700,
  muted: palette.slate500,
  placeholder: palette.slate400,
  border: palette.slate200,
  primary: palette.blue700,
  primarySoft: palette.blue50,
  primaryText: palette.white,
  accent: palette.orange600,
  accentSoft: palette.orange100,
  success: palette.green600,
  successSoft: palette.green100,
  danger: palette.red600,
  dangerSoft: palette.red100,
  warn: palette.amber700,
  warnSoft: palette.amber100,
};

/** Hero gradient: deep navy → trust blue. */
export const heroGradient = [palette.navy, palette.blue900, palette.blue700] as const;
/** Call-to-action gradient: safety orange. */
export const ctaGradient = [palette.orange500, palette.orange600] as const;
export const primaryGradient = [palette.blue500, palette.blue700] as const;

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const motion = {
  /** Press feedback (spring). */
  pressScale: 0.97,
  fast: 150,
  base: 250,
  slow: 400,
  /** Delay between list items. Keep small so long lists do not feel slow. */
  stagger: 40,
  maxStaggerItems: 8,
};

export const shadow = Platform.select({
  ios: { shadowColor: palette.navy, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 3 },
  default: { boxShadow: "0 6px 16px rgba(11,27,63,0.08)" },
}) as object;

export const shadowStrong = Platform.select({
  ios: { shadowColor: palette.navy, shadowOpacity: 0.22, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
  android: { elevation: 8 },
  default: { boxShadow: "0 10px 24px rgba(11,27,63,0.22)" },
}) as object;

/** Entering delay for item i of a list, capped so late items do not wait too long. */
export function staggerDelay(i: number): number {
  return Math.min(i, motion.maxStaggerItems) * motion.stagger;
}
