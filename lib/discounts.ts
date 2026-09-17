"use client";

import { useSyncExternalStore, useEffect } from "react";
import type {
  Discount,
  DiscountInput,
  DiscountStatus,
  DiscountCalculationResult,
  DiscountValidationParams,
} from "@/types/discount";
import type { CartItem, CompletedOrder } from "@/types/pos";
import { getCurrencySymbol } from "@/lib/settings-store";

const DISCOUNTS_STORAGE_KEY = "brewpos_discounts_v1";
const DISCOUNTS_EVENT = "brewpos:discounts-updated";

export const initialDiscounts: Discount[] = [
  {
    id: "DISC-001",
    code: "SUMMER10",
    name: "Summer Coffee Special",
    description: "10% off entire order for our summer coffee celebration.",
    type: "Percentage",
    value: 10,
    appliesTo: "Entire Order",
    customerEligibility: "Everyone",
    usageLimit: 100,
    usageCount: 14,
    active: true,
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "DISC-002",
    code: "WELCOME20",
    name: "New Member Welcome",
    description: "20% off for registered members on orders above ৳300 (Max ৳150 off).",
    type: "Percentage",
    value: 20,
    appliesTo: "Entire Order",
    minimumOrderAmount: 300,
    maximumDiscountAmount: 150,
    customerEligibility: "Registered Customers",
    usageLimit: 50,
    usageCount: 8,
    active: true,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "DISC-003",
    code: "BAKERY15",
    name: "Artisan Bakery Treat",
    description: "15% off all freshly baked croissants, muffins, and pastries.",
    type: "Percentage",
    value: 15,
    appliesTo: "Specific Categories",
    categoryIds: ["Bakery", "Desserts"],
    customerEligibility: "Everyone",
    usageCount: 22,
    active: true,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "DISC-004",
    code: "CAPPU25",
    name: "Cappuccino Craze",
    description: "25% off our award-winning signature Cappuccino.",
    type: "Percentage",
    value: 25,
    appliesTo: "Specific Products",
    productIds: [1], // Product 1: Cappuccino
    customerEligibility: "Everyone",
    usageCount: 19,
    active: true,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "DISC-005",
    code: "FLAT50",
    name: "Big Order Voucher",
    description: "Flat ৳50 discount on orders over ৳400.",
    type: "Fixed Amount",
    value: 50,
    appliesTo: "Entire Order",
    minimumOrderAmount: 400,
    customerEligibility: "Everyone",
    usageCount: 31,
    active: true,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "DISC-006",
    code: "WINTER2025",
    name: "Winter Warmup 2025",
    description: "Winter holiday seasonal discount (expired).",
    type: "Percentage",
    value: 15,
    appliesTo: "Entire Order",
    customerEligibility: "Everyone",
    usageCount: 87,
    active: true,
    startAt: "2025-11-01T00:00:00.000Z",
    endAt: "2026-02-28T23:59:59.000Z",
    createdAt: "2025-11-01T08:00:00.000Z",
    updatedAt: "2026-02-28T23:59:59.000Z",
  },
  {
    id: "DISC-007",
    code: "AUTUMN2026",
    name: "Fall Festival 2026",
    description: "Upcoming autumn festival discount.",
    type: "Percentage",
    value: 10,
    appliesTo: "Entire Order",
    customerEligibility: "Everyone",
    usageCount: 0,
    active: true,
    startAt: "2026-10-01T00:00:00.000Z",
    endAt: "2026-10-31T23:59:59.000Z",
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
];

// ----------------------------------------------------------------------
// In-memory Cached Snapshot & Subscriptions for useSyncExternalStore
// ----------------------------------------------------------------------

let discountsSnapshot: Discount[] = initialDiscounts;
let isDiscountsHydrated = false;
let lastSavedDiscountsRaw: string | null = null;
const discountSubscribers = new Set<() => void>();
let hasAddedWindowListeners = false;

function notifyDiscountsSubscribers(): void {
  discountSubscribers.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in discount subscriber callback:", err);
    }
  });
}

