"use client";

import { useState } from "react";
import {
  X,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  AlertCircle,
  Check,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import type { Ingredient, TransactionType } from "@/types/inventory";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onAdjust: (params: {
    ingredientId: string;
    type: TransactionType;
    quantityDelta: number;
    reason?: string;
    reference?: string;
  }) => { success: boolean; error?: string };
}

type Mode = "add" | "remove" | "exact";

const REASON_PRESETS: Record<Mode, string[]> = {
  add: [
    "Supplier Delivery",
    "Internal Transfer In",
    "Inventory Correction",
    "Return to Stock",
  ],
  remove: [
    "Wastage / Spoiled",
    "Spill / Kitchen Damage",
    "Expired Batch",
    "Internal Transfer Out",
    "Return to Supplier",
  ],
  exact: [
    "Routine Physical Stock Count",
    "Monthly Audit Reconciliation",
    "Inventory Re-calibration",
  ],
};

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  ingredient,
  onAdjust,
}: StockAdjustmentModalProps) {
  const [mode, setMode] = useState<Mode>("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen || !ingredient) return null;

  const current = ingredient.currentStock;
  const numQty = parseFloat(quantity) || 0;

  // Compute delta and prospective new stock
  let delta = 0;
  let nextStock = current;

  if (mode === "add") {
    delta = numQty;
    nextStock = current + delta;
  } else if (mode === "remove") {
    delta = -numQty;
    nextStock = current - numQty;
  } else if (mode === "exact") {
    delta = numQty - current;
    nextStock = numQty;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!quantity.trim() || isNaN(numQty)) {
      setError("Please enter a valid numeric quantity.");
      return;
    }

    if (mode !== "exact" && numQty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (nextStock < 0) {
      setError(
        `Resulting stock cannot be negative. Current: ${current} ${ingredient.unit}, Attempted: ${nextStock} ${ingredient.unit}`
      );
      return;
    }

    if (mode === "exact" && delta === 0) {
      setError("Exact stock is identical to current stock. No change needed.");
      return;
    }

    // Determine transaction type
    let txnType: TransactionType = "Adjustment";
    if (mode === "remove" && reason.toLowerCase().includes("wast")) {
      txnType = "Wastage";
    } else if (mode === "remove" && reason.toLowerCase().includes("return")) {
      txnType = "Return";
    }

    const res = onAdjust({
      ingredientId: ingredient.id,
      type: txnType,
      quantityDelta: delta,
      reason: reason.trim() || (mode === "add" ? "Stock Addition" : mode === "remove" ? "Stock Reduction" : "Physical Count"),
      reference: reference.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error || "Failed to adjust stock.");
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
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b1b12]">
                Stock Adjustment
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                {ingredient.name} ({ingredient.sku})
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
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9b897b]">
              Adjustment Mode
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("add");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  mode === "add"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-[#e5dbd0] bg-white text-[#66574d] hover:bg-[#faf7f3]"
                }`}
              >
                <PlusCircle size={14} className="text-emerald-600" />
                <span>Add Stock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("remove");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  mode === "remove"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-[#e5dbd0] bg-white text-[#66574d] hover:bg-[#faf7f3]"
                }`}
              >
                <MinusCircle size={14} className="text-red-500" />
                <span>Remove Stock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("exact");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  mode === "exact"
                    ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                    : "border-[#e5dbd0] bg-white text-[#66574d] hover:bg-[#faf7f3]"
                }`}
              >
                <RotateCcw size={14} />
                <span>Set Exact</span>
              </button>
            </div>
          </div>

          {/* Current vs Prospective Preview Card */}
          <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#8c7a6c]">Current Stock</p>
                <p className="text-lg font-bold text-[#2b1b12]">
                  {current} <span className="text-xs font-normal text-[#8c7a6c]">{ingredient.unit}</span>
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e5dbd0] text-[#9b897b]">
                <ArrowRight size={14} />
              </div>

              <div className="text-right">
                <p className="text-[11px] font-medium text-[#8c7a6c]">New Stock</p>
                <p
                  className={`text-lg font-bold ${
                    nextStock < 0
                      ? "text-red-600"
                      : nextStock <= ingredient.minimumStock
                      ? "text-amber-600"
                      : "text-emerald-700"
                  }`}
                >
                  {isNaN(nextStock) ? current : nextStock}{" "}
                  <span className="text-xs font-normal text-[#8c7a6c]">{ingredient.unit}</span>
                </p>
              </div>
            </div>

            {delta !== 0 && !isNaN(delta) && (
              <div className="mt-3 border-t border-[#e5dbd0] pt-2 text-center text-xs">
                <span className="text-[#8c7a6c]">Change: </span>
                <span
                  className={`font-semibold ${
                    delta > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta} {ingredient.unit}
                </span>
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              {mode === "exact"
                ? `Counted Quantity (${ingredient.unit})`
                : `Quantity to ${mode === "add" ? "Add" : "Remove"} (${ingredient.unit})`}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min={mode === "exact" ? "0" : "0.01"}
              autoFocus
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (error) setError("");
              }}
              placeholder={`Enter amount in ${ingredient.unit}`}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-base font-bold text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] placeholder:font-normal focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

          {/* Reason Input & Presets */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Reason / Explanation
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Weekly stock count, spoiled milk batch..."
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />

            {/* Quick Reason Pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {REASON_PRESETS[mode].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                    reason === preset
                      ? "bg-[#c98b5b] text-white"
                      : "border border-[#e5dbd0] bg-white text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Reference / Note <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ADJ-0917, Audit-Q3"
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

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
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
