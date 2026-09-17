"use client";

import { useSyncExternalStore } from "react";
import { products as initialProducts, initialCategories } from "@/data/products";
import type { Product, Category } from "@/data/products";

const PRODUCTS_STORAGE_KEY = "brewpos_products_v1";
const CATEGORIES_STORAGE_KEY = "brewpos_categories_v1";

const PRODUCTS_EVENT = "brewpos:products-updated";
const CATEGORIES_EVENT = "brewpos:categories-updated";

/**
 * Retrieve all products from localStorage (or fallback to initial seed).
 */
export function getProducts(): Product[] {
  if (typeof window === "undefined") {
    return initialProducts;
  }

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      // First-time seed
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array was explicitly set, return it; otherwise fallback
    return Array.isArray(parsed) ? parsed : initialProducts;
  } catch (error) {
    console.error("Failed to read products from localStorage:", error);
    return initialProducts;
  }
}

/**
 * Persist products array and broadcast change.
 */
export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT));
  } catch (error) {
    console.error("Failed to save products to localStorage:", error);
  }
}

/**
 * Retrieve all categories from localStorage (or fallback to initial seed).
 */
export function getCategories(): Category[] {
  if (typeof window === "undefined") {
    return initialCategories;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
      return initialCategories;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialCategories;
  } catch (error) {
    console.error("Failed to read categories from localStorage:", error);
    return initialCategories;
  }
}

/**
 * Persist categories array and broadcast change.
 */
export function saveCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent(CATEGORIES_EVENT));
  } catch (error) {
    console.error("Failed to save categories to localStorage:", error);
  }
}

/**
 * Helper to check if SKU is unique across existing products.
 */
export function isSKUUnique(sku: string, excludeId?: number): boolean {
  const products = getProducts();
  const normalized = sku.trim().toUpperCase();
  return !products.some(
    (p) => p.sku?.toUpperCase() === normalized && p.id !== excludeId
  );
}

/**
 * Helper to generate a sensible, unique SKU.
 * e.g., "Cappuccino" in "Hot Coffee" -> "HOT-CAP-123"
 */
export function generateSKU(name: string, category: string): string {
  const catCode = (category || "GEN")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const nameCode = (name || "PRD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const randomNum = Math.floor(100 + Math.random() * 900);
  let candidate = `${catCode}-${nameCode}-${randomNum}`;

  // Ensure uniqueness
  let counter = 1;
  while (!isSKUUnique(candidate)) {
    candidate = `${catCode}-${nameCode}-${randomNum + counter}`;
    counter++;
  }

  return candidate;
}

/**
 * Add a new product to the catalog.
 */
export function addProduct(
  data: Omit<Product, "id"> & { id?: number }
): Product {
  const current = getProducts();
  const maxId = current.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...data,
    id: data.id || maxId + 1,
    sku: data.sku?.trim() || generateSKU(data.name, data.category),
    available: data.available ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newProduct, ...current];
  saveProducts(updated);
  return newProduct;
}

/**
 * Update an existing product by ID.
 */
