"use client";

import { useState, useMemo } from "react";
import {
  X,
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  ShoppingCart,
  Truck,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import type { StockTransaction, Ingredient, TransactionType } from "@/types/inventory";

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: StockTransaction[];
  ingredients: Ingredient[];
  initialIngredientId?: string;
}

function renderTypeIcon(type: TransactionType) {
  switch (type) {
    case "Purchase":
      return <Truck size={14} className="text-blue-600" />;
    case "Sale Consumption":
      return <ShoppingCart size={14} className="text-purple-600" />;
    case "Wastage":
      return <Trash2 size={14} className="text-red-600" />;
    case "Adjustment":
      return <SlidersHorizontal size={14} className="text-amber-600" />;
    case "Return":
      return <RotateCcw size={14} className="text-emerald-600" />;
    default:
      return <History size={14} className="text-gray-600" />;
  }
}

export default function InventoryHistoryModal({
  isOpen,
  onClose,
  transactions,
  ingredients,
  initialIngredientId,
}: InventoryHistoryModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState(
    initialIngredientId || "All"
  );
  const [selectedType, setSelectedType] = useState<string>("All");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const ing = ingredients.find((i) => i.id === t.ingredientId);
      const ingName = ing ? ing.name.toLowerCase() : "";

      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        ingName.includes(term) ||
        (t.reference && t.reference.toLowerCase().includes(term)) ||
        (t.reason && t.reason.toLowerCase().includes(term));

      const matchesIngredient =
        selectedIngredientId === "All" || t.ingredientId === selectedIngredientId;

      const matchesType =
        selectedType === "All" || t.type === selectedType;

      return matchesSearch && matchesIngredient && matchesType;
    });
  }, [transactions, ingredients, search, selectedIngredientId, selectedType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2b1b12]">
                  Stock Movement History
                </h2>
                <span className="rounded-md border border-[#e8dfd4] bg-white px-2 py-0.5 text-xs font-semibold text-[#6d4730]">
                  {transactions.length} total entries
                </span>
              </div>
              <p className="text-xs text-[#8c7a6c]">
                Complete audit trail of stock sales, adjustments, and receipts
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

        {/* Filters Bar */}
        <div className="border-b border-[#eee5dc] p-4 bg-[#faf7f3]/50">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ingredient, order ref (e.g. COF-...), or reason..."
                className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-white pl-9 pr-3 text-xs text-[#2b1b12] outline-none placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="h-10 rounded-xl border border-[#e5dbd0] bg-white px-3 text-xs font-medium text-[#66574d] outline-none focus:border-[#c98b5b]"
              >
                <option value="All">All Ingredients</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 rounded-xl border border-[#e5dbd0] bg-white px-3 text-xs font-medium text-[#66574d] outline-none focus:border-[#c98b5b]"
              >
                <option value="All">All Types</option>
                <option value="Purchase">Purchase</option>
                <option value="Sale Consumption">Sale Consumption</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Wastage">Wastage</option>
                <option value="Return">Return</option>
              </select>

              {(search || selectedIngredientId !== "All" || selectedType !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedIngredientId("All");
                    setSelectedType("All");
                  }}
                  className="flex h-10 items-center gap-1 rounded-xl border border-[#e5dbd0] bg-white px-2.5 text-xs text-[#8c7a6c] hover:bg-[#faf7f3]"
                  title="Reset filters"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8cabc] bg-[#faf7f3]/50 p-12 text-center">
              <History size={28} className="mx-auto text-[#9b897b]" />
              <p className="mt-3 font-medium text-sm text-[#2b1b12]">
                No transactions recorded
              </p>
              <p className="mt-1 text-xs text-[#8c7a6c]">
                Stock movements from POS sales, stock additions, and audits will be logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#eee5dc]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Change</th>
                    <th className="px-4 py-3 text-right">Stock Level</th>
                    <th className="px-4 py-3">Reason / Order Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebe3] bg-white">
                  {filteredTransactions.map((t) => {
                    const ing = ingredients.find((i) => i.id === t.ingredientId);
                    const unit = ing ? ing.unit : "";
                    const isAddition = t.quantity > 0;

                    return (
                      <tr key={t.id} className="hover:bg-[#faf7f3]/60 transition">
                        <td className="px-4 py-3 text-[#8c7a6c] whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#2b1b12]">
                          {ing ? ing.name : t.ingredientId}
                          <span className="block font-mono text-[10px] text-[#9b897b]">
                            {t.ingredientId}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#2b1b12]">
                            {renderTypeIcon(t.type)}
                            <span>{t.type}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center font-bold ${
                              isAddition ? "text-emerald-700" : "text-red-600"
                            }`}
                          >
                            {isAddition ? (
                              <ArrowUpRight size={13} className="inline mr-0.5" />
                            ) : (
                              <ArrowDownRight size={13} className="inline mr-0.5" />
                            )}
                            {isAddition ? `+${t.quantity}` : t.quantity} {unit}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap text-[#66574d]">
                          <span className="text-[#8c7a6c]">{t.previousStock}</span>
                          <span className="mx-1 text-[#9b897b]">→</span>
                          <span className="font-bold text-[#2b1b12]">{t.newStock} {unit}</span>
                        </td>

                        <td className="px-4 py-3 text-[#66574d]">
                          <p className="font-medium text-[#2b1b12] truncate max-w-[200px]">
                            {t.reason || "—"}
                          </p>
                          {t.reference && (
                            <span className="inline-block font-mono text-[11px] text-[#c98b5b] font-semibold">
                              Ref: {t.reference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#40291d]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
