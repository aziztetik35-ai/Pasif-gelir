import { describe, expect, it } from "vitest";

import appJson from "../app.json";

const app = appJson.expo;

function pluginOptions(name: string): Record<string, unknown> | undefined {
  const entry = (app.plugins as unknown[]).find((p) => Array.isArray(p) && p[0] === name) as [string, Record<string, unknown>] | undefined;
  return entry?.[1];
}

describe("app.json", () => {
  it("keeps the microphone permission for dictation", () => {
    // expo-image-picker with microphonePermission: false removes RECORD_AUDIO (Android)
    // and the microphone text (iOS). Dictation then fails on the phone.
    expect(pluginOptions("expo-image-picker")?.microphonePermission).not.toBe(false);
    expect(pluginOptions("expo-speech-recognition")?.microphonePermission).toBeTruthy();
  });

  it("is linked to the EAS project", () => {
    expect(app.extra.eas.projectId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
