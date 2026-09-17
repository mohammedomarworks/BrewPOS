"use client";

import { useState } from "react";
import {
  X,
  ChefHat,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Package,
  Layers,
} from "lucide-react";
import type { Ingredient, ProductRecipe, RecipeIngredient } from "@/types/inventory";
import type { Product } from "@/data/products";
import { formatCurrency } from "@/lib/settings-store";
import { useModalEscape } from "@/lib/use-modal-escape";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  ingredients: Ingredient[];
  recipes: ProductRecipe[];
  initialProductId?: number;
  onSaveRecipe: (productId: number, ingredients: RecipeIngredient[]) => void;
  onDeleteRecipe: (productId: number) => void;
}

export default function RecipeModal({
  isOpen,
  onClose,
  products,
  ingredients,
  recipes,
  initialProductId,
  onSaveRecipe,
  onDeleteRecipe,
}: RecipeModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number>(
    initialProductId || (products.length > 0 ? products[0].id : 1)
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const existingRecipe = recipes.find((r) => r.productId === selectedProductId);

  // Editable recipe ingredients list
  const [items, setItems] = useState<RecipeIngredient[]>(
    existingRecipe ? [...existingRecipe.ingredients] : []
  );

  // New ingredient entry state
  const [newIngredientId, setNewIngredientId] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<string>("");
  const [error, setError] = useState<string>("");

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const handleProductSelect = (pId: number) => {
    setSelectedProductId(pId);
    const rec = recipes.find((r) => r.productId === pId);
    setItems(rec ? [...rec.ingredients] : []);
    setNewIngredientId("");
    setNewQuantity("");
    setError("");
  };

  // Ingredients available to add (not yet in recipe)
  const availableIngredients = ingredients.filter(
    (ing) => ing.active && !items.some((item) => item.ingredientId === ing.id)
  );

  const handleAddIngredient = () => {
    setError("");
    if (!newIngredientId) {
      setError("Please select an ingredient to add.");
      return;
    }

    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    setItems([...items, { ingredientId: newIngredientId, quantity: qty }]);
    setNewIngredientId("");
    setNewQuantity("");
  };

  const handleUpdateQuantity = (ingredientId: string, qtyStr: string) => {
    const qty = parseFloat(qtyStr);
    setItems((prev) =>
      prev.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, quantity: isNaN(qty) ? 0 : qty }
          : item
      )
    );
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setItems((prev) => prev.filter((item) => item.ingredientId !== ingredientId));
  };

  const handleSave = () => {
    const validItems = items.filter((i) => i.quantity > 0);
    onSaveRecipe(selectedProductId, validItems);
    onClose();
  };

  const handleDelete = () => {
    onDeleteRecipe(selectedProductId);
    setItems([]);
  };

  // Calculate estimated ingredient cost of recipe
  const estimatedCost = items.reduce((sum, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    return sum + (ing ? ing.costPerUnit * item.quantity : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <ChefHat size={18} />
            </div>
            <div>
              <h2 id="recipe-modal-title" className="text-lg font-bold text-[#2b1b12]">
                Recipe & Bill of Materials (BOM)
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                Define raw ingredient consumption per item sold
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Product Selector Bar */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <Package size={13} className="text-[#8c7a6c]" />
              Select Menu Product
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(Number(e.target.value))}
                className="h-11 flex-1 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm font-semibold text-[#2b1b12] outline-none transition focus:border-[#c98b5b] cursor-pointer"
              >
                {products.map((prod) => {
                  const hasRec = recipes.some((r) => r.productId === prod.id && r.ingredients.length > 0);
                  return (
                    <option key={prod.id} value={prod.id}>
                      {prod.image || "☕"} {prod.name} ({prod.category}) — {formatCurrency(prod.price)}{" "}
                      {hasRec ? "✓ Configured" : "— No Recipe"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Product & Cost Overview Card */}
          {selectedProduct && (
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square h-12 items-center justify-center rounded-xl bg-white border border-[#e5dbd0] text-2xl">
                  {selectedProduct.image || "☕"}
                </div>
                <div>
                  <h3 className="font-bold text-[#2b1b12]">{selectedProduct.name}</h3>
                  <p className="text-xs text-[#8c7a6c]">
                    Menu Price: <span className="font-semibold text-[#2b1b12]">{formatCurrency(selectedProduct.price)}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-[#8c7a6c]">Estimated Cost of Goods (COGS)</p>
                <p className="text-lg font-bold text-[#6d4730]">
                  {formatCurrency(estimatedCost)}
                </p>
                {selectedProduct.price > 0 && (
                  <p className="text-[11px] font-medium text-emerald-700">
                    Gross Margin: {(((selectedProduct.price - estimatedCost) / selectedProduct.price) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recipe Ingredients Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9b897b] flex items-center gap-1.5">
                <Layers size={13} />
                Ingredients in Recipe ({items.length})
              </h4>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8cabc] bg-white p-6 text-center">
                <p className="text-xs text-[#8c7a6c]">
                  No ingredients configured for this product yet.
                </p>
                <p className="text-[11px] text-[#9b897b] mt-0.5">
                  Products without recipes are sold as standalone items with no automatic inventory deduction.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#eee5dc]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-4 py-2.5">Ingredient</th>
                      <th className="px-4 py-2.5">Consumption / Sale</th>
                      <th className="px-4 py-2.5 text-right">Cost Contribution</th>
                      <th className="px-4 py-2.5 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ebe3] bg-white">
                    {items.map((item) => {
                      const ing = ingredients.find((i) => i.id === item.ingredientId);
                      const costContrib = ing ? ing.costPerUnit * item.quantity : 0;

                      return (
                        <tr key={item.ingredientId} className="hover:bg-[#faf7f3]/50 transition">
                          <td className="px-4 py-2.5 font-medium text-[#2b1b12]">
                            {ing ? ing.name : item.ingredientId}
                            <span className="block text-[11px] text-[#9b897b]">
                              Current Stock: {ing ? `${ing.currentStock} ${ing.unit}` : "N/A"}
                            </span>
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="any"
                                min="0.01"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.ingredientId, e.target.value)
                                }
                                className="h-8 w-20 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2 text-xs font-semibold text-[#2b1b12] outline-none focus:border-[#c98b5b] focus:bg-white"
                              />
                              <span className="text-xs text-[#8c7a6c]">
                                {ing ? ing.unit : ""}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-2.5 text-right font-medium text-[#6d4730]">
                            {formatCurrency(costContrib)}
                          </td>

                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(item.ingredientId)}
                              className="rounded-lg border border-transparent p-1 text-[#a39284] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Remove Ingredient"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Ingredient to Recipe Bar */}
          {availableIngredients.length > 0 && (
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/60 p-3.5 space-y-2">
              <p className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1">
                <Plus size={13} className="text-[#c98b5b]" />
                Add Ingredient to Recipe
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={newIngredientId}
                  onChange={(e) => setNewIngredientId(e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-[#e5dbd0] bg-white px-3 text-xs font-medium text-[#2b1b12] outline-none focus:border-[#c98b5b] cursor-pointer"
                >
                  <option value="">-- Choose Ingredient --</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit}) — {formatCurrency(ing.costPerUnit)}/unit
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="Qty"
                    className="h-10 w-24 rounded-xl border border-[#e5dbd0] bg-white px-2.5 text-xs text-[#2b1b12] outline-none focus:border-[#c98b5b]"
                  />
                  <span className="text-xs text-[#8c7a6c] shrink-0 min-w-[24px]">
                    {ingredients.find((i) => i.id === newIngredientId)?.unit || ""}
                  </span>

                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="h-10 flex items-center justify-center gap-1 rounded-xl bg-[#2b1b12] px-3.5 text-xs font-semibold text-white transition hover:bg-[#40291d] shrink-0"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div>
            {existingRecipe && existingRecipe.ingredients.length > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Clear Recipe
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] bg-white px-4 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-[#2b1b12] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#40291d]"
            >
              <Check size={14} />
              <span>Save Recipe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
