"use client";

import React from "react";
import { Package, AlertTriangle, XCircle, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { InventoryAnalyticsSummary } from "@/lib/reports";

interface InventoryAnalyticsCardProps {
  summary: InventoryAnalyticsSummary;
}

export default function InventoryAnalyticsCard({
  summary,
}: InventoryAnalyticsCardProps) {
  const {
    totalInventoryValue,
    lowStockItemsCount,
    outOfStockItemsCount,
    consumedIngredients,
  } = summary;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Inventory Analytics</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Stock valuation and raw ingredient consumption from sales
          </p>
        </div>
      </div>

      {/* Valuation and stock alert indicators */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#8a4f28]">
            <Package size={15} />
            <span className="text-xs font-semibold">Total Stock Value</span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#2b1b12]">
            {formatCurrency(totalInventoryValue)}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">Current on-hand valuation</p>
        </div>

        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#b26829]">
            <AlertTriangle size={15} />
            <span className="text-xs font-semibold">Low Stock Items</span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#b26829]">
            {lowStockItemsCount}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">At or below reorder threshold</p>
        </div>

        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#a83232]">
            <XCircle size={15} />
            <span className="text-xs font-semibold">Out of Stock Items</span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#a83232]">
            {outOfStockItemsCount}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">Requires immediate replenishment</p>
        </div>
      </div>

      {/* Ingredient Consumption Table */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8c7a6c]">
          <Scale size={13} className="text-[#c98b5b]" />
          <span>Stock Consumed In Selected Period</span>
        </div>

        {consumedIngredients.length === 0 ? (
          <p className="mt-3 text-xs text-[#a39284]">
            No inventory deduction transactions recorded for this period.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {consumedIngredients.slice(0, 6).map((item) => (
              <div
                key={item.ingredientId}
                className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] px-3.5 py-2.5 text-xs"
              >
                <div>
                  <p className="font-semibold text-[#2b1b12]">{item.name}</p>
                  <p className="text-[10px] text-[#8c7a6c]">
                    SKU: {item.ingredientId}
                  </p>
                </div>
                <span className="rounded-lg bg-white px-2.5 py-1 font-bold text-[#8a4f28] shadow-xs">
                  {item.displayQuantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
