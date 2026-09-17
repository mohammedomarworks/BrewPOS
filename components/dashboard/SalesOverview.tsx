"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency, getSalesTrend, getDateRangeBounds } from "@/lib/reports";
import type { CompletedOrder } from "@/types/pos";

interface SalesOverviewProps {
  orders: CompletedOrder[];
}

export default function SalesOverview({ orders }: SalesOverviewProps) {
  const [view, setView] = useState<"today" | "week">("today");

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "Completed"),
    [orders]
  );

  const { trendData, subtitle } = useMemo(() => {
    if (view === "today") {
      const bounds = getDateRangeBounds({ preset: "Today" });
      const trend = getSalesTrend(completedOrders, bounds, "Today");
      // Filter or display active day hours (e.g. 06:00 to 22:00 or every 2 hours)
      const visibleHours = trend.filter((h) => {
        const hour = parseInt(h.key, 10);
        return hour >= 7 && hour <= 22;
      });
      return {
        trendData: visibleHours,
        subtitle: "Hourly sales performance for today",
      };
    } else {
      const bounds = getDateRangeBounds({ preset: "Last 7 Days" });
      const trend = getSalesTrend(completedOrders, bounds, "Last 7 Days");
      return {
        trendData: trend,
        subtitle: "Daily sales performance for the last 7 days",
      };
    }
  }, [view, completedOrders]);

  const maxSales = Math.max(...trendData.map((d) => d.sales), 0);
  const totalInView = trendData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2b1b12]">Sales Overview</h3>
            <span className="text-xs font-semibold text-[#c98b5b]">
              {formatCurrency(totalInView)}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#8c7a6c]">{subtitle}</p>
        </div>

        {/* Toggle between Today and This Week */}
        <div className="flex rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("today")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              view === "today"
                ? "bg-[#2b1b12] text-white shadow-xs"
                : "text-[#66574d] hover:text-[#2b1b12]"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              view === "week"
                ? "bg-[#2b1b12] text-white shadow-xs"
                : "text-[#66574d] hover:text-[#2b1b12]"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="mt-8 flex h-64 items-end gap-2 sm:gap-3">
        {trendData.map((point) => {
          const heightPercent =
            maxSales > 0 ? (point.sales / maxSales) * 100 : 0;
          const isZero = point.sales === 0;

          return (
            <div
              key={point.key}
              title={`${point.label}: ${formatCurrency(point.sales)} (${point.orders} orders)`}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-52 w-full flex-col justify-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isZero
                      ? "bg-[#efe8e0] opacity-50"
                      : "bg-[#c98b5b]/85 group-hover:bg-[#2b1b12]"
                  }`}
                  style={{
                    height: `${Math.max(
                      heightPercent,
                      point.sales > 0 ? 8 : 2
                    )}%`,
                  }}
                />
              </div>

              <span className="truncate text-center text-[10px] text-[#a39284] group-hover:font-semibold group-hover:text-[#2b1b12]">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
