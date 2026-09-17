"use client";

import { useSyncExternalStore, useEffect } from "react";
import type {
  Customer,
  CustomerInput,
  CustomerWithStats,
  CustomerStatus,
} from "@/types/customer";
import type { CompletedOrder } from "@/types/pos";
import { getOrders } from "@/lib/orders";

const STORAGE_KEY = "brewpos_customers_v1";
const CUSTOMERS_EVENT = "brewpos:customers-updated";

let customersSnapshot: Customer[] = [];
let isCustomersHydrated = false;
let lastSavedCustomersRaw: string | null = null;
const customerSubscribers = new Set<() => void>();

function notifyCustomersSubscribers() {
  for (const cb of customerSubscribers) {
    cb();
  }
}

export const initialCustomers: Customer[] = [
  {
    id: "CUST-0001",
    name: "Mohammed Omar",
    phone: "+880 1711-000001",
    email: "omar@example.com",
    address: "Dhanmondi, Dhaka",
    notes: "Regular customer, prefers oat milk latte",
    status: "Active",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "CUST-0002",
    name: "Sadid Ahmed",
    phone: "+880 1812-000002",
    email: "sadid@example.com",
    address: "Gulshan 2, Dhaka",
    notes: "Double espresso in the morning",
    status: "Active",
    createdAt: "2026-08-15T11:30:00.000Z",
    updatedAt: "2026-08-15T11:30:00.000Z",
  },
  {
    id: "CUST-0003",
    name: "Nusrat Jahan",
    phone: "+880 1913-000003",
    email: "nusrat@example.com",
    address: "Uttara Sector 4, Dhaka",
    notes: "VIP Member, enjoys iced caramel macchiato",
    status: "Active",
    createdAt: "2026-08-20T14:15:00.000Z",
    updatedAt: "2026-08-20T14:15:00.000Z",
  },
  {
    id: "CUST-0004",
    name: "Shihab Hossain",
    phone: "+880 1614-000004",
    email: "shihab@example.com",
    address: "Banani, Dhaka",
    notes: "Cold brew fan",
    status: "Active",
    createdAt: "2026-08-25T09:45:00.000Z",
    updatedAt: "2026-08-25T09:45:00.000Z",
  },
  {
    id: "CUST-0005",
    name: "Tamim Mahdi",
    phone: "+880 1515-000005",
    email: "tamim@example.com",
    address: "Mirpur 10, Dhaka",
    notes: "Bakery and cappuccino enthusiast",
    status: "Active",
    createdAt: "2026-09-01T16:20:00.000Z",
    updatedAt: "2026-09-01T16:20:00.000Z",
  },
];

/**
 * Hydrate customers from localStorage safely without SSR mismatch.
 */
export function hydrateCustomers(): void {
  if (typeof window === "undefined" || isCustomersHydrated) return;
  isCustomersHydrated = true;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      lastSavedCustomersRaw = null;
      customersSnapshot = initialCustomers;
      return;
    }
    lastSavedCustomersRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      customersSnapshot = parsed;
      notifyCustomersSubscribers();
    }
  } catch (error) {
    console.warn("Failed to read customers from localStorage, falling back to initial data:", error);
    customersSnapshot = initialCustomers;
  }
}

/**
 * Safely retrieve all customers from snapshot (hydrating if called in client).
 */
export function getCustomers(): Customer[] {
  if (typeof window !== "undefined" && !isCustomersHydrated) {
    hydrateCustomers();
  }
  return customersSnapshot.length > 0 ? customersSnapshot : initialCustomers;
}

/**
 * Persist customers array, update snapshot, and broadcast change.
 */
export function saveCustomers(customers: Customer[]): void {
  customersSnapshot = customers;
  isCustomersHydrated = true;
  if (typeof window === "undefined") return;

  try {
    const raw = JSON.stringify(customers);
    lastSavedCustomersRaw = raw;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new CustomEvent(CUSTOMERS_EVENT));
    notifyCustomersSubscribers();
  } catch (error) {
    console.error("Failed to save customers to localStorage:", error);
  }
}

/**
 * Retrieve a customer by their unique ID.
 */
export function getCustomerById(id: string): Customer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.id === id);
}

/**
 * Generate next sequential Customer ID (e.g. CUST-0006).
 */
