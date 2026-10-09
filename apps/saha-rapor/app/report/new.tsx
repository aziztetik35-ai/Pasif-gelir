import { Redirect } from "expo-router";
import { useState } from "react";

import { ReportEditor } from "../../src/components/ReportEditor";
import { useApp } from "../../src/lib/AppContext";

export default function NewReport() {
  const { canCreateReport } = useApp();
  // Check the limit only when the screen opens. Saving this report must not close the screen.
  const [allowed] = useState(canCreateReport);
  if (!allowed) return <Redirect href="/paywall" />;
  return <ReportEditor />;
}
