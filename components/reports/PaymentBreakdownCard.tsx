"use client";

import React from "react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/reports";
import type { PaymentBreakdownItem } from "@/lib/reports";
import type { PaymentMethod } from "@/types/pos";

interface PaymentBreakdownCardProps {
  items: PaymentBreakdownItem[];
}

function getPaymentIcon(method: PaymentMethod) {
  switch (method) {
    case "cash":
      return <Banknote size={18} className="text-[#3f7a4e]" />;
    case "card":
      return <CreditCard size={18} className="text-[#3b6088]" />;
    case "mobile":
      return <Smartphone size={18} className="text-[#b26829]" />;
  }
}

function getPaymentBadgeBg(method: PaymentMethod) {
  switch (method) {
    case "cash":
      return "bg-[#edf6ee]";
    case "card":
      return "bg-[#edf2f7]";
    case "mobile":
      return "bg-[#fcf0e4]";
  }
}

export default function PaymentBreakdownCard({
  items,
}: PaymentBreakdownCardProps) {
  const totalSales = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Payment Methods</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Sales distribution across payment channels
          </p>
        </div>
        <span className="text-xs font-medium text-[#a39284]">
          Total: {formatCurrency(totalSales)}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          return (
            <div
              key={item.method}
              className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-4 transition hover:border-[#e0d3c5]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${getPaymentBadgeBg(
                      item.method
                    )}`}
                  >
                    {getPaymentIcon(item.method)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2b1b12]">
                      {item.label}
                    </h4>
                    <p className="text-xs text-[#8c7a6c]">
                      {item.orders} {item.orders === 1 ? "order" : "orders"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#2b1b12]">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs font-semibold text-[#c98b5b]">
                    {formatPercent(item.percentage)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e8dfd4]/60">
                <div
                  className="h-full rounded-full bg-[#c98b5b] transition-all duration-500"
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
