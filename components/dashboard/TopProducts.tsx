"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Coffee, ArrowRight } from "lucide-react";
import { formatCurrency, getTopProducts } from "@/lib/reports";
import type { CompletedOrder } from "@/types/pos";

interface TopProductsProps {
  orders: CompletedOrder[];
}

export default function TopProducts({ orders }: TopProductsProps) {
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "Completed"),
    [orders]
  );

  const topItems = useMemo(
    () => getTopProducts(completedOrders, "revenue").slice(0, 4),
    [completedOrders]
  );

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Top Products</h3>
          <p className="mt-1 text-sm text-[#8c7a6c]">Best selling items</p>
        </div>

        <Link
          href="/reports"
          className="flex items-center gap-1 text-xs font-semibold text-[#c98b5b] transition hover:text-[#2b1b12]"
        >
          <span>All reports</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {topItems.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center text-center">
          <Coffee size={28} className="text-[#cbb8a8]" />
          <p className="mt-2 text-xs font-medium text-[#8c7a6c]">
            No sales recorded yet
          </p>
          <p className="mt-1 text-[11px] text-[#a39284]">
            Top items will appear once orders are placed at the POS.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3.5">
          {topItems.map((item, index) => (
            <div
              key={item.productId}
              className="flex items-center justify-between rounded-xl bg-[#faf7f3] p-3 transition hover:bg-[#f5efe8]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ead8c7] text-sm font-semibold text-[#6d4730]">
                  {index + 1}
                </div>

                <div>
                  <p className="text-sm font-medium text-[#2b1b12]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#9b897b]">
                    {item.quantitySold} {item.quantitySold === 1 ? "unit" : "units"} sold
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-[#6d4730]">
                {formatCurrency(item.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
