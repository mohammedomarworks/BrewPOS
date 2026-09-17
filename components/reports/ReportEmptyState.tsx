"use client";

import React from "react";
import Link from "next/link";
import { Coffee, ShoppingCart, RotateCcw } from "lucide-react";

interface ReportEmptyStateProps {
  periodLabel: string;
  hasFilters: boolean;
  onResetFilters?: () => void;
}

export default function ReportEmptyState({
  periodLabel,
  hasFilters,
  onResetFilters,
}: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8dfd4] bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(72,48,32,0.02)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faf7f3] text-[#c98b5b] shadow-xs">
        <Coffee size={32} strokeWidth={1.8} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#2b1b12]">
        No sales data for this period
      </h3>

      <p className="mt-2 max-w-md text-xs text-[#8c7a6c]">
        {hasFilters
          ? `There are no completed orders matching your selected filters during ${periodLabel}. Try adjusting your filter parameters or resetting them.`
          : `No completed customer transactions were recorded for ${periodLabel}. This report will automatically populate as new orders are completed at the checkout register.`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {hasFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2 text-xs font-semibold text-[#2b1b12] shadow-xs transition hover:bg-[#faf7f3]"
          >
            <RotateCcw size={13} />
            <span>Reset Active Filters</span>
          </button>
        )}

        <Link
          href="/pos"
          className="flex items-center gap-1.5 rounded-xl bg-[#c98b5b] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#b07345]"
        >
          <ShoppingCart size={13} />
          <span>Open POS Register</span>
        </Link>
      </div>
    </div>
  );
}
