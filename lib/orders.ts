"use client";

import { useSyncExternalStore } from "react";
import type { CompletedOrder, OrderStatus } from "@/types/pos";

const STORAGE_KEY = "brewpos_orders_v1";
const ORDERS_EVENT = "brewpos:orders-updated";

/**
 * Safely retrieve all orders from localStorage.
 */
export function getOrders(): CompletedOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error("Failed to read orders from localStorage:", error);
    return [];
  }
}

/**
 * Save orders list to localStorage and notify all listeners.
 */
function saveOrders(orders: CompletedOrder[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(ORDERS_EVENT));
  } catch (error) {
    console.error("Failed to save orders to localStorage:", error);
  }
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
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(ORDERS_EVENT));
  } catch (error) {
    console.error("Failed to clear orders:", error);
  }
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

// Memory cache for useSyncExternalStore reference stability
let cachedOrders: CompletedOrder[] = [];
let cachedRaw: string | null = null;

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(ORDERS_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(ORDERS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): CompletedOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedOrders = raw ? JSON.parse(raw) : [];
    }
    return cachedOrders;
  } catch {
    return cachedOrders;
  }
}

const emptySnapshot: CompletedOrder[] = [];
function getServerSnapshot(): CompletedOrder[] {
  return emptySnapshot;
}

/**
 * React hook to subscribe to the order store reactively.
 * Handles client-side hydration and live cross-tab/cross-component updates via useSyncExternalStore.
 */
export function useOrdersStore() {
  const orders = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    orders,
    isLoaded: true,
    addOrder,
    updateOrderStatus,
    clearOrders,
  };
}
