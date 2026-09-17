"use client";

import React from "react";

interface PrintReportHeaderProps {
  periodLabel: string;
}

export default function PrintReportHeader({ periodLabel }: PrintReportHeaderProps) {
  const printedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="hidden print:block mb-8 border-b-2 border-[#2b1b12] pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2b1b12]">
            BrewPOS
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#8c7a6c]">
            Coffee Shop Management & Analytics
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded border border-[#2b1b12] px-2 py-0.5 text-xs font-bold uppercase text-[#2b1b12]">
            Official Report
          </span>
          <p className="mt-1 text-xs text-neutral-500">Generated: {printedAt}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#e8dfd4] pt-3 text-sm">
        <div>
          <span className="font-semibold text-[#2b1b12]">Reporting Period: </span>
          <span className="text-[#8c7a6c]">{periodLabel}</span>
        </div>
        <div>
          <span className="font-semibold text-[#2b1b12]">Standard VAT Rate: </span>
          <span className="text-[#8c7a6c]">15.0% (Bangladesh)</span>
        </div>
      </div>
    </div>
  );
}
