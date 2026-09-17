"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Check,
  ChefHat,
  BellRing,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { formatPercent } from "@/lib/reports";
import type { OrderStatusCountItem } from "@/lib/reports";
import type { OrderStatus } from "@/types/pos";

interface OrderStatusBreakdownCardProps {
  statuses: OrderStatusCountItem[];
}

function getStatusBadgeDetails(status: OrderStatus) {
  switch (status) {
    case "Completed":
      return {
        icon: CheckCircle2,
        bg: "bg-[#edf6ee]",
        textColor: "text-[#3f7a4e]",
        border: "border-[#d1e7d4]",
      };
    case "Pending":
      return {
        icon: Clock,
        bg: "bg-[#fef6e7]",
        textColor: "text-[#a07418]",
        border: "border-[#f7e4be]",
      };
    case "Confirmed":
      return {
        icon: Check,
        bg: "bg-[#edf2f7]",
        textColor: "text-[#3b6088]",
        border: "border-[#d0dbe6]",
      };
    case "Preparing":
      return {
        icon: ChefHat,
        bg: "bg-[#f2e6dc]",
        textColor: "text-[#8a4f28]",
        border: "border-[#e0cebf]",
      };
    case "Ready":
      return {
        icon: BellRing,
        bg: "bg-[#f5eefb]",
        textColor: "text-[#7a48a3]",
        border: "border-[#e4d4f3]",
      };
    case "Cancelled":
      return {
        icon: XCircle,
        bg: "bg-[#fbeaea]",
        textColor: "text-[#c23b3b]",
        border: "border-[#f5c6c6]",
      };
    case "Refunded":
      return {
        icon: RotateCcw,
        bg: "bg-[#f8ebf5]",
        textColor: "text-[#943d7e]",
        border: "border-[#edd0e5]",
      };
  }
}

export default function OrderStatusBreakdownCard({
  statuses,
}: OrderStatusBreakdownCardProps) {
  const totalOrders = statuses.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Order Status Analytics</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Lifecycle distribution of all customer orders in this period
          </p>
        </div>
        <span className="text-xs font-semibold text-[#8c7a6c]">
          Total: {totalOrders} {totalOrders === 1 ? "order" : "orders"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {statuses.map((item) => {
          const { icon: Icon, bg, textColor, border } = getStatusBadgeDetails(
            item.status
          );

          return (
            <div
              key={item.status}
              className={`flex flex-col justify-between rounded-xl border p-3 transition hover:shadow-xs ${bg} ${border}`}
            >
              <div className="flex items-center justify-between">
                <Icon size={16} className={textColor} />
                <span className={`text-[11px] font-bold ${textColor}`}>
                  {formatPercent(item.percentage)}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-lg font-bold text-[#2b1b12]">{item.count}</p>
                <p className="text-[11px] font-medium text-[#6d5b4e]">
                  {item.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
