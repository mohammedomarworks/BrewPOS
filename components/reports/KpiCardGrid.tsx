"use client";

import React from "react";
import {
  Banknote,
  ShoppingBag,
  TrendingUp,
  Tag,
  Receipt,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { SalesSummaryKPI } from "@/lib/reports";

interface KpiCardGridProps {
  summary: SalesSummaryKPI;
}

export default function KpiCardGrid({ summary }: KpiCardGridProps) {
  const cards = [
    {
      label: "Total Sales",
      value: formatCurrency(summary.totalSales),
      subtitle: `${summary.completedOrdersCount} completed orders`,
      icon: Banknote,
      iconBg: "bg-[#f2e6dc]",
      iconColor: "text-[#8a4f28]",
      tooltip: "Net sales from completed orders (excludes cancelled & refunded)",
    },
    {
      label: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      subtitle:
        summary.cancelledOrdersCount + summary.refundedOrdersCount > 0
          ? `${summary.cancelledOrdersCount} cancelled, ${summary.refundedOrdersCount} refunded`
          : "All orders completed",
      icon: ShoppingBag,
      iconBg: "bg-[#e8f0ec]",
      iconColor: "text-[#3f7a4e]",
      tooltip: "Number of successfully completed customer orders",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(summary.averageOrderValue),
      subtitle: "Per completed checkout",
      icon: TrendingUp,
      iconBg: "bg-[#edf2f7]",
      iconColor: "text-[#3b6088]",
      tooltip: "Total sales divided by number of completed orders",
    },
    {
      label: "Total Discount",
      value: formatCurrency(summary.totalDiscount),
      subtitle: "Promotions & voucher savings",
      icon: Tag,
      iconBg: "bg-[#fcf0e4]",
      iconColor: "text-[#b26829]",
      tooltip: "Total discount applied on completed orders",
    },
    {
      label: "VAT Collected",
      value: formatCurrency(summary.vatCollected),
      subtitle: "15% standard rate on taxable sales",
      icon: Receipt,
      iconBg: "bg-[#f5eefb]",
      iconColor: "text-[#7a48a3]",
      tooltip: "15% Bangladesh VAT applied to discounted taxable subtotal",
    },
    {
      label: "Customers Served",
      value: summary.customersServed.toLocaleString(),
      subtitle: "Distinct patrons served",
      icon: Users,
      iconBg: "bg-[#fef6e7]",
      iconColor: "text-[#a07418]",
      tooltip: "Count of unique customer names/profiles in this period",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-[0_4px_20px_rgba(72,48,32,0.04)] transition hover:shadow-md"
            title={card.tooltip}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8c7a6c]">
                {card.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold tracking-tight text-[#2b1b12]">
                {card.value}
              </h3>
              <p className="mt-1 text-[11px] leading-tight text-[#a39284]">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
