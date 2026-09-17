"use client";

import React from "react";
import { FolderKanban } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/reports";
import type { CategoryPerformanceItem } from "@/lib/reports";

interface CategoryPerformanceTableProps {
  categories: CategoryPerformanceItem[];
}

export default function CategoryPerformanceTable({
  categories,
}: CategoryPerformanceTableProps) {
  const totalSales = categories.reduce((sum, c) => sum + c.sales, 0);

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Category Performance</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Sales and volume distribution across menu categories
          </p>
        </div>
        <span className="text-xs font-medium text-[#a39284]">
          Total: {formatCurrency(totalSales)}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="flex h-36 flex-col items-center justify-center text-center">
          <FolderKanban size={26} className="text-[#cbb8a8]" />
          <p className="mt-2 text-xs text-[#8c7a6c]">
            No category transactions recorded for this period
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5 transition hover:border-[#e0d3c5]"
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#2b1b12]">
                    {cat.category}
                  </span>
                  <p className="text-[11px] text-[#8c7a6c]">
                    {cat.itemsSold.toLocaleString()} items sold
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2b1b12]">
                    {formatCurrency(cat.sales)}
                  </span>
                  <p className="font-semibold text-[#c98b5b]">
                    {formatPercent(cat.percentageOfSales)}
                  </p>
                </div>
              </div>

              {/* Progress track */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8dfd4]/60">
                <div
                  className="h-full rounded-full bg-[#c98b5b] transition-all duration-500"
                  style={{ width: `${Math.min(100, cat.percentageOfSales)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
