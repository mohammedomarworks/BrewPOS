"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { AuditLogEntry, AuditLogInput } from "@/types/audit";

const AUDIT_STORAGE_KEY = "brewpos_audit_log_v1";
const AUDIT_EVENT = "brewpos:audit-updated";

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "AUD-00004",
    timestamp: "2026-09-16T15:20:00.000Z",
    actor: "Manager (Sadid Ahmed)",
    action: "Stock Received",
    target: "Ingredient: Coffee Beans",
    details: "Received 5000g from BeanCraft Roasters (PO-2026-042)",
  },
  {
    id: "AUD-00003",
    timestamp: "2026-09-15T11:00:00.000Z",
    actor: "Admin (Mohammed Omar)",
    action: "Promotion Created",
    target: "Discount: SUMMER10",
    details: "Created 10% seasonal discount for coffee menu",
  },
  {
    id: "AUD-00002",
    timestamp: "2026-09-10T09:30:00.000Z",
    actor: "Admin (Mohammed Omar)",
    action: "VAT Rate Verified",
    target: "Tax & Currency",
    details: "Confirmed standard 15% VAT rate for Bangladesh statutory compliance",
  },
  {
    id: "AUD-00001",
    timestamp: "2026-09-01T08:00:00.000Z",
    actor: "Admin (Mohammed Omar)",
    action: "System Initialized",
    target: "BrewPOS Core",
    details: "Initial setup of coffee shop POS, menu categories, and registers",
  },
];

let auditSnapshot: AuditLogEntry[] = initialAuditLogs;
let isAuditHydrated = false;
let lastSavedAuditRaw: string | null = null;
const auditSubscribers = new Set<() => void>();
let hasAddedAuditWindowListeners = false;

function notifyAuditSubscribers(): void {
  auditSubscribers.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in audit subscriber callback:", err);
    }
  });
}

export function hydrateAuditLogs(): void {
  if (typeof window === "undefined" || isAuditHydrated) return;
  isAuditHydrated = true;

  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      lastSavedAuditRaw = null;
      auditSnapshot = initialAuditLogs;
      return;
    }
    lastSavedAuditRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      auditSnapshot = parsed;
      notifyAuditSubscribers();
    }
  } catch (error) {
    console.error("Failed to read audit logs from localStorage:", error);
    auditSnapshot = initialAuditLogs;
  }
}

function handleAuditSyncEvent(e?: StorageEvent | Event): void {
  if (typeof window === "undefined") return;
  if (e && "key" in e && e.key !== AUDIT_STORAGE_KEY) return;

  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw && raw !== lastSavedAuditRaw) {
      lastSavedAuditRaw = raw;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        auditSnapshot = parsed;
        notifyAuditSubscribers();
      }
    }
  } catch (err) {
    console.error("Failed to sync audit logs from storage:", err);
  }
}

function ensureAuditWindowListeners(): void {
  if (typeof window === "undefined" || hasAddedAuditWindowListeners) return;
  window.addEventListener(AUDIT_EVENT, handleAuditSyncEvent);
  window.addEventListener("storage", handleAuditSyncEvent);
  hasAddedAuditWindowListeners = true;
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window !== "undefined" && !isAuditHydrated) {
    hydrateAuditLogs();
  }
  return auditSnapshot;
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  auditSnapshot = logs;
  isAuditHydrated = true;

  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(logs);
      lastSavedAuditRaw = raw;
      localStorage.setItem(AUDIT_STORAGE_KEY, raw);
      window.dispatchEvent(new CustomEvent(AUDIT_EVENT));
    } catch (error) {
      console.error("Failed to save audit logs to localStorage:", error);
    }
  }

  notifyAuditSubscribers();
}

export function addAuditLog(data: AuditLogInput): AuditLogEntry {
  const current = getAuditLogs();
  const nextSeq = current.length + 1;
  const id = `AUD-${String(nextSeq).padStart(5, "0")}`;

  const entry: AuditLogEntry = {
    id,
    timestamp: data.timestamp || new Date().toISOString(),
    actor: data.actor,
    action: data.action,
    target: data.target,
    details: data.details,
  };

  const updated = [entry, ...current];
  saveAuditLogs(updated);
  return entry;
}

export function clearAuditLogs(): void {
  saveAuditLogs([]);
}

export function subscribeAudit(callback: () => void): () => void {
  auditSubscribers.add(callback);
  ensureAuditWindowListeners();
  queueMicrotask(() => {
    hydrateAuditLogs();
  });

  return () => {
    auditSubscribers.delete(callback);
  };
}

export function getAuditSnapshot(): AuditLogEntry[] {
  return auditSnapshot;
}

export function getAuditServerSnapshot(): AuditLogEntry[] {
  return initialAuditLogs;
}

export function useAuditStore() {
  const logs = useSyncExternalStore(
    subscribeAudit,
    getAuditSnapshot,
    getAuditServerSnapshot
  );

  useEffect(() => {
    hydrateAuditLogs();
  }, []);

  return {
    logs,
    isLoaded: isAuditHydrated,
    addAuditLog,
    clearAuditLogs,
  };
}
