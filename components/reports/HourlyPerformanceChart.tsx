"use client";

import React, { useState } from "react";
import { Clock, Flame } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { HourlyPerformancePoint } from "@/lib/reports";

interface HourlyPerformanceChartProps {
  hourlyData: HourlyPerformancePoint[];
}

export default function HourlyPerformanceChart({
  hourlyData,
}: HourlyPerformanceChartProps) {
  const [hoveredHour, setHoveredHour] = useState<HourlyPerformancePoint | null>(
    null
  );

  const maxSales = Math.max(...hourlyData.map((h) => h.sales), 0);
  const peakHour = hourlyData.reduce(
    (max, cur) => (cur.sales > max.sales ? cur : max),
    hourlyData[0] || { hour: 0, label: "00:00", sales: 0, orders: 0 }
  );

  const hasSales = maxSales > 0;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2b1b12]">Hourly Sales Activity</h3>
            {hasSales && peakHour.sales > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[#fcf0e4] px-2.5 py-0.5 text-[11px] font-semibold text-[#b26829]">
                <Flame size={12} />
                Peak Hour: {peakHour.label} ({formatCurrency(peakHour.sales)})
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Identify rush hours and busy order influx throughout the day
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#8c7a6c]">
          <Clock size={14} className="text-[#c98b5b]" />
          <span>24-hour cycle</span>
        </div>
      </div>

      {/* Hover info banner */}
      <div className="mt-3 flex h-7 items-center justify-between border-y border-[#f0e8df] px-2 text-xs">
        {hoveredHour ? (
          <>
            <span className="font-semibold text-[#2b1b12]">
              Hour: {hoveredHour.label}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[#8c7a6c]">
                Sales:{" "}
                <strong className="text-[#2b1b12]">
                  {formatCurrency(hoveredHour.sales)}
                </strong>
              </span>
              <span className="text-[#8c7a6c]">
                Orders:{" "}
                <strong className="text-[#2b1b12]">
                  {hoveredHour.orders}
                </strong>
              </span>
            </div>
          </>
        ) : (
          <span className="text-[#a39284]">
            Hover over an hourly bar to view time-slot details
          </span>
        )}
      </div>

      {!hasSales ? (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <Clock size={28} className="text-[#cbb8a8]" />
          <p className="mt-2 text-xs font-medium text-[#8c7a6c]">
            No hourly orders recorded for this period
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex h-44 items-end gap-1 overflow-x-auto pb-6 pt-2">
            {hourlyData.map((h) => {
              const heightPercent =
                maxSales > 0 ? (h.sales / maxSales) * 100 : 0;
              const isPeak = hasSales && h.hour === peakHour.hour;
              const isZero = h.sales === 0;

              return (
                <div
                  key={h.hour}
                  onMouseEnter={() => setHoveredHour(h)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className="group relative flex h-full min-w-[14px] flex-1 flex-col items-center justify-end"
                >
                  <div
                    className={`w-full max-w-[24px] rounded-t transition-all duration-150 ${
                      isZero
                        ? "bg-[#efe8e0] opacity-40"
                        : isPeak
                        ? "bg-[#b26829] group-hover:bg-[#2b1b12]"
                        : "bg-[#c98b5b] group-hover:bg-[#2b1b12]"
                    }`}
                    style={{
                      height: `${Math.max(
                        heightPercent,
                        h.sales > 0 ? 8 : 2
                      )}%`,
                    }}
                  />

                  <span className="absolute -bottom-5 text-[9px] text-[#a39284] group-hover:font-semibold group-hover:text-[#2b1b12]">
                    {h.hour % 3 === 0 ? h.label : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
