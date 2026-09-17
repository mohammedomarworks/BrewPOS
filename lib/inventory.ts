"use client";

import { useSyncExternalStore, useEffect } from "react";
import type {
  Ingredient,
  IngredientInput,
  StockTransaction,
  StockStatus,
  TransactionType,
} from "@/types/inventory";

const INVENTORY_STORAGE_KEY = "brewpos_inventory_v1";
const TRANSACTIONS_STORAGE_KEY = "brewpos_stock_transactions_v1";
const INVENTORY_EVENT = "brewpos:inventory-updated";

let ingredientsSnapshot: Ingredient[] = [];
let isInventoryHydrated = false;
let lastSavedInventoryRaw: string | null = null;
const inventorySubscribers = new Set<() => void>();

function notifyInventorySubscribers() {
  for (const cb of inventorySubscribers) {
    cb();
  }
}

export const initialIngredients: Ingredient[] = [
  {
    id: "ING-COF-001",
    name: "Coffee Beans",
    sku: "ING-COF-001",
    unit: "g",
    currentStock: 8500,
    minimumStock: 3000,
    maximumStock: 25000,
    costPerUnit: 1.2,
    supplier: "BeanCraft Roasters",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-MLK-002",
    name: "Fresh Whole Milk",
    sku: "ING-MLK-002",
    unit: "ml",
    currentStock: 40000,
    minimumStock: 10000,
    maximumStock: 80000,
    costPerUnit: 0.12,
    supplier: "Dhaka Dairy Co.",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-SGR-003",
    name: "Sugar Syrup",
    sku: "ING-SGR-003",
    unit: "ml",
    currentStock: 15000,
    minimumStock: 3000,
    maximumStock: 30000,
    costPerUnit: 0.08,
    supplier: "Pure Cane Ltd",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-CHO-004",
    name: "Chocolate Syrup",
    sku: "ING-CHO-004",
    unit: "ml",
    currentStock: 6000,
    minimumStock: 1500,
    maximumStock: 15000,
    costPerUnit: 0.35,
    supplier: "Dutch Cocoa Import",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-CAR-005",
    name: "Caramel Syrup",
    sku: "ING-CAR-005",
    unit: "ml",
    currentStock: 5000,
    minimumStock: 1500,
    maximumStock: 15000,
    costPerUnit: 0.4,
    supplier: "Monin Supply",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-VAN-006",
    name: "Vanilla Syrup",
    sku: "ING-VAN-006",
    unit: "ml",
    currentStock: 4500,
    minimumStock: 1200,
    maximumStock: 12000,
    costPerUnit: 0.38,
    supplier: "Monin Supply",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-WTR-007",
    name: "Filtered Water",
    sku: "ING-WTR-007",
    unit: "ml",
    currentStock: 100000,
    minimumStock: 20000,
    maximumStock: 200000,
    costPerUnit: 0.01,
    supplier: "Aqua Pure",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-TEA-008",
    name: "Earl Grey Tea Leaves",
    sku: "ING-TEA-008",
    unit: "g",
    currentStock: 2000,
    minimumStock: 500,
    maximumStock: 5000,
    costPerUnit: 0.9,
    supplier: "Sylhet Tea Gardens",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-COC-009",
    name: "Cocoa Powder",
    sku: "ING-COC-009",
    unit: "g",
    currentStock: 1500,
    minimumStock: 400,
    maximumStock: 4000,
    costPerUnit: 1.1,
    supplier: "Dutch Cocoa Import",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-CRO-010",
    name: "Butter Croissant Pastry",
    sku: "ING-CRO-010",
    unit: "pcs",
    currentStock: 35,
    minimumStock: 10,
    maximumStock: 80,
    costPerUnit: 70.0,
    supplier: "Artisan Bakes",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-MUF-011",
    name: "Blueberry Muffin Batch",
    sku: "ING-MUF-011",
    unit: "pcs",
    currentStock: 25,
    minimumStock: 8,
    maximumStock: 60,
    costPerUnit: 80.0,
    supplier: "Artisan Bakes",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-CUP-012",
    name: "Paper Takeaway Cups",
    sku: "ING-CUP-012",
    unit: "pcs",
    currentStock: 500,
    minimumStock: 100,
    maximumStock: 1500,
    costPerUnit: 4.5,
    supplier: "EcoPack BD",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-LID-013",
    name: "Cup Lids",
    sku: "ING-LID-013",
    unit: "pcs",
    currentStock: 480,
    minimumStock: 100,
    maximumStock: 1500,
    costPerUnit: 2.0,
    supplier: "EcoPack BD",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "ING-NAP-014",
    name: "Paper Napkins",
    sku: "ING-NAP-014",
    unit: "pcs",
    currentStock: 1200,
    minimumStock: 300,
    maximumStock: 3000,
    costPerUnit: 0.5,
    supplier: "EcoPack BD",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
];

/**
 * Hydrate ingredients from localStorage safely without SSR mismatch.
 */
export function hydrateInventory(): void {
  if (typeof window === "undefined" || isInventoryHydrated) return;
  isInventoryHydrated = true;

  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      lastSavedInventoryRaw = null;
      ingredientsSnapshot = initialIngredients;
      return;
    }
    lastSavedInventoryRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      ingredientsSnapshot = parsed;
      notifyInventorySubscribers();
    }
  } catch (error) {
    console.warn("Failed to read inventory from localStorage, falling back to initial data:", error);
    ingredientsSnapshot = initialIngredients;
  }
}

