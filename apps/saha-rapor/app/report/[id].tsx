import { Redirect, useLocalSearchParams } from "expo-router";

import { ReportEditor } from "../../src/components/ReportEditor";
import { useApp } from "../../src/lib/AppContext";

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports } = useApp();
  const report = reports.find((r) => r.id === id);
  if (!report) return <Redirect href="/" />;
  // key: a new editor state when the user opens another report
  return <ReportEditor key={report.id} existing={report} />;
}
