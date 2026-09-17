"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { Settings } from "@/types/settings";

const SETTINGS_STORAGE_KEY = "brewpos_settings_v1";
const SETTINGS_EVENT = "brewpos:settings-updated";

export const defaultSettings: Settings = {
  business: {
    name: "BrewPOS Coffee Shop",
    tagline: "Premium Artisanal Coffee",
    address: "Dhanmondi, Dhaka",
    phone: "+880 1711-000000",
    email: "info@brewpos.com",
    website: "https://brewpos.com",
    vatNumber: "BIN-9876543210",
    logoUrl: "",
  },
  taxCurrency: {
    currencyCode: "BDT",
    currencySymbol: "৳",
    vatRate: 15, // 15% statutory rate
  },
  pos: {
    defaultOrderType: "Dine In",
    enableDineIn: true,
    enableTakeAway: true,
    enableDelivery: true,
    allowWalkIn: true,
    enableQuickTender: true,
    showProductImages: true,
    requireCustomerForDelivery: true,
    autoOpenReceipt: true,
  },
  payments: {
    enableCash: true,
    enableCard: true,
    enableMobile: true,
    mobileProviders: ["bKash", "Nagad", "Rocket", "Upay"],
  },
  receipt: {
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showVatNumber: true,
    showCashier: true,
    showCustomer: true,
    showOrderType: true,
    showPaymentMethod: true,
    footerMessage: "Thank you for choosing BrewPOS!",
  },
  orders: {
    orderPrefix: "COF",
    allowCancellation: true,
    allowRefunds: true,
    defaultOrderStatus: "Completed",
  },
  notifications: {
    lowStockAlerts: true,
    soundAlerts: false,
    emailReceipts: false,
  },
  updatedAt: "2026-09-01T08:00:00.000Z",
};

// ----------------------------------------------------------------------
// In-Memory Cached Snapshot & Hydration Safety
// ----------------------------------------------------------------------

let settingsSnapshot: Settings = defaultSettings;
let isSettingsHydrated = false;
let lastSavedSettingsRaw: string | null = null;
const settingsSubscribers = new Set<() => void>();
let hasAddedSettingsWindowListeners = false;

function notifySettingsSubscribers(): void {
  settingsSubscribers.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in settings subscriber callback:", err);
    }
  });
}

export function hydrateSettings(): void {
  if (typeof window === "undefined" || isSettingsHydrated) return;
  isSettingsHydrated = true;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      lastSavedSettingsRaw = null;
      settingsSnapshot = defaultSettings;
      return;
    }
    lastSavedSettingsRaw = raw;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      // Deep merge with defaults to preserve new keys added in future
      settingsSnapshot = {
        ...defaultSettings,
        ...parsed,
        business: { ...defaultSettings.business, ...parsed.business },
        taxCurrency: { ...defaultSettings.taxCurrency, ...parsed.taxCurrency },
        pos: { ...defaultSettings.pos, ...parsed.pos },
        payments: {
          ...defaultSettings.payments,
          ...parsed.payments,
          mobileProviders:
            parsed.payments?.mobileProviders ||
            defaultSettings.payments.mobileProviders,
        },
        receipt: { ...defaultSettings.receipt, ...parsed.receipt },
        orders: { ...defaultSettings.orders, ...parsed.orders },
        notifications: {
          ...defaultSettings.notifications,
          ...parsed.notifications,
        },
      };
      notifySettingsSubscribers();
    }
  } catch (error) {
    console.error("Failed to read settings from localStorage:", error);
    settingsSnapshot = defaultSettings;
  }
}

function handleSettingsSyncEvent(e?: StorageEvent | Event): void {
  if (typeof window === "undefined") return;
  if (e && "key" in e && e.key !== SETTINGS_STORAGE_KEY) return;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return;

    if (raw !== lastSavedSettingsRaw) {
      lastSavedSettingsRaw = raw;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        settingsSnapshot = {
          ...defaultSettings,
          ...parsed,
          business: { ...defaultSettings.business, ...parsed.business },
          taxCurrency: { ...defaultSettings.taxCurrency, ...parsed.taxCurrency },
          pos: { ...defaultSettings.pos, ...parsed.pos },
          payments: {
            ...defaultSettings.payments,
            ...parsed.payments,
            mobileProviders:
              parsed.payments?.mobileProviders ||
              defaultSettings.payments.mobileProviders,
          },
          receipt: { ...defaultSettings.receipt, ...parsed.receipt },
          orders: { ...defaultSettings.orders, ...parsed.orders },
          notifications: {
            ...defaultSettings.notifications,
            ...parsed.notifications,
          },
        };
        notifySettingsSubscribers();
      }
    }
  } catch (err) {
    console.error("Failed to sync settings from storage:", err);
  }
}