/**
 * Retrieve ingredients from snapshot (hydrating if called in client).
 */
export function getIngredients(): Ingredient[] {
  if (typeof window !== "undefined" && !isInventoryHydrated) {
    hydrateInventory();
  }
  return ingredientsSnapshot.length > 0 ? ingredientsSnapshot : initialIngredients;
}

/**
 * Persist ingredients array, update snapshot, and broadcast update.
 */
export function saveIngredients(ingredients: Ingredient[]): void {
  ingredientsSnapshot = ingredients;
  isInventoryHydrated = true;
  if (typeof window === "undefined") return;

  try {
    const raw = JSON.stringify(ingredients);
    lastSavedInventoryRaw = raw;
    localStorage.setItem(INVENTORY_STORAGE_KEY, raw);
    window.dispatchEvent(new CustomEvent(INVENTORY_EVENT));
    notifyInventorySubscribers();
  } catch (error) {
    console.error("Failed to save inventory to localStorage:", error);
  }
}

/**
 * Retrieve all stock transactions from localStorage.
 */
export function getStockTransactions(ingredientId?: string): StockTransaction[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (ingredientId) {
      return parsed.filter((t: StockTransaction) => t.ingredientId === ingredientId);
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read stock transactions from localStorage:", error);
    return [];
  }
}

/**
 * Persist stock transactions array and broadcast update.
 */
export function saveStockTransactions(transactions: StockTransaction[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent(INVENTORY_EVENT));
  } catch (error) {
    console.error("Failed to save stock transactions to localStorage:", error);
  }
}

/**
 * Add a new stock transaction to the top of the log.
 */
export function recordStockTransaction(
  data: Omit<StockTransaction, "id" | "createdAt">
): StockTransaction {
  const current = getStockTransactions();
  const nextSeq = current.length + 1;
  const id = `TXN-${String(nextSeq).padStart(5, "0")}`;

  const newTxn: StockTransaction = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  saveStockTransactions([newTxn, ...current]);
  return newTxn;
}

/**
 * Retrieve single ingredient by ID.
 */
export function getIngredientById(id: string): Ingredient | undefined {
  const ingredients = getIngredients();
  return ingredients.find((i) => i.id === id);
}

/**
 * Helper to compute stock health status.
 * Supports passing an Ingredient object or (currentStock, minimumStock) numbers.
 */
export function getStockStatus(
  arg: Ingredient | number,
  minStock?: number
): StockStatus {
  const current = typeof arg === "number" ? arg : arg.currentStock;
  const minimum = typeof arg === "number" ? (minStock ?? 0) : arg.minimumStock;

  if (current <= 0) {
    return "Out of Stock";
  }
  if (current <= minimum) {
    return "Low Stock";
  }
  return "Healthy";
}

/**
 * Helper to generate a sensible, unique SKU for ingredients.
 */
