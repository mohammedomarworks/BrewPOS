"use client";

import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import type { DateRangeFilter, DateRangePreset } from "@/lib/reports";

interface DateRangeSelectorProps {
  filter: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
}

const PRESETS: DateRangePreset[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "Custom",
];

export default function DateRangeSelector({
  filter,
  onChange,
}: DateRangeSelectorProps) {
  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === "Custom") {
      // Default to today if not already set
      const todayStr = new Date().toISOString().slice(0, 10);
      onChange({
        preset: "Custom",
        startDate: filter.startDate || todayStr,
        endDate: filter.endDate || todayStr,
      });
    } else {
      onChange({ preset });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filter,
      preset: "Custom",
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filter,
      preset: "Custom",
      endDate: e.target.value,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preset pills scrollable on mobile */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#e8dfd4] bg-white p-1.5 shadow-[0_2px_8px_rgba(72,48,32,0.03)]">
        {PRESETS.map((preset) => {
          const isActive = filter.preset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-[#2b1b12] text-white shadow-sm"
                  : "text-[#6d5b4e] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker inputs (shows when Custom is selected) */}
      {filter.preset === "Custom" && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e8dfd4] bg-white p-3 text-sm shadow-[0_2px_8px_rgba(72,48,32,0.03)] sm:flex-nowrap">
          <div className="flex items-center gap-2 text-xs font-medium text-[#8c7a6c]">
            <Calendar size={15} className="text-[#c98b5b]" />
            <span>Custom Dates:</span>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="start-date" className="text-xs text-[#a39284]">
                From:
              </label>
              <input
                id="start-date"
                type="date"
                value={filter.startDate || ""}
                onChange={handleStartDateChange}
                className="h-8 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b]"
              />
            </div>

            <ChevronRight size={14} className="text-[#a39284]" />

            <div className="flex items-center gap-1.5">
              <label htmlFor="end-date" className="text-xs text-[#a39284]">
                To:
              </label>
              <input
                id="end-date"
                type="date"
                value={filter.endDate || ""}
                onChange={handleEndDateChange}
                className="h-8 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