export function getNextCustomerId(): string {
  const customers = getCustomers();
  let maxSeq = 0;

  for (const c of customers) {
    if (c.id && c.id.startsWith("CUST-")) {
      const numPart = parseInt(c.id.replace("CUST-", ""), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  return `CUST-${String(maxSeq + 1).padStart(4, "0")}`;
}

/**
 * Check if a customer with the same phone or email already exists.
 */
export function isDuplicateCustomer(
  phone: string,
  email?: string,
  excludeId?: string
): { isDuplicate: boolean; field?: "phone" | "email" } {
  const customers = getCustomers();
  const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, "");
  const normalizedEmail = email?.trim().toLowerCase();

  for (const c of customers) {
    if (c.id === excludeId) continue;

    const existingPhone = c.phone.trim().replace(/[\s\-\(\)]/g, "");
    if (existingPhone && existingPhone === normalizedPhone) {
      return { isDuplicate: true, field: "phone" };
    }

    if (
      normalizedEmail &&
      c.email &&
      c.email.trim().toLowerCase() === normalizedEmail
    ) {
      return { isDuplicate: true, field: "email" };
    }
  }

  return { isDuplicate: false };
}

/**
 * Add a new customer to the store.
 */
export function addCustomer(data: CustomerInput): Customer {
  const current = getCustomers();
  const now = new Date().toISOString();

  const newCustomer: Customer = {
    id: data.id || getNextCustomerId(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    status: data.status || "Active",
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newCustomer, ...current];
  saveCustomers(updated);
  return newCustomer;
}

/**
 * Update an existing customer by ID.
 */
export function updateCustomer(
  id: string,
  updates: Partial<CustomerInput>
): boolean {
  const current = getCustomers();
  let found = false;

  const updated = current.map((c) => {
    if (c.id === id) {
      found = true;
      return {
        ...c,
        ...updates,
        name: updates.name ? updates.name.trim() : c.name,
        phone: updates.phone ? updates.phone.trim() : c.phone,
        email: updates.email !== undefined ? (updates.email.trim() || undefined) : c.email,
        address: updates.address !== undefined ? (updates.address.trim() || undefined) : c.address,
        notes: updates.notes !== undefined ? (updates.notes.trim() || undefined) : c.notes,
        status: updates.status || c.status,
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });

  if (found) {
    saveCustomers(updated);
  }
  return found;
}

/**
 * Toggle customer active/inactive status.
 */
export function toggleCustomerStatus(id: string): boolean {
  const current = getCustomers();
  let found = false;

  const updated = current.map((c) => {
    if (c.id === id) {
      found = true;
      const nextStatus: CustomerStatus =
        c.status === "Active" ? "Inactive" : "Active";
      return {
        ...c,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });

  if (found) {
    saveCustomers(updated);
  }
  return found;
}

/**
 * Delete a customer by ID.
 * BLOCKS deletion if customer has historical orders.
 */
export function deleteCustomer(id: string): {
  success: boolean;
  reason?: string;
} {
  const current = getCustomers();
  const customer = current.find((c) => c.id === id);

  if (!customer) {
    return { success: false, reason: "Customer not found." };
  }

  // Check if customer has orders
  const allOrders = getOrders();
  const customerOrders = allOrders.filter(
    (o) =>
      o.customerId === id ||
      (!o.customerId && o.customer.toLowerCase() === customer.name.toLowerCase())
  );

  if (customerOrders.length > 0) {
    return {
      success: false,
      reason: `This customer has existing order history (${customerOrders.length} ${
        customerOrders.length === 1 ? "order" : "orders"
      }). Deactivate the customer instead.`,
    };
  }

  const filtered = current.filter((c) => c.id !== id);
  saveCustomers(filtered);
  return { success: true };
}

/**
 * Compute derived customer metrics from authoritative orders.
 */
export function calculateCustomerMetrics(
  customer: Customer,
  orders: CompletedOrder[]
): CustomerWithStats {
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === customer.id ||
      (!o.customerId && o.customer.toLowerCase() === customer.name.toLowerCase())
  );

  const totalOrders = customerOrders.length;

  // Total spent on non-cancelled orders
  const totalSpent = customerOrders
    .filter((o) => o.status !== "Cancelled" && o.status !== "Refunded")
    .reduce((sum, o) => sum + o.total, 0);

  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Last order timestamp
  const sortedOrders = [...customerOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const lastOrderAt = sortedOrders.length > 0 ? sortedOrders[0].createdAt : undefined;

  return {
    ...customer,
    totalOrders,
    totalSpent,
    averageOrderValue,
    lastOrderAt,
  };
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for real-time reactivity
// ----------------------------------------------------------------------

function subscribeCustomers(callback: () => void) {
  customerSubscribers.add(callback);
  if (typeof window !== "undefined") {
    const handleSync = (e?: StorageEvent | Event) => {
      if (e && "key" in e && e.key !== STORAGE_KEY) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        if (raw !== lastSavedCustomersRaw) {
          lastSavedCustomersRaw = raw;
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            customersSnapshot = parsed;
            notifyCustomersSubscribers();
          }
        }
      } catch (err) {
        console.warn("Failed to sync customers from storage:", err);
      }
    };

    window.addEventListener(CUSTOMERS_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    queueMicrotask(() => {
      hydrateCustomers();
    });

    return () => {
      customerSubscribers.delete(callback);
      window.removeEventListener(CUSTOMERS_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }

  return () => {
    customerSubscribers.delete(callback);
  };
}

function getCustomersSnapshot(): Customer[] {
  return customersSnapshot.length > 0 ? customersSnapshot : initialCustomers;
}

function getCustomersServerSnapshot(): Customer[] {
  return initialCustomers;
}

export function useCustomersStore() {
  const customers = useSyncExternalStore(
    subscribeCustomers,
    getCustomersSnapshot,
    getCustomersServerSnapshot
  );

  useEffect(() => {
    hydrateCustomers();
  }, []);

  return {
    customers,
    isLoaded: isCustomersHydrated,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getCustomerById,
  };
}
