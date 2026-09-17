"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Award, ShoppingBag, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { PeriodHighlights } from "@/lib/reports";

interface PeriodHighlightsCardProps {
  highlights: PeriodHighlights;
}

export default function PeriodHighlightsCard({
  highlights,
}: PeriodHighlightsCardProps) {
  const {
    highestSalesDay,
    lowestSalesDay,
    highestOrderDay,
    highestRevenueProduct,
    peakHour,
  } = highlights;

  const items = [
    {
      title: "Highest Sales Interval",
      value: highestSalesDay ? formatCurrency(highestSalesDay.sales) : "N/A",
      subtitle: highestSalesDay ? highestSalesDay.label : "No data recorded",
      icon: ArrowUpRight,
      iconColor: "text-[#3f7a4e]",
      bgColor: "bg-[#edf6ee]",
    },
    {
      title: "Lowest Sales Interval",
      value: lowestSalesDay ? formatCurrency(lowestSalesDay.sales) : "N/A",
      subtitle: lowestSalesDay ? lowestSalesDay.label : "No data recorded",
      icon: ArrowDownRight,
      iconColor: "text-[#8c7a6c]",
      bgColor: "bg-[#faf7f3]",
    },
    {
      title: "Highest Order Volume",
      value: highestOrderDay ? `${highestOrderDay.orders} orders` : "N/A",
      subtitle: highestOrderDay ? highestOrderDay.label : "No data recorded",
      icon: ShoppingBag,
      iconColor: "text-[#3b6088]",
      bgColor: "bg-[#edf2f7]",
    },
    {
      title: "Top Revenue Product",
      value: highestRevenueProduct
        ? formatCurrency(highestRevenueProduct.revenue)
        : "N/A",
      subtitle: highestRevenueProduct
        ? highestRevenueProduct.name
        : "No items sold",
      icon: Award,
      iconColor: "text-[#b26829]",
      bgColor: "bg-[#fcf0e4]",
    },
    {
      title: "Peak Sales Hour",
      value: peakHour ? formatCurrency(peakHour.sales) : "N/A",
      subtitle: peakHour
        ? `${peakHour.label} (${peakHour.orders} orders)`
        : "No orders",
      icon: Clock,
      iconColor: "text-[#8a4f28]",
      bgColor: "bg-[#f2e6dc]",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <h3 className="font-semibold text-[#2b1b12]">Period Highlights</h3>
      <p className="mt-1 text-xs text-[#8c7a6c]">
        Descriptive analytical extremes calculated from actual sales records
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#8c7a6c]">
                  {item.title}
                </span>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.bgColor} ${item.iconColor}`}
                >
                  <Icon size={14} />
                </div>
              </div>

              <div className="mt-3">
                <p className="text-base font-bold text-[#2b1b12]">{item.value}</p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-[#c98b5b]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