function ensureSettingsWindowListeners(): void {
  if (typeof window === "undefined" || hasAddedSettingsWindowListeners) return;
  window.addEventListener(SETTINGS_EVENT, handleSettingsSyncEvent);
  window.addEventListener("storage", handleSettingsSyncEvent);
  hasAddedSettingsWindowListeners = true;
}

/**
 * Get current settings snapshot.
 */
export function getSettings(): Settings {
  if (typeof window !== "undefined" && !isSettingsHydrated) {
    hydrateSettings();
  }
  return settingsSnapshot;
}

/**
 * Persist updated settings to localStorage and notify subscribers.
 */
export function saveSettings(settings: Settings): void {
  settingsSnapshot = settings;
  isSettingsHydrated = true;

  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(settings);
      lastSavedSettingsRaw = raw;
      localStorage.setItem(SETTINGS_STORAGE_KEY, raw);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }

  notifySettingsSubscribers();
}

/**
 * Partial updater for settings.
 */
export function updateSettings(updates: Partial<Settings>): Settings {
  const current = getSettings();
  const next: Settings = {
    ...current,
    ...updates,
    business: updates.business
      ? { ...current.business, ...updates.business }
      : current.business,
    taxCurrency: updates.taxCurrency
      ? { ...current.taxCurrency, ...updates.taxCurrency }
      : current.taxCurrency,
    pos: updates.pos ? { ...current.pos, ...updates.pos } : current.pos,
    payments: updates.payments
      ? { ...current.payments, ...updates.payments }
      : current.payments,
    receipt: updates.receipt
      ? { ...current.receipt, ...updates.receipt }
      : current.receipt,
    orders: updates.orders
      ? { ...current.orders, ...updates.orders }
      : current.orders,
    notifications: updates.notifications
      ? { ...current.notifications, ...updates.notifications }
      : current.notifications,
    updatedAt: new Date().toISOString(),
  };

  saveSettings(next);
  return next;
}

/**
 * Reset settings to factory defaults without affecting transactions, customers, or inventory.
 */
export function resetSettingsToDefaults(): Settings {
  const reset = {
    ...defaultSettings,
    updatedAt: new Date().toISOString(),
  };
  saveSettings(reset);
  return reset;
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for Settings
// ----------------------------------------------------------------------

export function subscribeSettings(callback: () => void): () => void {
  settingsSubscribers.add(callback);
  ensureSettingsWindowListeners();
  queueMicrotask(() => {
    hydrateSettings();
  });

  return () => {
    settingsSubscribers.delete(callback);
  };
}

export function getSettingsSnapshot(): Settings {
  return settingsSnapshot;
}

export function getSettingsServerSnapshot(): Settings {
  return defaultSettings;
}

export function useSettingsStore() {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot
  );

  useEffect(() => {
    hydrateSettings();
  }, []);

  return {
    settings,
    isLoaded: isSettingsHydrated,
    updateSettings,
    resetSettingsToDefaults,
  };
}

// ----------------------------------------------------------------------
// Shared Currency Formatting Helpers Reading from Settings
// ----------------------------------------------------------------------

/**
 * Dynamic currency formatter reading current settings or using optional symbol override.
 */
export function formatCurrency(
  amount: number,
  symbolOverride?: string
): string {
  const current = getSettings();
  const symbol = symbolOverride ?? current.taxCurrency.currencySymbol ?? "৳";
  const rounded = Math.round(amount * 100) / 100;

  return `${symbol}${rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get the current active currency symbol.
 */
export function getCurrencySymbol(): string {
  return getSettings().taxCurrency.currencySymbol || "৳";
}

/**
 * Get current configured VAT rate (default: 15).
 */
export function getCurrentVatRate(): number {
  return getSettings().taxCurrency.vatRate ?? 15;
}
