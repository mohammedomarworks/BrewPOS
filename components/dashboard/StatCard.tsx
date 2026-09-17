"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description: string;
  icon?: LucideIcon;
}

export default function StatCard({
  label,
  value,
  change,
  changeType = "positive",
  description,
  icon: Icon,
}: StatCardProps) {
  const getBadgeClass = () => {
    switch (changeType) {
      case "positive":
        return "bg-[#edf6ee] text-[#4f8a58]";
      case "negative":
        return "bg-[#fbeaea] text-[#c23b3b]";
      case "neutral":
      default:
        return "bg-[#faf7f3] text-[#8c7a6c]";
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-[0_4px_20px_rgba(72,48,32,0.04)] transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#8c7a6c]">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#faf7f3] text-[#c98b5b]">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-[#2b1b12]">
          {value}
        </h3>

        {change && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getBadgeClass()}`}
          >
            {change}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-[#a39284]">{description}</p>
    </div>
  );
}
