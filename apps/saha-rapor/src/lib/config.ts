import Constants from "expo-constants";

type Extra = {
  aiEndpoint?: string;
  appKey?: string;
  revenueCatIosKey?: string;
  revenueCatAndroidKey?: string;
  entitlementId?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/** Values from app.json → expo.extra. Empty values switch the related feature off. */
export const config = {
  aiEndpoint: extra.aiEndpoint ?? "",
  appKey: extra.appKey ?? "",
  revenueCatIosKey: extra.revenueCatIosKey ?? "",
  revenueCatAndroidKey: extra.revenueCatAndroidKey ?? "",
  entitlementId: extra.entitlementId || "pro",
  privacyUrl: extra.privacyUrl ?? "",
  termsUrl: extra.termsUrl ?? "",
  version: Constants.expoConfig?.version ?? "1.0.0",
};
