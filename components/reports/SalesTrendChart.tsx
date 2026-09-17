"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, BarChart2 } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { SalesTrendDataPoint } from "@/lib/reports";
import { getCurrencySymbol } from "@/lib/settings-store";

interface SalesTrendChartProps {
  data: SalesTrendDataPoint[];
  periodLabel: string;
}

export default function SalesTrendChart({
  data,
  periodLabel,
}: SalesTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<SalesTrendDataPoint | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"sales" | "orders">("sales");

  // Calculate maximum values for scale
  const { maxSales, maxOrders, totalSalesInTrend, totalOrdersInTrend } =
    useMemo(() => {
      let mSales = 0;
      let mOrders = 0;
      let tSales = 0;
      let tOrders = 0;

      data.forEach((p) => {
        if (p.sales > mSales) mSales = p.sales;
        if (p.orders > mOrders) mOrders = p.orders;
        tSales += p.sales;
        tOrders += p.orders;
      });

      return {
        maxSales: mSales > 0 ? mSales : 100,
        maxOrders: mOrders > 0 ? mOrders : 10,
        totalSalesInTrend: tSales,
        totalOrdersInTrend: tOrders,
      };
    }, [data]);

  const hasData = totalSalesInTrend > 0 || totalOrdersInTrend > 0;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2b1b12]">Sales Trend</h3>
            <span className="rounded-full bg-[#f2e6dc] px-2.5 py-0.5 text-xs font-medium text-[#8a4f28]">
              {periodLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Revenue and transaction activity over time
          </p>
        </div>

        {/* Toggle between Sales (৳) and Orders (#) */}
        <div className="flex items-center gap-1 rounded-xl border border-[#e8dfd4] bg-[#faf7f3] p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("sales")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              viewMode === "sales"
                ? "bg-[#2b1b12] text-white shadow-xs"
                : "text-[#6d5b4e] hover:text-[#2b1b12]"
            }`}
          >
            <TrendingUp size={13} />
            <span>Revenue</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("orders")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              viewMode === "orders"
                ? "bg-[#2b1b12] text-white shadow-xs"
                : "text-[#6d5b4e] hover:text-[#2b1b12]"
            }`}
          >
            <BarChart2 size={13} />
            <span>Orders</span>
          </button>
        </div>
      </div>

      {/* Hover Info Banner */}
      <div className="mt-3 flex h-7 items-center justify-between border-y border-[#f0e8df] px-2 text-xs">
        {hoveredPoint ? (
          <>
            <span className="font-semibold text-[#2b1b12]">
              {hoveredPoint.label}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[#8c7a6c]">
                Sales:{" "}
                <strong className="text-[#2b1b12]">
                  {formatCurrency(hoveredPoint.sales)}
                </strong>
              </span>
              <span className="text-[#8c7a6c]">
                Orders:{" "}
                <strong className="text-[#2b1b12]">{hoveredPoint.orders}</strong>
              </span>
            </div>
          </>
        ) : (
          <span className="text-[#a39284]">
            Hover over any bar to inspect interval metrics
          </span>
        )}
      </div>

      {/* Chart Visuals */}
      {!hasData ? (
        <div className="flex h-56 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-[#8c7a6c]">
            No sales activity recorded for this period
          </p>
          <p className="mt-1 text-xs text-[#a39284]">
            Chart bars will appear once orders are completed.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex h-60 w-full flex-col">
          {/* Chart Bars */}
          <div className="relative flex flex-1 items-end gap-1.5 overflow-x-auto pb-6 pt-4 sm:gap-2">
            {data.map((point) => {
              const value = viewMode === "sales" ? point.sales : point.orders;
              const maxVal = viewMode === "sales" ? maxSales : maxOrders;
              const heightPercent =
                maxVal > 0 ? Math.max((value / maxVal) * 100, value > 0 ? 6 : 2) : 2;
              const isZero = value === 0;

              return (
                <div
                  key={point.key}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="group relative flex h-full min-w-[20px] flex-1 flex-col items-center justify-end"
                >
                  {/* Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-200 ${
                      isZero
                        ? "bg-[#efe8e0] opacity-40"
                        : "bg-[#c98b5b] group-hover:bg-[#2b1b12]"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* X Axis Label */}
                  <span className="absolute -bottom-5 select-none truncate text-[10px] text-[#a39284] group-hover:font-semibold group-hover:text-[#2b1b12]">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between border-t border-[#f0e8df] pt-3 text-xs text-[#8c7a6c]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#c98b5b]" />
                <span>{viewMode === "sales" ? `Sales (${getCurrencySymbol()})` : "Orders Count"}</span>
              </div>
            </div>
            <span>
              Total:{" "}
              <strong className="text-[#2b1b12]">
                {viewMode === "sales"
                  ? formatCurrency(totalSalesInTrend)
                  : `${totalOrdersInTrend} orders`}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
