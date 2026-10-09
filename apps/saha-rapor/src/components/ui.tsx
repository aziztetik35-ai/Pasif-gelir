import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

export const colors = {
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#1B2433",
  muted: "#5A6474",
  border: "#D9DEE7",
  primary: "#1F5EFF",
  primaryText: "#FFFFFF",
  danger: "#C62828",
  warnBg: "#FFF4E5",
  warnText: "#8A4B00",
  success: "#1E7D4F",
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
};

export function Button({ title, onPress, variant = "primary", disabled, loading, icon }: ButtonProps) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnSecondary,
        variant === "danger" && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        pressed && styles.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.primaryText : colors.primary} />
      ) : (
        <Text style={[styles.btnText, primary ? styles.btnTextPrimary : variant === "danger" ? styles.btnTextDanger : styles.btnTextSecondary]}>
          {icon ? `${icon}  ` : ""}
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#9AA5B5"
        {...props}
        style={[styles.input, props.multiline && styles.inputMulti, props.style]}
      />
    </View>
  );
}

export function Notice({ text, tone = "warn" }: { text: string; tone?: "warn" | "info" }) {
  return (
    <View style={[styles.notice, tone === "info" && styles.noticeInfo]}>
      <Text style={[styles.noticeText, tone === "info" && styles.noticeInfoText]}>{text}</Text>
    </View>
  );
}

export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 48, gap: 14 },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text },
  p: { fontSize: 16, color: colors.muted, lineHeight: 22 },
  btn: { minHeight: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  btnDanger: { borderColor: colors.danger },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { opacity: 0.8 },
  btnText: { fontSize: 16, fontWeight: "700" },
  btnTextPrimary: { color: colors.primaryText },
  btnTextSecondary: { color: colors.primary },
  btnTextDanger: { color: colors.danger },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 13, fontWeight: "800", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  field: { gap: 4 },
  label: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text, backgroundColor: "#FFFFFF" },
  inputMulti: { minHeight: 90, textAlignVertical: "top" },
  notice: { backgroundColor: colors.warnBg, borderRadius: 10, padding: 10 },
  noticeText: { color: colors.warnText, fontSize: 14 },
  noticeInfo: { backgroundColor: "#E8EFFF" },
  noticeInfoText: { color: colors.primary },
  choice: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: colors.card },
  choiceSelected: { borderColor: colors.primary, backgroundColor: "#E8EFFF" },
  choiceText: { fontSize: 16, color: colors.text },
  choiceTextSelected: { color: colors.primary, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
});
