"use client";

import React from "react";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function SkeletonTable({
  rows = 5,
  columns = 5,
  className = "",
}: SkeletonTableProps) {
  return (
    <div
      className={`w-full animate-pulse overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-sm ${className}`}
      aria-busy="true"
      aria-label="Loading data table"
    >
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-44 rounded-lg bg-[#f0e7dd]" />
        <div className="h-8 w-28 rounded-lg bg-[#f0e7dd]" />
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-4 border-b border-[#f3ece4] pb-3">
        {Array.from({ length: columns }).map((_, idx) => (
          <div
            key={`th-${idx}`}
            className="h-4 rounded bg-[#ede3d8]"
            style={{ width: `${60 + (idx % 3) * 15}%` }}
          />
        ))}
      </div>

      {/* Table rows */}
      <div className="divide-y divide-[#f9f5f0]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`tr-${rIdx}`}
            className="grid grid-cols-5 gap-4 py-4 items-center"
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={`td-${rIdx}-${cIdx}`}
                className="h-4 rounded bg-[#f5eee6]"
                style={{
                  width: `${50 + ((rIdx + cIdx) % 4) * 15}%`,
                  opacity: 0.8 + ((rIdx % 2) * 0.2),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
