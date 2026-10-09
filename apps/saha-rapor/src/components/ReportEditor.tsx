import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Camera, Check, FileText, Mic, PenLine, Plus, Share2, Sparkles, Trash, User, Wand2, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { structureReport } from "../lib/ai";
import { useApp } from "../lib/AppContext";
import { createPdf, sharePdf } from "../lib/pdf";
import { newId, reportNumber } from "../lib/storage";
import { linesToList, listToLines } from "../lib/structure";
import type { Part, Report, ReportContent, Signature } from "../lib/types";
import { colors, fonts, radius, shadowStrong, space } from "../theme";
import { SuccessBurst } from "./Hero";
import { PhotoPicker } from "./PhotoPicker";
import { SignaturePad } from "./SignaturePad";
import { Button, Card, Field, Notice, Skeleton, Txt, styles as ui } from "./ui";
import { VoiceInput } from "./VoiceInput";

type Props = { existing?: Report };

function successHaptic() {
  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function ReportEditor({ existing }: Props) {
  const { t, lang, settings, saveReport, deleteReport, appUserId } = useApp();
  // Id, number and date are fixed once, so a second save updates the same report.
  const [identity] = useState(() => ({
    id: existing?.id ?? newId(),
    number: existing?.number ?? reportNumber(settings.reportsCreated + 1),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }));
  const [persisted, setPersisted] = useState(!!existing);
  const isNew = !existing;

  const [customerName, setCustomerName] = useState(existing?.customerName ?? "");
  const [customerAddress, setCustomerAddress] = useState(existing?.customerAddress ?? "");
  const [customerContact, setCustomerContact] = useState(existing?.customerContact ?? "");
  const [equipment, setEquipment] = useState(existing?.equipment ?? "");
  const [transcript, setTranscript] = useState(existing?.transcript ?? "");

  const [content, setContent] = useState<ReportContent | null>(existing?.content ?? null);
  const [workText, setWorkText] = useState(listToLines(existing?.content.workPerformed ?? []));
  const [findingsText, setFindingsText] = useState(listToLines(existing?.content.findings ?? []));
  const [recText, setRecText] = useState(listToLines(existing?.content.recommendations ?? []));
  const [parts, setParts] = useState<Part[]>(existing?.content.partsUsed ?? []);
  const [source, setSource] = useState<Report["source"]>(existing?.source ?? "basic");

  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [signature, setSignature] = useState<Signature | null>(existing?.signature ?? null);
  const [signerName, setSignerName] = useState(existing?.signerName ?? "");

  const [structuring, setStructuring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [success, setSuccess] = useState<{ pdf: string } | null>(null);

  function applyContent(c: ReportContent) {
    setContent(c);
    setWorkText(listToLines(c.workPerformed));
    setFindingsText(listToLines(c.findings));
    setRecText(listToLines(c.recommendations));
    setParts(c.partsUsed);
  }

  async function create() {
    if (!customerName.trim()) return Alert.alert(t("needCustomer"));
    if (!transcript.trim()) return Alert.alert(t("needContent"));
    setStructuring(true);
    try {
      const result = await structureReport({ transcript, lang, trade: settings.trade, equipment, appUserId: await appUserId() });
      applyContent(result.content);
      setSource(result.source);
      successHaptic();
    } finally {
      setStructuring(false);
    }
  }

  function buildReport(): Report | null {
    if (!content) return null;
    return {
      ...identity,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      customerContact: customerContact.trim(),
      equipment: equipment.trim(),
      transcript,
      content: {
        ...content,
        workPerformed: linesToList(workText),
        findings: linesToList(findingsText),
        recommendations: linesToList(recText),
        partsUsed: parts.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), quantity: p.quantity.trim() || "1" })),
      },
      photos,
      signature,
      signerName: signerName.trim(),
      source,
    };
  }

  async function saveAndShare() {
    const report = buildReport();
    if (!report) return;
    if (!report.customerName) return Alert.alert(t("needCustomer"));
    setSaving(true);
    try {
      await saveReport(report, !persisted);
      setPersisted(true);
      const pdf = await createPdf(report, settings, lang);
      successHaptic();
      setSuccess({ pdf });
      await sharePdf(pdf, t("sharePdf"));
    } catch {
      Alert.alert(t("error"));
    } finally {
      setSaving(false);
    }
  }

  function closeSuccess() {
    setSuccess(null);
    if (isNew) router.replace(`/report/${identity.id}`);
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert(t("deleteConfirm"), "", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteReport(existing.id);
          router.back();
        },
      },
    ]);
  }

  const updatePart = (i: number, patch: Partial<Part>) => setParts(parts.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={ui.scroll} scrollEnabled={scrollEnabled} keyboardShouldPersistTaps="handled">
        <Card title={t("customerSection")} icon={User} index={0}>
          <Field label={t("customerName")} value={customerName} onChangeText={setCustomerName} />
          <Field label={t("customerAddress")} value={customerAddress} onChangeText={setCustomerAddress} />
          <Field label={t("customerContact")} value={customerContact} onChangeText={setCustomerContact} autoCapitalize="none" />
          <Field label={t("equipment")} value={equipment} onChangeText={setEquipment} />
        </Card>

        {!content && !structuring ? (
          <Card title={t("voiceSection")} icon={Mic} index={1}>
            <Txt variant="body">{t("voiceHint")}</Txt>
            <VoiceInput
              value={transcript}
              onChange={setTranscript}
              lang={lang}
              labels={{
                start: t("recordStart"),
                stop: t("recordStop"),
                listening: t("recording"),
                placeholder: t("transcriptPlaceholder"),
                micDenied: t("micDenied"),
                unavailable: t("speechUnavailable"),
              }}
            />
            <Button title={t("createReport")} icon={Wand2} size="lg" variant="accent" shine onPress={create} />
          </Card>
        ) : null}

        {structuring ? (
          <Card title={t("structuring")} icon={Sparkles}>
            <Skeleton height={22} width="70%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="92%" />
            <Skeleton height={14} width="80%" />
            <View style={{ height: 6 }} />
            <Skeleton height={14} width="60%" />
            <Skeleton height={14} width="88%" />
          </Card>
        ) : null}

        {content && !structuring ? (
          <>
            {source === "basic" && isNew ? <Notice text={t("basicNotice")} icon={Sparkles} /> : null}
            <Card
              title={t("reportSection")}
              icon={FileText}
              index={1}
              right={source === "ai" ? <Sparkles size={16} color={colors.accent} strokeWidth={2.4} /> : null}
            >
              <Field label={t("reportTitle")} value={content.title} onChangeText={(v) => setContent({ ...content, title: v })} />
              <Field label={t("summary")} value={content.summary} multiline onChangeText={(v) => setContent({ ...content, summary: v })} />
              <Field label={`${t("findings")} · ${t("onePerLine")}`} value={findingsText} multiline onChangeText={setFindingsText} />
              <Field label={`${t("workPerformed")} · ${t("onePerLine")}`} value={workText} multiline onChangeText={setWorkText} />

              <Txt variant="label">{t("partsUsed")}</Txt>
              {parts.map((p, i) => (
                <Animated.View key={i} entering={FadeInDown.duration(250)} style={styles.partRow}>
                  <TextInput
                    style={[ui.input, { flex: 1, minWidth: 0 }]}
                    value={p.name}
                    placeholder={t("partName")}
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={t("partName")}
                    onChangeText={(v) => updatePart(i, { name: v })}
                  />
                  <TextInput
                    style={[ui.input, styles.qty]}
                    value={p.quantity}
                    placeholder={t("quantity")}
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={t("quantity")}
                    onChangeText={(v) => updatePart(i, { quantity: v })}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("delete")}
                    onPress={() => setParts(parts.filter((_, j) => j !== i))}
                    style={styles.partDelete}
                    hitSlop={6}
                  >
                    <X size={16} color={colors.danger} strokeWidth={2.6} />
                  </Pressable>
                </Animated.View>
              ))}
              <Button title={t("addPart")} icon={Plus} variant="secondary" onPress={() => setParts([...parts, { name: "", quantity: "1" }])} />

              <Field label={`${t("recommendations")} · ${t("onePerLine")}`} value={recText} multiline onChangeText={setRecText} />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t("followUp")}</Text>
                <Switch
                  value={content.followUpRequired}
                  onValueChange={(v) => setContent({ ...content, followUpRequired: v })}
                  trackColor={{ true: colors.accent, false: colors.border }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel={t("followUp")}
                />
              </View>
            </Card>

            <Card title={t("photosSection")} icon={Camera} index={2}>
              <PhotoPicker
                photos={photos}
                onChange={setPhotos}
                labels={{ camera: t("takePhoto"), gallery: t("pickPhoto"), max: t("maxPhotos", { n: 6 }), cameraDenied: t("cameraDenied") }}
              />
            </Card>

            <Card title={t("signatureSection")} icon={PenLine} index={3}>
              <SignaturePad value={signature} onChange={setSignature} onDrawing={(d) => setScrollEnabled(!d)} placeholder={t("signHere")} />
              <Button title={t("clearSignature")} variant="secondary" onPress={() => setSignature(null)} />
              <Field label={t("signerName")} value={signerName} onChangeText={setSignerName} />
            </Card>

            <Button title={t("savePdf")} icon={Share2} size="lg" variant="accent" shine onPress={saveAndShare} loading={saving} />
            {existing ? <Button title={t("delete")} icon={Trash} variant="danger" onPress={confirmDelete} /> : null}
          </>
        ) : null}
      </ScrollView>

      <Modal visible={!!success} transparent animationType="fade" onRequestClose={closeSuccess}>
        <View style={styles.backdrop}>
          <Animated.View entering={FadeIn.duration(200)} style={[styles.sheet, shadowStrong]}>
            <SuccessBurst>
              <Check size={42} color="#FFFFFF" strokeWidth={3} />
            </SuccessBurst>
            <Txt variant="h2" style={{ textAlign: "center" }}>
              {t("savedTitle")}
            </Txt>
            <Txt variant="body" style={{ textAlign: "center" }}>
              {t("savedText")}
            </Txt>
            <View style={{ alignSelf: "stretch", gap: space.sm }}>
              <Button title={t("sharePdf")} icon={Share2} onPress={() => success && sharePdf(success.pdf, t("sharePdf"))} />
              <Button title={t("done")} variant="secondary" onPress={closeSuccess} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  partRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qty: { width: 72, textAlign: "center", paddingHorizontal: 6 },
  partDelete: { width: 32, height: 44, alignItems: "center", justifyContent: "center" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  switchLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(11,27,63,0.55)", alignItems: "center", justifyContent: "center", padding: space.xl },
  sheet: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: "center",
    gap: space.md,
  },
});
