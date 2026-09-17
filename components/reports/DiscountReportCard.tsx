"use client";

import React from "react";
import { Tag, Sparkles, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { DiscountAnalyticsSummary } from "@/lib/reports";

interface DiscountReportCardProps {
  analytics: DiscountAnalyticsSummary;
}

export default function DiscountReportCard({
  analytics,
}: DiscountReportCardProps) {
  const {
    totalDiscountGiven,
    discountedOrdersCount,
    averageDiscountPerDiscountedOrder,
    mostUsedDiscount,
    highestValueDiscount,
    discounts,
  } = analytics;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Discount & Promotion Report</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Historical discount redemptions calculated from completed order snapshots
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#b26829]">
            <Tag size={15} />
            <span className="text-xs font-semibold">Total Given</span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#2b1b12]">
            {formatCurrency(totalDiscountGiven)}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">
            Across {discountedOrdersCount} discounted checkouts
          </p>
        </div>

        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#3b6088]">
            <Percent size={15} />
            <span className="text-xs font-semibold">Avg per Order</span>
          </div>
          <p className="mt-2 text-lg font-bold text-[#2b1b12]">
            {formatCurrency(averageDiscountPerDiscountedOrder)}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">Average savings granted</p>
        </div>

        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#3f7a4e]">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">Most Used Promo</span>
          </div>
          <p className="mt-2 truncate text-sm font-bold text-[#2b1b12]">
            {mostUsedDiscount
              ? mostUsedDiscount.code || mostUsedDiscount.name
              : "None"}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">
            {mostUsedDiscount
              ? `${mostUsedDiscount.usageCount} checkouts`
              : "No promo redeemed"}
          </p>
        </div>

        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2 text-[#8a4f28]">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">Highest Value Discount</span>
          </div>
          <p className="mt-2 truncate text-sm font-bold text-[#2b1b12]">
            {highestValueDiscount
              ? highestValueDiscount.code || highestValueDiscount.name
              : "None"}
          </p>
          <p className="text-[10px] text-[#8c7a6c]">
            {highestValueDiscount
              ? formatCurrency(highestValueDiscount.totalDiscountValue)
              : "No promo redeemed"}
          </p>
        </div>
      </div>

      {/* Discount usage breakdown table */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8c7a6c]">
          Promotion Breakdown
        </h4>

        {discounts.length === 0 ? (
          <p className="mt-3 text-xs text-[#a39284]">
            No discounts redeemed in this selected period.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f0e8df] text-[#8c7a6c]">
                  <th className="pb-2.5 pl-1 font-semibold">Discount / Code</th>
                  <th className="pb-2.5 text-center font-semibold">Usage</th>
                  <th className="pb-2.5 pr-1 text-right font-semibold">
                    Total Value Granted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe9]">
                {discounts.map((d, i) => (
                  <tr key={i} className="transition hover:bg-[#faf7f3]">
                    <td className="py-2.5 pl-1 font-medium text-[#2b1b12]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2b1b12]">
                          {d.name}
                        </span>
                        {d.code && (
                          <span className="rounded bg-[#f2e6dc] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#8a4f28]">
                            {d.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-[#6d5b4e]">
                      {d.usageCount} {d.usageCount === 1 ? "order" : "orders"}
                    </td>
                    <td className="py-2.5 pr-1 text-right font-bold text-[#2b1b12]">
                      {formatCurrency(d.totalDiscountValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
