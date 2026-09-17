export type InventoryUnit = "g" | "kg" | "ml" | "L" | "pcs";

export type StockStatus = "Healthy" | "Low Stock" | "Out of Stock";

export interface Ingredient {
  id: string; // e.g. "ING-COF-001"
  name: string;
  sku: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  costPerUnit: number; // in BDT (৳)
  supplier?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | "Purchase"
  | "Sale Consumption"
  | "Adjustment"
  | "Wastage"
  | "Return";

export interface StockTransaction {
  id: string; // e.g. "TXN-00001"
  ingredientId: string;
  type: TransactionType;
  quantity: number; // positive for additions, negative for deductions
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string; // e.g. order number "COF-2026-00001", PO reference
  createdAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // in the ingredient's unit
}

export interface ProductRecipe {
  productId: number; // references Product.id
  ingredients: RecipeIngredient[];
  updatedAt: string;
}

export type IngredientInput = Omit<Ingredient, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