export function updateProduct(
  id: number,
  updates: Partial<Product>
): boolean {
  const current = getProducts();
  let found = false;

  const updated = current.map((p) => {
    if (p.id === id) {
      found = true;
      return {
        ...p,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (found) {
    saveProducts(updated);
  }
  return found;
}

/**
 * Toggle product availability.
 */
export function toggleProductAvailability(id: number): boolean {
  const current = getProducts();
  let found = false;

  const updated = current.map((p) => {
    if (p.id === id) {
      found = true;
      return {
        ...p,
        available: !p.available,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (found) {
    saveProducts(updated);
  }
  return found;
}

/**
 * Delete a product by ID.
 */
export function deleteProduct(id: number): boolean {
  const current = getProducts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length !== current.length) {
    saveProducts(filtered);
    return true;
  }
  return false;
}

/**
 * Duplicate a product with a new ID and unique SKU.
 */
export function duplicateProduct(id: number): Product | undefined {
  const current = getProducts();
  const source = current.find((p) => p.id === id);
  if (!source) return undefined;

  const maxId = current.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const copyName = `${source.name} Copy`;
  const copySKU = generateSKU(copyName, source.category);
  const now = new Date().toISOString();

  const duplicated: Product = {
    ...source,
    id: maxId + 1,
    name: copyName,
    sku: copySKU,
    createdAt: now,
    updatedAt: now,
  };

  saveProducts([duplicated, ...current]);
  return duplicated;
}

/**
 * Add a new category.
 */
export function addCategory(
  data: Omit<Category, "id"> & { id?: string }
): Category {
  const current = getCategories();
  const slug =
    data.id ||
    data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

  const newCat: Category = {
    ...data,
    id: slug,
    createdAt: new Date().toISOString(),
  };

  saveCategories([...current, newCat]);
  return newCat;
}

/**
 * Update an existing category.
 */
export function updateCategory(
  id: string,
  updates: Partial<Category>
): boolean {
  const current = getCategories();
  const oldCategory = current.find((c) => c.id === id);
  let found = false;

  const updated = current.map((c) => {
    if (c.id === id) {
      found = true;
      return { ...c, ...updates };
    }
    return c;
  });

  if (found) {
    saveCategories(updated);

    // If name changed, synchronize category name across products
    if (updates.name && oldCategory && oldCategory.name !== updates.name) {
      const allProducts = getProducts();
      const updatedProducts = allProducts.map((p) =>
        p.category === oldCategory.name ? { ...p, category: updates.name! } : p
      );
      saveProducts(updatedProducts);
    }
  }
  return found;
}

/**
 * Delete a category by ID.
 * BLOCKS deletion if products are assigned to this category.
 */
export function deleteCategory(id: string): {
  success: boolean;
  reason?: string;
} {
  const currentCategories = getCategories();
  const target = currentCategories.find((c) => c.id === id);
  if (!target) {
    return { success: false, reason: "Category not found." };
  }

  const allProducts = getProducts();
  const assignedProducts = allProducts.filter(
    (p) => p.category.toLowerCase() === target.name.toLowerCase()
  );

  if (assignedProducts.length > 0) {
    return {
      success: false,
      reason: `Cannot delete "${target.name}" because ${assignedProducts.length} product${
        assignedProducts.length === 1 ? "" : "s"
      } (e.g. ${assignedProducts[0].name}) belong to it. Please reassign or delete these products first.`,
    };
  }

  const filtered = currentCategories.filter((c) => c.id !== id);
  saveCategories(filtered);
  return { success: true };
}

/**
 * Toggle category active status.
 */
export function toggleCategoryActive(id: string): boolean {
  const current = getCategories();
  let found = false;

  const updated = current.map((c) => {
    if (c.id === id) {
      found = true;
      return { ...c, active: !c.active };
    }
    return c;
  });

  if (found) {
    saveCategories(updated);
  }
  return found;
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hooks for real-time reactivity
// ----------------------------------------------------------------------

let cachedProducts: Product[] = [];
let cachedProductsRaw: string | null = null;

function subscribeProducts(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(PRODUCTS_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(PRODUCTS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getProductsSnapshot(): Product[] {
  if (typeof window === "undefined") return initialProducts;

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
      cachedProducts = initialProducts;
      cachedProductsRaw = JSON.stringify(initialProducts);
      return cachedProducts;
    }
    if (raw !== cachedProductsRaw) {
      cachedProductsRaw = raw;
      cachedProducts = JSON.parse(raw);
    }
    return cachedProducts;
  } catch {
    return initialProducts;
  }
}

function getProductsServerSnapshot(): Product[] {
  return initialProducts;
}

export function useProductsStore() {
  const products = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getProductsServerSnapshot
  );

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    duplicateProduct,
    generateSKU,
    isSKUUnique,
  };
}

let cachedCategories: Category[] = [];
let cachedCategoriesRaw: string | null = null;

function subscribeCategories(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(CATEGORIES_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CATEGORIES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getCategoriesSnapshot(): Category[] {
  if (typeof window === "undefined") return initialCategories;

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
      cachedCategories = initialCategories;
      cachedCategoriesRaw = JSON.stringify(initialCategories);
      return cachedCategories;
    }
    if (raw !== cachedCategoriesRaw) {
      cachedCategoriesRaw = raw;
      cachedCategories = JSON.parse(raw);
    }
    return cachedCategories;
  } catch {
    return initialCategories;
  }
}

function getCategoriesServerSnapshot(): Category[] {
  return initialCategories;
}

export function useCategoriesStore() {
  const categories = useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getCategoriesServerSnapshot
  );

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
  };
}
