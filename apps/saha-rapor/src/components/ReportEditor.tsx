import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { structureReport } from "../lib/ai";
import { useApp } from "../lib/AppContext";
import { createPdf, sharePdf } from "../lib/pdf";
import { newId, reportNumber } from "../lib/storage";
import { linesToList, listToLines } from "../lib/structure";
import type { Part, Report, ReportContent, Signature } from "../lib/types";
import { PhotoPicker } from "./PhotoPicker";
import { SignaturePad } from "./SignaturePad";
import { Button, Card, colors, Field, Notice, styles as ui } from "./ui";
import { VoiceInput } from "./VoiceInput";

type Props = { existing?: Report };

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
      const result = await structureReport({
        transcript,
        lang,
        trade: settings.trade,
        equipment,
        appUserId: await appUserId(),
      });
      applyContent(result.content);
      setSource(result.source);
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
      await sharePdf(pdf, t("sharePdf"));
      if (isNew) router.replace(`/report/${report.id}`);
    } catch {
      Alert.alert(t("error"));
    } finally {
      setSaving(false);
    }
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
        <Card title={t("customerSection")}>
          <Field label={t("customerName")} value={customerName} onChangeText={setCustomerName} />
          <Field label={t("customerAddress")} value={customerAddress} onChangeText={setCustomerAddress} />
          <Field label={t("customerContact")} value={customerContact} onChangeText={setCustomerContact} autoCapitalize="none" />
          <Field label={t("equipment")} value={equipment} onChangeText={setEquipment} />
        </Card>

        {!content ? (
          <Card title={t("voiceSection")}>
            <Text style={ui.p}>{t("voiceHint")}</Text>
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
            <Button title={structuring ? t("structuring") : t("createReport")} onPress={create} loading={structuring} />
          </Card>
        ) : (
          <>
            {source === "basic" && isNew ? <Notice text={t("basicNotice")} /> : null}
            <Card title={t("reportSection")}>
              <Field label={t("reportTitle")} value={content.title} onChangeText={(v) => setContent({ ...content, title: v })} />
              <Field label={t("summary")} value={content.summary} multiline onChangeText={(v) => setContent({ ...content, summary: v })} />
              <Field label={`${t("findings")} · ${t("onePerLine")}`} value={findingsText} multiline onChangeText={setFindingsText} />
              <Field label={`${t("workPerformed")} · ${t("onePerLine")}`} value={workText} multiline onChangeText={setWorkText} />

              <Text style={ui.label}>{t("partsUsed")}</Text>
              {parts.map((p, i) => (
                <View key={i} style={ui.row}>
                  <TextInput
                    style={[ui.input, { flex: 1 }]}
                    value={p.name}
                    placeholder={t("partName")}
                    onChangeText={(v) => updatePart(i, { name: v })}
                  />
                  <TextInput
                    style={[ui.input, { width: 70, textAlign: "center" }]}
                    value={p.quantity}
                    placeholder={t("quantity")}
                    onChangeText={(v) => updatePart(i, { quantity: v })}
                  />
                  <Pressable accessibilityLabel={t("delete")} onPress={() => setParts(parts.filter((_, j) => j !== i))}>
                    <Text style={styles.x}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <Button title={t("addPart")} variant="secondary" onPress={() => setParts([...parts, { name: "", quantity: "1" }])} />

              <Field label={`${t("recommendations")} · ${t("onePerLine")}`} value={recText} multiline onChangeText={setRecText} />
              <View style={[ui.row, { justifyContent: "space-between" }]}>
                <Text style={styles.switchLabel}>{t("followUp")}</Text>
                <Switch value={content.followUpRequired} onValueChange={(v) => setContent({ ...content, followUpRequired: v })} />
              </View>
            </Card>

            <Card title={t("photosSection")}>
              <PhotoPicker
                photos={photos}
                onChange={setPhotos}
                labels={{
                  camera: t("takePhoto"),
                  gallery: t("pickPhoto"),
                  max: t("maxPhotos", { n: 6 }),
                  cameraDenied: t("cameraDenied"),
                }}
              />
            </Card>

            <Card title={t("signatureSection")}>
              <SignaturePad value={signature} onChange={setSignature} onDrawing={(d) => setScrollEnabled(!d)} placeholder={t("signHere")} />
              <Button title={t("clearSignature")} variant="secondary" onPress={() => setSignature(null)} />
              <Field label={t("signerName")} value={signerName} onChangeText={setSignerName} />
            </Card>

            <Button title={t("savePdf")} onPress={saveAndShare} loading={saving} />
            {existing ? <Button title={t("delete")} variant="danger" onPress={confirmDelete} /> : null}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  x: { fontSize: 18, color: colors.danger, paddingHorizontal: 6 },
  switchLabel: { fontSize: 16, color: colors.text, flex: 1 },
});
