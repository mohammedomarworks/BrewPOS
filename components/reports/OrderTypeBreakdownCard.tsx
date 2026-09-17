"use client";

import React from "react";
import { Store, ShoppingBag, Truck } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/reports";
import type { OrderTypeBreakdownItem } from "@/lib/reports";
import type { OrderType } from "@/types/pos";

interface OrderTypeBreakdownCardProps {
  items: OrderTypeBreakdownItem[];
}

function getOrderTypeIcon(type: OrderType) {
  switch (type) {
    case "Dine In":
      return <Store size={18} className="text-[#8a4f28]" />;
    case "Take Away":
      return <ShoppingBag size={18} className="text-[#3b6088]" />;
    case "Delivery":
      return <Truck size={18} className="text-[#3f7a4e]" />;
  }
}

function getOrderTypeBadgeBg(type: OrderType) {
  switch (type) {
    case "Dine In":
      return "bg-[#f2e6dc]";
    case "Take Away":
      return "bg-[#edf2f7]";
    case "Delivery":
      return "bg-[#edf6ee]";
  }
}

export default function OrderTypeBreakdownCard({
  items,
}: OrderTypeBreakdownCardProps) {
  const totalSales = items.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Sales by Order Type</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Dine In vs. Take Away vs. Delivery breakdown
          </p>
        </div>
        <span className="text-xs font-medium text-[#a39284]">
          Total: {formatCurrency(totalSales)}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.type}
            className="flex flex-col justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-4 transition hover:border-[#e0d3c5]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${getOrderTypeBadgeBg(
                    item.type
                  )}`}
                >
                  {getOrderTypeIcon(item.type)}
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#c98b5b] shadow-xs">
                  {formatPercent(item.percentage)}
                </span>
              </div>

              <h4 className="mt-3 text-sm font-semibold text-[#2b1b12]">
                {item.type}
              </h4>
              <p className="mt-0.5 text-xs text-[#8c7a6c]">
                {item.orders} {item.orders === 1 ? "order" : "orders"}
              </p>
            </div>

            <div className="mt-4 border-t border-[#f0e8df] pt-3">
              <p className="text-base font-bold text-[#2b1b12]">
                {formatCurrency(item.sales)}
              </p>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8dfd4]/60">
                <div
                  className="h-full rounded-full bg-[#2b1b12] transition-all duration-500"
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
