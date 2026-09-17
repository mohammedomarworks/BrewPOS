"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { CompletedOrder, OrderStatus } from "@/types/pos";

const STORAGE_KEY = "brewpos_orders_v1";
const ORDERS_EVENT = "brewpos:orders-updated";

// ----------------------------------------------------------------------
// In-memory Cached Snapshot & Subscriptions for useSyncExternalStore
// ----------------------------------------------------------------------

const initialOrders: CompletedOrder[] = [];
let ordersSnapshot: CompletedOrder[] = initialOrders;
let isOrdersHydrated = false;
let lastSavedOrdersRaw: string | null = null;
const orderSubscribers = new Set<() => void>();
let hasAddedOrderWindowListeners = false;

function notifyOrdersSubscribers(): void {
  orderSubscribers.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in order subscriber callback:", err);
    }
  });
}

/**
 * Explicit client hydration from localStorage.
 * Runs AFTER server render / client hydration to prevent SSR mismatch.
 */
export function hydrateOrders(): void {
  if (typeof window === "undefined" || isOrdersHydrated) return;
  isOrdersHydrated = true;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      lastSavedOrdersRaw = null;
      ordersSnapshot = initialOrders;
      return;
    }
    lastSavedOrdersRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      ordersSnapshot = parsed;
      notifyOrdersSubscribers();
    }
  } catch (error) {
    console.error("Failed to read orders from localStorage:", error);
    ordersSnapshot = initialOrders;
  }
}

function handleOrdersSyncEvent(e?: StorageEvent | Event): void {
  if (typeof window === "undefined") return;
  if (e && "key" in e && e.key !== STORAGE_KEY) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    if (raw !== lastSavedOrdersRaw) {
      lastSavedOrdersRaw = raw;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ordersSnapshot = parsed;
        notifyOrdersSubscribers();
      }
    }
  } catch (err) {
    console.error("Failed to sync orders from storage:", err);
  }
}

function ensureOrderWindowListeners(): void {
  if (typeof window === "undefined" || hasAddedOrderWindowListeners) return;
  window.addEventListener(ORDERS_EVENT, handleOrdersSyncEvent);
  window.addEventListener("storage", handleOrdersSyncEvent);
  hasAddedOrderWindowListeners = true;
}

/**
 * Safely retrieve all orders from the in-memory snapshot.
 */
export function getOrders(): CompletedOrder[] {
  if (typeof window !== "undefined" && !isOrdersHydrated) {
    hydrateOrders();
  }
  return ordersSnapshot;
}

/**
 * Save orders list to localStorage, update in-memory snapshot, and notify all listeners.
 */
function saveOrders(orders: CompletedOrder[]): void {
  ordersSnapshot = orders;
  isOrdersHydrated = true;

  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(orders);
      lastSavedOrdersRaw = raw;
      localStorage.setItem(STORAGE_KEY, raw);
      window.dispatchEvent(new CustomEvent(ORDERS_EVENT));
    } catch (error) {
      console.error("Failed to save orders to localStorage:", error);
    }
  }

  notifyOrdersSubscribers();
}

/**
 * Add a new completed order to the top of the orders list.
 */
export function addOrder(order: CompletedOrder): void {
  const current = getOrders();
  // Prevent duplicate orderNumber if already exists
  const filtered = current.filter((o) => o.orderNumber !== order.orderNumber);
  const updated = [order, ...filtered];
  saveOrders(updated);
}

/**
 * Retrieve an order by its unique orderNumber.
 */
export function getOrderByNumber(orderNumber: string): CompletedOrder | undefined {
  const orders = getOrders();
  return orders.find((o) => o.orderNumber === orderNumber);
}

/**
 * Update the status of an existing order.
 */
export function updateOrderStatus(orderNumber: string, status: OrderStatus): boolean {
  const orders = getOrders();
  let found = false;

  const updated = orders.map((order) => {
    if (order.orderNumber === orderNumber) {
      found = true;
      return { ...order, status };
    }
    return order;
  });

  if (found) {
    saveOrders(updated);
  }

  return found;
}

/**
 * Clear all stored orders (useful for testing/resetting).
 */
export function clearOrders(): void {
  ordersSnapshot = initialOrders;
  lastSavedOrdersRaw = null;

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(ORDERS_EVENT));
    } catch (error) {
      console.error("Failed to clear orders:", error);
    }
  }

  notifyOrdersSubscribers();
}

/**
 * Generate the next sequential order number based on stored orders.
 * e.g., if highest order is COF-2026-00003, returns COF-2026-00004.
 */
export function getNextOrderNumber(): string {
  const orders = getOrders();
  const currentYear = new Date().getFullYear();
  const prefix = `COF-${currentYear}-`;

  let maxSequence = 0;
  for (const order of orders) {
    if (order.orderNumber && order.orderNumber.startsWith("COF-")) {
      const parts = order.orderNumber.split("-");
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    }
  }

  const nextSeq = maxSequence + 1;
  return `${prefix}${String(nextSeq).padStart(5, "0")}`;
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for real-time reactivity
// ----------------------------------------------------------------------

export function subscribeOrders(callback: () => void): () => void {
  orderSubscribers.add(callback);
  ensureOrderWindowListeners();
  queueMicrotask(() => {
    hydrateOrders();
  });

  return () => {
    orderSubscribers.delete(callback);
  };
}

export function getOrdersSnapshot(): CompletedOrder[] {
  return ordersSnapshot;
}

export function getOrdersServerSnapshot(): CompletedOrder[] {
  return initialOrders;
}

/**
 * React hook to subscribe to the order store reactively.
 * Guarantees zero SSR hydration mismatch by rendering initialOrders first,
 * then hydrating from localStorage after mount.
 */
export function useOrdersStore() {
  const orders = useSyncExternalStore(
    subscribeOrders,
    getOrdersSnapshot,
    getOrdersServerSnapshot
  );

  useEffect(() => {
    hydrateOrders();
  }, []);

  return {
    orders,
    isLoaded: isOrdersHydrated,
    addOrder,
    updateOrderStatus,
    clearOrders,
  };
}
