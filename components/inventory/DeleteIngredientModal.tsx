"use client";

import { AlertTriangle, Trash2, X, ShieldAlert, Power } from "lucide-react";
import type { Ingredient } from "@/types/inventory";
import type { Product } from "@/data/products";
import { useModalEscape } from "@/lib/use-modal-escape";

interface DeleteIngredientModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  usedInProducts: Product[];
  onClose: () => void;
  onConfirmDelete: () => void;
  onDeactivate: () => void;
}

export default function DeleteIngredientModal({
  isOpen,
  ingredient,
  usedInProducts,
  onClose,
  onConfirmDelete,
  onDeactivate,
}: DeleteIngredientModalProps) {
  useModalEscape(isOpen, onClose);

  if (!isOpen || !ingredient) return null;

  const isUsed = usedInProducts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-ingredient-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white p-6 shadow-2xl transition-all"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
        >
          <X size={16} />
        </button>

        {isUsed ? (
          /* BLOCKED DELETION STATE */
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert size={26} />
            </div>

            <h3 id="delete-ingredient-title" className="mt-4 text-lg font-bold text-[#2b1b12]">
              Cannot Delete Ingredient
            </h3>

            <p className="mt-2 text-xs text-[#66574d] leading-relaxed">
              <span className="font-semibold text-[#2b1b12]">{ingredient.name}</span> is currently used by{" "}
              <span className="font-bold text-[#b46d0e]">
                {usedInProducts.length} product {usedInProducts.length === 1 ? "recipe" : "recipes"}
              </span>
              :
            </p>

            <div className="mt-2 max-h-28 overflow-y-auto space-y-1 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
              {usedInProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 font-medium">
                  <span>{p.image || "☕"}</span>
                  <span>{p.name}</span>
                  <span className="text-[10px] text-amber-700">({p.category})</span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-[#8c7a6c]">
              Deleting this ingredient would break product stock deductions. Remove it from the recipes above or deactivate it instead.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                Close
              </button>

              {ingredient.active && (
                <button
                  type="button"
                  onClick={() => {
                    onDeactivate();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2b1b12] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
                >
                  <Power size={13} />
                  <span>Deactivate Ingredient</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* SAFE CONFIRMATION STATE */
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={26} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#2b1b12]">
              Delete Ingredient?
            </h3>

            <p className="mt-2 text-xs text-[#8c7a6c] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[#2b1b12]">{ingredient.name}</span>{" "}
              ({ingredient.sku})? This ingredient is not used in any recipes. Current stock: {ingredient.currentStock} {ingredient.unit}. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirmDelete();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                <Trash2 size={14} />
                <span>Delete Ingredient</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