export function generateIngredientSKU(name: string): string {
  const code = (name || "ING")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const ingredients = getIngredients();
  let candidate = `ING-${code}-001`;
  let counter = 1;

  while (ingredients.some((i) => i.sku.toUpperCase() === candidate.toUpperCase())) {
    counter++;
    candidate = `ING-${code}-${String(counter).padStart(3, "0")}`;
  }

  return candidate;
}

/**
 * Generate next sequential Ingredient ID (e.g. ING-COF-015).
 */
export function getNextIngredientId(name: string): string {
  return generateIngredientSKU(name);
}

/**
 * Add a new ingredient to inventory.
 */
export function addIngredient(data: IngredientInput): Ingredient {
  const current = getIngredients();
  const now = new Date().toISOString();
  const id = data.id || getNextIngredientId(data.name);
  const sku = data.sku?.trim() || generateIngredientSKU(data.name);

  const newIngredient: Ingredient = {
    ...data,
    id,
    sku,
    name: data.name.trim(),
    currentStock: Math.max(0, Number(data.currentStock) || 0),
    minimumStock: Math.max(0, Number(data.minimumStock) || 0),
    maximumStock: data.maximumStock ? Math.max(0, Number(data.maximumStock)) : undefined,
    costPerUnit: Math.max(0, Number(data.costPerUnit) || 0),
    active: data.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  saveIngredients([newIngredient, ...current]);

  // If initial stock was given, record an initial Purchase/Adjustment transaction
  if (newIngredient.currentStock > 0) {
    recordStockTransaction({
      ingredientId: newIngredient.id,
      type: "Adjustment",
      quantity: newIngredient.currentStock,
      previousStock: 0,
      newStock: newIngredient.currentStock,
      reason: "Initial Stock Setup",
    });
  }

  return newIngredient;
}

/**
 * Update an existing ingredient (name, minimumStock, cost, supplier, etc.).
 * NOTE: DOES NOT allow silent alteration of currentStock!
 */
export function updateIngredient(
  id: string,
  updates: Partial<Omit<IngredientInput, "currentStock">>
): boolean {
  const current = getIngredients();
  let found = false;

  const updated = current.map((item) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        name: updates.name ? updates.name.trim() : item.name,
        sku: updates.sku ? updates.sku.trim() : item.sku,
        unit: updates.unit || item.unit,
        minimumStock:
          updates.minimumStock !== undefined
            ? Math.max(0, Number(updates.minimumStock))
            : item.minimumStock,
        maximumStock:
          updates.maximumStock !== undefined
            ? Math.max(0, Number(updates.maximumStock))
            : item.maximumStock,
        costPerUnit:
          updates.costPerUnit !== undefined
            ? Math.max(0, Number(updates.costPerUnit))
            : item.costPerUnit,
        supplier:
          updates.supplier !== undefined ? (updates.supplier.trim() || undefined) : item.supplier,
        active: updates.active !== undefined ? updates.active : item.active,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (found) {
    saveIngredients(updated);
  }
  return found;
}

/**
 * Toggle ingredient active status.
 */
export function toggleIngredientActive(id: string): boolean {
  const current = getIngredients();
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
    saveIngredients(updated);
  }
  return found;
}

/**
 * Delete an ingredient by ID.
 * NOTE: recipe-store checks whether the ingredient is used in recipes.
 */
export function deleteIngredient(id: string): boolean {
  const current = getIngredients();
  const filtered = current.filter((i) => i.id !== id);
  if (filtered.length !== current.length) {
    saveIngredients(filtered);
    return true;
  }
  return false;
}

/**
 * Adjust ingredient stock (Add Stock, Remove Stock, or Set Exact Stock).
 * Always records a StockTransaction for audit integrity.
 */
export function adjustStock(params: {
  ingredientId: string;
  type: TransactionType;
  quantityDelta: number; // positive for addition, negative for deduction, or calculated for exact
  reason?: string;
  reference?: string;
}): { success: boolean; error?: string; transaction?: StockTransaction } {
  const current = getIngredients();
  const ingredient = current.find((i) => i.id === params.ingredientId);

  if (!ingredient) {
    return { success: false, error: "Ingredient not found." };
  }

  const previousStock = ingredient.currentStock;
  const newStock = previousStock + params.quantityDelta;

  if (newStock < 0) {
    return {
      success: false,
      error: `Cannot reduce stock below 0. (Current: ${previousStock} ${ingredient.unit}, Attempted change: ${params.quantityDelta} ${ingredient.unit})`,
    };
  }

  const updatedIngredients = current.map((i) =>
    i.id === params.ingredientId
      ? {
          ...i,
          currentStock: newStock,
          updatedAt: new Date().toISOString(),
        }
      : i
  );

  saveIngredients(updatedIngredients);

  const txn = recordStockTransaction({
    ingredientId: params.ingredientId,
    type: params.type,
    quantity: params.quantityDelta,
    previousStock,
    newStock,
    reason: params.reason || "Manual Stock Adjustment",
    reference: params.reference,
  });

  return { success: true, transaction: txn };
}

/**
 * Receive Stock / Purchase Flow
 */
export function receiveStock(params: {
  ingredientId: string;
  quantity: number;
  costPerUnit?: number;
  supplier?: string;
  reference?: string;
}): { success: boolean; error?: string; transaction?: StockTransaction } {
  if (params.quantity <= 0) {
    return { success: false, error: "Received quantity must be greater than 0." };
  }

  const current = getIngredients();
  const ingredient = current.find((i) => i.id === params.ingredientId);
  if (!ingredient) {
    return { success: false, error: "Ingredient not found." };
  }

  const previousStock = ingredient.currentStock;
  const newStock = previousStock + params.quantity;

  const updatedIngredients = current.map((i) => {
    if (i.id === params.ingredientId) {
      return {
        ...i,
        currentStock: newStock,
        costPerUnit: params.costPerUnit !== undefined && params.costPerUnit > 0
          ? params.costPerUnit
          : i.costPerUnit,
        supplier: params.supplier?.trim() || i.supplier,
        updatedAt: new Date().toISOString(),
      };
    }
    return i;
  });

  saveIngredients(updatedIngredients);

  const txn = recordStockTransaction({
    ingredientId: params.ingredientId,
    type: "Purchase",
    quantity: params.quantity,
    previousStock,
    newStock,
    reason: params.supplier ? `Supplier: ${params.supplier}` : "Purchase Delivery",
    reference: params.reference || "PO-RECEIVE",
  });

  return { success: true, transaction: txn };
}

/**
 * Calculate total inventory value in BDT: sum(currentStock * costPerUnit).
 */
export function calculateInventoryValue(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
}

/**
 * Get all ingredients currently in low stock or out of stock.
 */
export function getLowStockIngredients(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.filter(
    (i) => i.active && i.currentStock <= i.minimumStock
  );
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for real-time reactivity
// ----------------------------------------------------------------------

function subscribeInventory(callback: () => void) {
  inventorySubscribers.add(callback);
  if (typeof window !== "undefined") {
    const handleSync = (e?: StorageEvent | Event) => {
      if (e && "key" in e && e.key !== INVENTORY_STORAGE_KEY) return;
      try {
        const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (!raw) return;
        if (raw !== lastSavedInventoryRaw) {
          lastSavedInventoryRaw = raw;
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            ingredientsSnapshot = parsed;
            notifyInventorySubscribers();
          }
        }
      } catch (err) {
        console.warn("Failed to sync inventory from storage:", err);
      }
    };

    window.addEventListener(INVENTORY_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    queueMicrotask(() => {
      hydrateInventory();
    });

    return () => {
      inventorySubscribers.delete(callback);
      window.removeEventListener(INVENTORY_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }

  return () => {
    inventorySubscribers.delete(callback);
  };
}

function getInventorySnapshot(): Ingredient[] {
  return ingredientsSnapshot.length > 0 ? ingredientsSnapshot : initialIngredients;
}

function getInventoryServerSnapshot(): Ingredient[] {
  return initialIngredients;
}

export function useInventoryStore() {
  const ingredients = useSyncExternalStore(
    subscribeInventory,
    getInventorySnapshot,
    getInventoryServerSnapshot
  );

  useEffect(() => {
    hydrateInventory();
  }, []);

  return {
    ingredients,
    isLoaded: isInventoryHydrated,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    toggleIngredientActive,
    adjustStock,
    receiveStock,
    getIngredientById,
    getStockTransactions,
    getStockStatus,
    calculateInventoryValue,
  };
}
