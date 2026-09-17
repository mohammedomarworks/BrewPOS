"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { PaymentMethod, OrderType } from "@/types/pos";
import type { Category } from "@/data/products";

interface ReportFiltersProps {
  paymentMethod: "all" | PaymentMethod;
  onPaymentMethodChange: (method: "all" | PaymentMethod) => void;
  orderType: "all" | OrderType;
  onOrderTypeChange: (type: "all" | OrderType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
  onReset: () => void;
}

export default function ReportFilters({
  paymentMethod,
  onPaymentMethodChange,
  orderType,
  onOrderTypeChange,
  category,
  onCategoryChange,
  categories,
  onReset,
}: ReportFiltersProps) {
  const hasActiveFilters =
    paymentMethod !== "all" || orderType !== "all" || category !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e8dfd4] bg-white p-3 text-xs shadow-[0_2px_8px_rgba(72,48,32,0.03)] print:hidden">
      <div className="flex items-center gap-1.5 font-semibold text-[#6d5b4e]">
        <Filter size={14} className="text-[#c98b5b]" />
        <span>Filters:</span>
      </div>

      {/* Payment Method Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-payment" className="text-[#8c7a6c]">
          Payment:
        </label>
        <select
          id="filter-payment"
          value={paymentMethod}
          onChange={(e) =>
            onPaymentMethodChange(e.target.value as "all" | PaymentMethod)
          }
          className="h-8 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 font-medium text-[#2b1b12] outline-none transition hover:border-[#c98b5b] focus:border-[#c98b5b]"
        >
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>

      {/* Order Type Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-type" className="text-[#8c7a6c]">
          Type:
        </label>
        <select
          id="filter-type"
          value={orderType}
          onChange={(e) =>
            onOrderTypeChange(e.target.value as "all" | OrderType)
          }
          className="h-8 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 font-medium text-[#2b1b12] outline-none transition hover:border-[#c98b5b] focus:border-[#c98b5b]"
        >
          <option value="all">All Types</option>
          <option value="Dine In">Dine In</option>
          <option value="Take Away">Take Away</option>
          <option value="Delivery">Delivery</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-category" className="text-[#8c7a6c]">
          Category:
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-8 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 font-medium text-[#2b1b12] outline-none transition hover:border-[#c98b5b] focus:border-[#c98b5b]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button if any filter is applied */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8c7a6c] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
        >
          <RotateCcw size={12} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
