/**
 * Subscriptions through RevenueCat (App Store + Google Play).
 * When no RevenueCat key is set (local development), purchases are off.
 */
import { Platform } from "react-native";
import Purchases, { type PurchasesPackage } from "react-native-purchases";

import { config } from "./config";

let configured = false;

function apiKey(): string {
  if (Platform.OS === "ios") return config.revenueCatIosKey;
  if (Platform.OS === "android") return config.revenueCatAndroidKey;
  return "";
}

export function purchasesEnabled(): boolean {
  return apiKey().length > 0;
}

export function initPurchases(): void {
  if (configured || !purchasesEnabled()) return;
  Purchases.configure({ apiKey: apiKey() });
  configured = true;
}

/** Stable anonymous user id. The AI service uses it for usage limits. */
export async function getAppUserId(fallback: string): Promise<string> {
  if (!configured) return fallback;
  try {
    return await Purchases.getAppUserID();
  } catch {
    return fallback;
  }
}

export async function isProActive(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[config.entitlementId] !== undefined;
  } catch {
    return false;
  }
}

export async function getPackages(): Promise<PurchasesPackage[]> {
  if (!configured) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export type BuyResult = "purchased" | "cancelled" | "failed";

export async function buy(pkg: PurchasesPackage): Promise<BuyResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[config.entitlementId] ? "purchased" : "failed";
  } catch (e) {
    return (e as { userCancelled?: boolean | null }).userCancelled ? "cancelled" : "failed";
  }
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[config.entitlementId] !== undefined;
  } catch {
    return false;
  }
}
