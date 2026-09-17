"use client";

import React, { useState } from "react";
import { ArrowUpDown, Coffee, Award } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/reports";
import type { TopProductItem } from "@/lib/reports";

interface TopProductsTableProps {
  products: TopProductItem[];
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
  const [sortBy, setSortBy] = useState<"revenue" | "quantity">("revenue");

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "quantity") {
      return b.quantitySold - a.quantitySold || b.revenue - a.revenue;
    }
    return b.revenue - a.revenue || b.quantitySold - a.quantitySold;
  });

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Top Selling Products</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Performance breakdown by item volume and revenue contribution
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8c7a6c]">Sort by:</span>
          <div className="flex rounded-xl border border-[#e8dfd4] bg-[#faf7f3] p-1">
            <button
              type="button"
              onClick={() => setSortBy("revenue")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                sortBy === "revenue"
                  ? "bg-[#2b1b12] text-white shadow-xs"
                  : "text-[#6d5b4e] hover:text-[#2b1b12]"
              }`}
            >
              Revenue (৳)
            </button>
            <button
              type="button"
              onClick={() => setSortBy("quantity")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                sortBy === "quantity"
                  ? "bg-[#2b1b12] text-white shadow-xs"
                  : "text-[#6d5b4e] hover:text-[#2b1b12]"
              }`}
            >
              Quantity Sold
            </button>
          </div>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <Coffee size={28} className="text-[#cbb8a8]" />
          <p className="mt-2 text-xs font-medium text-[#8c7a6c]">
            No product sales recorded in this interval
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0e8df] text-[#8c7a6c]">
                <th className="pb-3 pl-2 font-semibold">Rank & Product</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => setSortBy("quantity")}
                    className="inline-flex items-center gap-1 hover:text-[#2b1b12]"
                  >
                    <span>Quantity Sold</span>
                    <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="pb-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => setSortBy("revenue")}
                    className="inline-flex items-center gap-1 hover:text-[#2b1b12]"
                  >
                    <span>Revenue</span>
                    <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="pb-3 pr-2 text-right font-semibold">Sales Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {sortedProducts.map((p, idx) => {
                const isTopThree = idx < 3;
                return (
                  <tr
                    key={p.productId}
                    className="group transition hover:bg-[#faf7f3]"
                  >
                    <td className="py-3.5 pl-2 font-medium text-[#2b1b12]">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                            isTopThree
                              ? "bg-[#c98b5b] text-white"
                              : "bg-[#efe8e0] text-[#6d5b4e]"
                          }`}
                        >
                          {idx === 0 ? <Award size={13} /> : idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#2b1b12]">{p.name}</p>
                          <p className="text-[10px] text-[#a39284]">
                            ৳{p.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-[#8c7a6c]">
                      <span className="rounded-md bg-[#faf7f3] px-2 py-0.5 text-[11px] font-medium text-[#6d5b4e]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-semibold text-[#2b1b12]">
                      {p.quantitySold.toLocaleString()} pcs
                    </td>

                    <td className="py-3.5 text-right font-bold text-[#2b1b12]">
                      {formatCurrency(p.revenue)}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-[#c98b5b]">
                          {formatPercent(p.percentageOfSales)}
                        </span>
                        <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-[#e8dfd4]/60 sm:block">
                          <div
                            className="h-full rounded-full bg-[#c98b5b]"
                            style={{
                              width: `${Math.min(100, p.percentageOfSales)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