/**
 * Explicit client hydration from localStorage.
 * Runs AFTER server render / client hydration to prevent SSR mismatch.
 */
export function hydrateDiscounts(): void {
  if (typeof window === "undefined" || isDiscountsHydrated) return;
  isDiscountsHydrated = true;

  try {
    const raw = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
    if (!raw) {
      const serialized = JSON.stringify(initialDiscounts);
      localStorage.setItem(DISCOUNTS_STORAGE_KEY, serialized);
      lastSavedDiscountsRaw = serialized;
      discountsSnapshot = initialDiscounts;
      return;
    }
    lastSavedDiscountsRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      discountsSnapshot = parsed;
      notifyDiscountsSubscribers();
    } else {
      discountsSnapshot = initialDiscounts;
    }
  } catch (error) {
    console.error("Failed to read discounts from localStorage:", error);
    discountsSnapshot = initialDiscounts;
  }
}

function handleDiscountsSyncEvent(e?: StorageEvent | Event): void {
  if (typeof window === "undefined") return;

  if (e && "key" in e && e.key !== DISCOUNTS_STORAGE_KEY) {
    return;
  }

  try {
    const raw = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
    if (!raw) return;

    // Only update in-memory snapshot and notify if raw string actually changed
    if (raw !== lastSavedDiscountsRaw) {
      lastSavedDiscountsRaw = raw;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        discountsSnapshot = parsed;
        notifyDiscountsSubscribers();
      }
    }
  } catch (err) {
    console.error("Failed to sync discounts from storage:", err);
  }
}

function ensureWindowListeners(): void {
  if (typeof window === "undefined" || hasAddedWindowListeners) return;
  window.addEventListener(DISCOUNTS_EVENT, handleDiscountsSyncEvent);
  window.addEventListener("storage", handleDiscountsSyncEvent);
  hasAddedWindowListeners = true;
}

/**
 * Retrieve all discounts from the cached in-memory snapshot.
 */
export function getDiscounts(): Discount[] {
  if (typeof window !== "undefined" && !isDiscountsHydrated) {
    hydrateDiscounts();
  }
  return discountsSnapshot;
}

/**
 * Persist discounts array, update in-memory snapshot, and notify subscribers.
 */
export function saveDiscounts(discounts: Discount[]): void {
  discountsSnapshot = discounts;
  isDiscountsHydrated = true;

  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(discounts);
      lastSavedDiscountsRaw = raw;
      localStorage.setItem(DISCOUNTS_STORAGE_KEY, raw);
      window.dispatchEvent(new CustomEvent(DISCOUNTS_EVENT));
    } catch (error) {
      console.error("Failed to save discounts to localStorage:", error);
    }
  }

  notifyDiscountsSubscribers();
}

/**
 * Find discount by ID.
 */
export function getDiscountById(id: string): Discount | undefined {
  const discounts = getDiscounts();
  return discounts.find((d) => d.id === id);
}

/**
 * Find discount by code (case-insensitive, normalized).
 */
export function getDiscountByCode(code: string): Discount | undefined {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return undefined;
  const discounts = getDiscounts();
  return discounts.find((d) => d.code.toUpperCase() === normalized);
}

/**
 * Derive effective status for a discount.
 */
export function getDiscountStatus(
  discount: Discount,
  currentTime?: number
): DiscountStatus {
  if (!discount.active) {
    return "Inactive";
  }

  const now = currentTime ? new Date(currentTime) : new Date();

  if (discount.startAt) {
    const start = new Date(discount.startAt);
    if (!isNaN(start.getTime()) && now < start) {
      return "Scheduled";
    }
  }

  if (discount.endAt) {
    const end = new Date(discount.endAt);
    if (!isNaN(end.getTime()) && now > end) {
      return "Expired";
    }
  }

  if (
    discount.usageLimit !== undefined &&
    discount.usageLimit > 0 &&
    discount.usageCount >= discount.usageLimit
  ) {
    return "Expired";
  }

  return "Active";
}

