"use client";

import { useSyncExternalStore } from "react";
import type { ProductRecipe, RecipeIngredient, Ingredient } from "@/types/inventory";
import type { CartItem, CompletedOrder } from "@/types/pos";
import { getIngredients, adjustStock } from "@/lib/inventory";

const RECIPES_STORAGE_KEY = "brewpos_recipes_v1";
const RECIPES_EVENT = "brewpos:recipes-updated";

export const initialRecipes: ProductRecipe[] = [
  // 1. Cappuccino
  {
    productId: 1,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 18 }, // 18g Coffee Beans
      { ingredientId: "ING-MLK-002", quantity: 180 }, // 180ml Milk
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 2. Americano
  {
    productId: 2,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 18 }, // 18g Coffee Beans
      { ingredientId: "ING-WTR-007", quantity: 220 }, // 220ml Water
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 3. Caffe Latte
  {
    productId: 3,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 18 }, // 18g Coffee Beans
      { ingredientId: "ING-MLK-002", quantity: 220 }, // 220ml Milk
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 4. Mocha
  {
    productId: 4,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 18 }, // 18g Coffee Beans
      { ingredientId: "ING-MLK-002", quantity: 180 }, // 180ml Milk
      { ingredientId: "ING-CHO-004", quantity: 20 }, // 20ml Chocolate Syrup
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 5. Iced Latte
  {
    productId: 5,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 18 }, // 18g Coffee Beans
      { ingredientId: "ING-MLK-002", quantity: 220 }, // 220ml Milk
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 6. Cold Brew
  {
    productId: 6,
    ingredients: [
      { ingredientId: "ING-COF-001", quantity: 25 }, // 25g Coffee Beans
      { ingredientId: "ING-WTR-007", quantity: 200 }, // 200ml Water
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 7. Butter Croissant
  {
    productId: 7,
    ingredients: [
      { ingredientId: "ING-CRO-010", quantity: 1 }, // 1 pcs
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  // 8. Blueberry Muffin
  {
    productId: 8,
    ingredients: [
      { ingredientId: "ING-MUF-011", quantity: 1 }, // 1 pcs
    ],
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
];

/**
 * Retrieve recipes from localStorage or fallback to initial seed.
 */
export function getRecipes(): ProductRecipe[] {
  if (typeof window === "undefined") {
    return initialRecipes;
  }

  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(initialRecipes));
      return initialRecipes;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return Array.isArray(parsed) ? parsed : initialRecipes;
  } catch (error) {
    console.error("Failed to read recipes from localStorage:", error);
    return initialRecipes;
  }
}

/**
 * Persist recipes array and broadcast update.
 */
export function saveRecipes(recipes: ProductRecipe[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
    window.dispatchEvent(new CustomEvent(RECIPES_EVENT));
  } catch (error) {
    console.error("Failed to save recipes to localStorage:", error);
  }
}

/**
 * Retrieve recipe for a specific product ID.
 */
export function getRecipeByProductId(productId: number): ProductRecipe | undefined {
  const recipes = getRecipes();
  return recipes.find((r) => r.productId === productId);
}

/**
 * Calculate the total Cost of Goods Sold (COGS) for a product's recipe.
 */
export function calculateRecipeCost(
  recipeIngredients: RecipeIngredient[],
  ingredientsList?: Ingredient[]
): number {
  const ingredients = ingredientsList || getIngredients();
  return recipeIngredients.reduce((sum, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    return sum + (ing ? ing.costPerUnit * item.quantity : 0);
  }, 0);
}

/**
 * Save or update recipe for a product.
 */
export function saveRecipe(
  productId: number,
  ingredients: RecipeIngredient[]
): ProductRecipe {
  const current = getRecipes();
  const now = new Date().toISOString();
  const filtered = current.filter((r) => r.productId !== productId);

  const newRecipe: ProductRecipe = {
    productId,
    ingredients: ingredients.filter((i) => i.quantity > 0),
    updatedAt: now,
  };

  saveRecipes([newRecipe, ...filtered]);
  return newRecipe;
}

/**
 * Delete recipe for a product.
 */
export function deleteRecipe(productId: number): boolean {
  const current = getRecipes();
  const filtered = current.filter((r) => r.productId !== productId);
  if (filtered.length !== current.length) {
    saveRecipes(filtered);
    return true;
  }
  return false;
}

/**
 * Check whether an ingredient is used in any product recipes.
 */
export function isIngredientUsedInAnyRecipe(ingredientId: string): {
  used: boolean;
  productIds: number[];
} {
  const recipes = getRecipes();
  const matchingProductIds: number[] = [];

  for (const recipe of recipes) {
    if (recipe.ingredients.some((i) => i.ingredientId === ingredientId)) {
      matchingProductIds.push(recipe.productId);
    }
  }

  return {
    used: matchingProductIds.length > 0,
    productIds: matchingProductIds,
  };
}

/**
 * Check if sufficient ingredient stock exists to prepare N units of a product.
 * NOTE: If no recipe exists, product is not inventory-controlled and canFulfill is true.
 */
export function checkProductStock(
  productId: number,
  quantity: number = 1,
  ingredientsList?: Ingredient[]
): {
  canFulfill: boolean;
  missingIngredients: {
    ingredientId: string;
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }[];
} {
  const recipe = getRecipeByProductId(productId);
  if (!recipe || recipe.ingredients.length === 0) {
    return { canFulfill: true, missingIngredients: [] };
  }

  const ingredients = ingredientsList || getIngredients();
  const missing: {
    ingredientId: string;
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }[] = [];

  for (const item of recipe.ingredients) {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    const required = item.quantity * quantity;
    const available = ing ? ing.currentStock : 0;

    if (!ing || available < required) {
      missing.push({
        ingredientId: item.ingredientId,
        ingredientName: ing ? ing.name : "Unknown Ingredient",
        required,
        available,
        unit: ing ? ing.unit : "units",
      });
    }
  }

  return {
    canFulfill: missing.length === 0,
    missingIngredients: missing,
  };
}

/**
 * Check if the entire cart can be fulfilled with current inventory stock.
 * Aggregates overall requirement per ingredient across all items in cart.
 */
export function checkCartStock(
  cart: CartItem[],
  ingredientsList?: Ingredient[]
): {
  canFulfill: boolean;
  deficits: {
    productName: string;
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }[];
} {
  const ingredients = ingredientsList || getIngredients();
  const recipes = getRecipes();

  // Aggregate total ingredient demand across cart
  const demandMap = new Map<string, { required: number; productNames: Set<string> }>();

  for (const cartItem of cart) {
    const recipe = recipes.find((r) => r.productId === cartItem.id);
    if (!recipe) continue; // Products without recipe are permitted

    for (const ri of recipe.ingredients) {
      const current = demandMap.get(ri.ingredientId) || {
        required: 0,
        productNames: new Set<string>(),
      };
      current.required += ri.quantity * cartItem.quantity;
      current.productNames.add(cartItem.name);
      demandMap.set(ri.ingredientId, current);
    }
  }

  const deficits: {
    productName: string;
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }[] = [];

  for (const [ingredientId, demand] of demandMap.entries()) {
    const ing = ingredients.find((i) => i.id === ingredientId);
    const available = ing ? ing.currentStock : 0;

    if (!ing || available < demand.required) {
      deficits.push({
        productName: Array.from(demand.productNames).join(", "),
        ingredientName: ing ? ing.name : "Unknown Ingredient",
        required: demand.required,
        available,
        unit: ing ? ing.unit : "units",
      });
    }
  }

  return {
    canFulfill: deficits.length === 0,
    deficits,
  };
}

/**
 * Automatic sale stock deduction:
 * Deducts recipe ingredients for all items in a completed order.
 * Creates "Sale Consumption" stock transactions referencing orderNumber.
 */
export function deductStockForOrder(order: CompletedOrder): {
  success: boolean;
  error?: string;
} {
  const recipes = getRecipes();

  for (const item of order.items) {
    const recipe = recipes.find((r) => r.productId === item.id);
    if (!recipe || recipe.ingredients.length === 0) {
      continue;
    }

    for (const ri of recipe.ingredients) {
      const consumption = ri.quantity * item.quantity;
      adjustStock({
        ingredientId: ri.ingredientId,
        type: "Sale Consumption",
        quantityDelta: -consumption,
        reason: `Order ${order.orderNumber} (${item.quantity}x ${item.name})`,
        reference: order.orderNumber,
      });
    }
  }

  return { success: true };
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for real-time reactivity
// ----------------------------------------------------------------------

let cachedRecipes: ProductRecipe[] = [];
let cachedRecipesRaw: string | null = null;

function subscribeRecipes(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(RECIPES_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(RECIPES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getRecipesSnapshot(): ProductRecipe[] {
  if (typeof window === "undefined") return initialRecipes;

  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(initialRecipes));
      cachedRecipes = initialRecipes;
      cachedRecipesRaw = JSON.stringify(initialRecipes);
      return cachedRecipes;
    }
    if (raw !== cachedRecipesRaw) {
      cachedRecipesRaw = raw;
      cachedRecipes = JSON.parse(raw);
    }
    return cachedRecipes;
  } catch {
    return initialRecipes;
  }
}

function getRecipesServerSnapshot(): ProductRecipe[] {
  return initialRecipes;
}

export function useRecipesStore() {
  const recipes = useSyncExternalStore(
    subscribeRecipes,
    getRecipesSnapshot,
    getRecipesServerSnapshot
  );

  return {
    recipes,
    isLoaded: true,
    getRecipeByProductId,
    saveRecipe,
    deleteRecipe,
    isIngredientUsedInAnyRecipe,
    checkProductStock,
    checkCartStock,
    deductStockForOrder,
  };
}
