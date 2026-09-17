"use client";

import { useState } from "react";
import {
  X,
  Truck,
  DollarSign,
  AlertCircle,
  Check,
  Package,
} from "lucide-react";
import type { Ingredient } from "@/types/inventory";

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  initialIngredientId?: string;
  onReceive: (params: {
    ingredientId: string;
    quantity: number;
    costPerUnit?: number;
    supplier?: string;
    reference?: string;
  }) => { success: boolean; error?: string };
}

export default function ReceiveStockModal({
  isOpen,
  onClose,
  ingredients,
  initialIngredientId,
  onReceive,
}: ReceiveStockModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialIngredientId || (ingredients.length > 0 ? ingredients[0].id : "")
  );

  const selectedIngredient = ingredients.find((i) => i.id === selectedId);

  const [quantity, setQuantity] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<string>(
    selectedIngredient ? String(selectedIngredient.costPerUnit) : ""
  );
  const [supplier, setSupplier] = useState<string>(
    selectedIngredient?.supplier || ""
  );
  const [reference, setReference] = useState<string>(() => {
    return `PO-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleIngredientChange = (newId: string) => {
    setSelectedId(newId);
    const ing = ingredients.find((i) => i.id === newId);
    if (ing) {
      setCostPerUnit(String(ing.costPerUnit));
      if (ing.supplier) setSupplier(ing.supplier);
    }
  };

  const numQty = parseFloat(quantity) || 0;
  const numCost = parseFloat(costPerUnit) || 0;
  const totalShipmentCost = numQty * numCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedId) {
      setError("Please select an ingredient.");
      return;
    }

    if (!quantity.trim() || isNaN(numQty) || numQty <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    const res = onReceive({
      ingredientId: selectedId,
      quantity: numQty,
      costPerUnit: !isNaN(numCost) && numCost > 0 ? numCost : undefined,
      supplier: supplier.trim() || undefined,
      reference: reference.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error || "Failed to receive stock.");
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b1b12]">Receive Stock</h2>
              <p className="text-xs text-[#8c7a6c]">
                Record inventory replenishment from suppliers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ingredient Selector */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <Package size={13} className="text-[#8c7a6c]" />
              Select Ingredient <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleIngredientChange(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm font-medium text-[#2b1b12] outline-none transition focus:border-[#c98b5b] cursor-pointer"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.sku}) — Current: {ing.currentStock} {ing.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Grid: Quantity & Cost per Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12]">
                Quantity to Add ({selectedIngredient?.unit || "units"}){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                autoFocus
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5000"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-base font-bold text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] placeholder:font-normal focus:border-[#c98b5b] focus:bg-white"
              />
            </div>

            {/* Cost per Unit */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1">
                <DollarSign size={12} className="text-[#8c7a6c]" />
                Cost / Unit (৳)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="0.00"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Supplier / Vendor
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. BeanCraft Roasters, Local Coffee Supplier"
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

          {/* Reference PO */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              PO / Invoice Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PO-5819, INV-2026-081"
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

          {/* Summary Preview Box */}
          {selectedIngredient && numQty > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
              <div className="flex justify-between items-center">
                <span>Stock After Receive:</span>
                <span className="font-bold text-sm">
                  {selectedIngredient.currentStock + numQty} {selectedIngredient.unit}
                </span>
              </div>
              {numCost > 0 && (
                <div className="flex justify-between items-center mt-1 text-emerald-800">
                  <span>Total Shipment Value:</span>
                  <span className="font-bold">৳{totalShipmentCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee5dc]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] bg-white px-5 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#40291d]"
            >
              <Check size={14} />
              <span>Receive Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