/**
 * Add a new discount to the store.
 */
export function addDiscount(input: DiscountInput): Discount {
  const current = getDiscounts();
  const nextSeq = current.length + 1;
  const id = input.id || `DISC-${String(nextSeq).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newDiscount: Discount = {
    ...input,
    id,
    code: (input.code || "").trim().toUpperCase(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    usageLimit:
      input.usageLimit !== undefined && input.usageLimit > 0
        ? Number(input.usageLimit)
        : undefined,
    usageCount: 0,
    minimumOrderAmount:
      input.minimumOrderAmount !== undefined && input.minimumOrderAmount > 0
        ? Number(input.minimumOrderAmount)
        : undefined,
    maximumDiscountAmount:
      input.maximumDiscountAmount !== undefined && input.maximumDiscountAmount > 0
        ? Number(input.maximumDiscountAmount)
        : undefined,
    createdAt: now,
    updatedAt: now,
  };

  saveDiscounts([newDiscount, ...current]);
  return newDiscount;
}

/**
 * Update an existing discount.
 */
export function updateDiscount(
  id: string,
  updates: Partial<DiscountInput>
): boolean {
  const current = getDiscounts();
  let found = false;

  const updated = current.map((item) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        ...updates,
        code: updates.code ? updates.code.trim().toUpperCase() : item.code,
        name: updates.name ? updates.name.trim() : item.name,
        description:
          updates.description !== undefined
            ? updates.description.trim() || undefined
            : item.description,
        value: updates.value !== undefined ? Number(updates.value) : item.value,
        usageLimit:
          updates.usageLimit !== undefined
            ? updates.usageLimit > 0
              ? Number(updates.usageLimit)
              : undefined
            : item.usageLimit,
        minimumOrderAmount:
          updates.minimumOrderAmount !== undefined
            ? updates.minimumOrderAmount > 0
              ? Number(updates.minimumOrderAmount)
              : undefined
            : item.minimumOrderAmount,
        maximumDiscountAmount:
          updates.maximumDiscountAmount !== undefined
            ? updates.maximumDiscountAmount > 0
              ? Number(updates.maximumDiscountAmount)
              : undefined
            : item.maximumDiscountAmount,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (found) {
    saveDiscounts(updated);
  }
  return found;
}

/**
 * Toggle discount active/inactive status.
 */
export function toggleDiscount(id: string): boolean {
  const current = getDiscounts();
  let found = false;

  const updated = current.map((item) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        active: !item.active,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (found) {
    saveDiscounts(updated);
  }
  return found;
}

/**
 * Duplicate a discount with a '-COPY' suffix, set inactive initially.
 */
export function duplicateDiscount(id: string): Discount | null {
  const original = getDiscountById(id);
  if (!original) return null;

  const current = getDiscounts();
  const nextSeq = current.length + 1;
  const newId = `DISC-${String(nextSeq).padStart(3, "0")}`;

  let baseCode = `${original.code}-COPY`;
  let counter = 1;
  while (current.some((d) => d.code === baseCode)) {
    baseCode = `${original.code}-COPY${counter++}`;
  }

  const duplicated: DiscountInput = {
    code: baseCode,
    name: `${original.name} (Copy)`,
    description: original.description,
    type: original.type,
    value: original.value,
    appliesTo: original.appliesTo,
    productIds: original.productIds ? [...original.productIds] : undefined,
    categoryIds: original.categoryIds ? [...original.categoryIds] : undefined,
    minimumOrderAmount: original.minimumOrderAmount,
    maximumDiscountAmount: original.maximumDiscountAmount,
    startAt: original.startAt,
    endAt: original.endAt,
    usageLimit: original.usageLimit,
    customerEligibility: original.customerEligibility,
    active: false, // Inactive by default until reviewed
  };

  return addDiscount({ ...duplicated, id: newId });
}

/**
 * Delete a discount by ID.
 * NOTE: Historical completed orders preserve snapshot discount metadata.
 */
export function deleteDiscount(id: string): boolean {
  const current = getDiscounts();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length !== current.length) {
    saveDiscounts(filtered);
    return true;
  }
  return false;
}

/**
 * Increment discount usage count after successful sale completion.
 */
export function incrementDiscountUsage(id?: string): boolean {
  if (!id) return false;
  const current = getDiscounts();
  let found = false;

  const updated = current.map((item) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        usageCount: item.usageCount + 1,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (found) {
    saveDiscounts(updated);
  }
  return found;
}

/**
 * Validate whether a discount is currently applicable to a cart and customer.
 */
export function validateDiscount(
  params: DiscountValidationParams
): { valid: boolean; reason?: string } {
  const { discount, cart, customerId, currentTime } = params;

  // 1. Check status
  const status = getDiscountStatus(discount, currentTime);
  if (status === "Inactive") {
    return { valid: false, reason: "Promotion is currently inactive." };
  }
  if (status === "Scheduled") {
    return { valid: false, reason: "Promotion has not started yet (scheduled)." };
  }
  if (status === "Expired") {
    if (
      discount.usageLimit !== undefined &&
      discount.usageLimit > 0 &&
      discount.usageCount >= discount.usageLimit
    ) {
      return { valid: false, reason: "Promotion usage limit has been reached." };
    }
    return { valid: false, reason: "Promotion has expired." };
  }

  // 2. Customer eligibility check
  if (discount.customerEligibility === "Registered Customers" && !customerId) {
    return {
      valid: false,
      reason: "Promotion is only available for registered customers.",
    };
  }

  // 3. Cart subtotal check
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (
    discount.minimumOrderAmount !== undefined &&
    discount.minimumOrderAmount > 0 &&
    subtotal < discount.minimumOrderAmount
  ) {
    const sym = getCurrencySymbol();
    return {
      valid: false,
      reason: `Minimum order of ${sym}${discount.minimumOrderAmount.toFixed(
        2
      )} required (current: ${sym}${subtotal.toFixed(2)}).`,
    };
  }

  // 4. Targeting / items check
  if (cart.length === 0) {
    return { valid: false, reason: "Cart is empty." };
  }

  if (discount.appliesTo === "Specific Products") {
    const targetIds = discount.productIds || [];
    const hasTargetProduct = cart.some((item) => targetIds.includes(item.id));
    if (!hasTargetProduct) {
      return {
        valid: false,
        reason: "Cart does not contain eligible products for this discount.",
      };
    }
  }

  if (discount.appliesTo === "Specific Categories") {
    const targetCategories = (discount.categoryIds || []).map((c) =>
      c.toLowerCase()
    );
    const hasTargetCategory = cart.some((item) =>
      targetCategories.includes(item.category.toLowerCase())
    );
    if (!hasTargetCategory) {
      return {
        valid: false,
        reason: "Cart does not contain eligible category items for this discount.",
      };
    }
  }

  return { valid: true };
}

/**
 * Centralized discount calculation engine.
 * Computes eligible subtotal, discount amount, taxable amount, VAT (15%), and total.
 */
export function calculateDiscount(
  cart: CartItem[],
  discount: Discount | null,
  customerId?: string,
  currentTime?: number,
  vatRate: number = 15
): DiscountCalculationResult {
  const vatMultiplier = (typeof vatRate === "number" && !isNaN(vatRate) ? vatRate : 15) / 100;
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!discount || cart.length === 0) {
    const vat = Math.round(subtotal * vatMultiplier * 100) / 100;
    return {
      valid: true,
      discount: null,
      eligibleSubtotal: subtotal,
      discountAmount: 0,
      taxableAmount: subtotal,
      vat,
      total: Math.round((subtotal + vat) * 100) / 100,
    };
  }

  // Validate discount applicability
  const validation = validateDiscount({
    discount,
    cart,
    customerId,
    currentTime,
  });

  if (!validation.valid) {
    const vat = Math.round(subtotal * vatMultiplier * 100) / 100;
    return {
      valid: false,
      reason: validation.reason,
      discount: null,
      eligibleSubtotal: subtotal,
      discountAmount: 0,
      taxableAmount: subtotal,
      vat,
      total: Math.round((subtotal + vat) * 100) / 100,
    };
  }

  // Compute eligible subtotal based on targeting
  let eligibleSubtotal = 0;

  if (discount.appliesTo === "Entire Order") {
    eligibleSubtotal = subtotal;
  } else if (discount.appliesTo === "Specific Products") {
    const targetIds = discount.productIds || [];
    eligibleSubtotal = cart
      .filter((item) => targetIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  } else if (discount.appliesTo === "Specific Categories") {
    const targetCategories = (discount.categoryIds || []).map((c) =>
      c.toLowerCase()
    );
    eligibleSubtotal = cart
      .filter((item) => targetCategories.includes(item.category.toLowerCase()))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  if (eligibleSubtotal <= 0) {
    const vat = Math.round(subtotal * vatMultiplier * 100) / 100;
    return {
      valid: false,
      reason: "No eligible items in cart.",
      discount: null,
      eligibleSubtotal: 0,
      discountAmount: 0,
      taxableAmount: subtotal,
      vat,
      total: Math.round((subtotal + vat) * 100) / 100,
    };
  }

  // Calculate raw discount
  let computedDiscount = 0;
  if (discount.type === "Percentage") {
    computedDiscount = (eligibleSubtotal * discount.value) / 100;
    if (
      discount.maximumDiscountAmount !== undefined &&
      discount.maximumDiscountAmount > 0
    ) {
      computedDiscount = Math.min(computedDiscount, discount.maximumDiscountAmount);
    }
  } else if (discount.type === "Fixed Amount") {
    computedDiscount = Math.min(discount.value, eligibleSubtotal);
  }

  // Round to 2 decimals
  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Math.round(computedDiscount * 100) / 100)
  );

  // VAT Rule: VAT is applied to Taxable Amount (Subtotal - Discount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vat = Math.round(taxableAmount * vatMultiplier * 100) / 100;
  const total = Math.round((taxableAmount + vat) * 100) / 100;

  return {
    valid: true,
    discount,
    eligibleSubtotal,
    discountAmount,
    taxableAmount,
    vat,
    total,
  };
}

/**
 * Derive total historical discount value given across all completed orders.
 */
export function calculateTotalDiscountGiven(orders: CompletedOrder[]): number {
  return orders.reduce((sum, o) => sum + (o.discount || 0), 0);
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook
// ----------------------------------------------------------------------

/**
 * Subscribe to discounts store changes.
 */
export function subscribeDiscounts(callback: () => void): () => void {
  discountSubscribers.add(callback);
  ensureWindowListeners();
  queueMicrotask(() => {
    hydrateDiscounts();
  });

  return () => {
    discountSubscribers.delete(callback);
  };
}

/**
 * Returns the cached in-memory discounts snapshot.
 * Guarantees stable reference across calls until store mutates.
 */
export function getDiscountsSnapshot(): Discount[] {
  return discountsSnapshot;
}

/**
 * Stable server snapshot for SSR/hydration.
 */
export function getDiscountsServerSnapshot(): Discount[] {
  return initialDiscounts;
}

export function useDiscountsStore() {
  const discounts = useSyncExternalStore(
    subscribeDiscounts,
    getDiscountsSnapshot,
    getDiscountsServerSnapshot
  );

  useEffect(() => {
    hydrateDiscounts();
  }, []);

  return {
    discounts,
    isLoaded: isDiscountsHydrated,
    addDiscount,
    updateDiscount,
    toggleDiscount,
    duplicateDiscount,
    deleteDiscount,
    getDiscountById,
    getDiscountByCode,
  };
}
