"use client";

import React from "react";
import { Receipt, Info, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { VatSummaryReport } from "@/lib/reports";

interface VatReportCardProps {
  vatSummary: VatSummaryReport;
}

export default function VatReportCard({ vatSummary }: VatReportCardProps) {
  const {
    vatRate,
    grossSalesBeforeDiscount,
    totalDiscounts,
    taxableSales,
    vatCollected,
  } = vatSummary;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#2b1b12]">VAT Compliance Report</h3>
            <span className="rounded-full bg-[#f5eefb] px-2.5 py-0.5 text-xs font-semibold text-[#7a48a3]">
              Standard {vatRate}% Rate
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Bangladesh statutory Value Added Tax calculated from order records
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eefb] text-[#7a48a3]">
          <Receipt size={18} />
        </div>
      </div>

      {/* Arithmetic calculation cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Gross */}
        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <p className="text-[11px] font-semibold text-[#8c7a6c]">
            1. Gross Sales (Subtotal)
          </p>
          <p className="mt-1.5 text-lg font-bold text-[#2b1b12]">
            {formatCurrency(grossSalesBeforeDiscount)}
          </p>
          <p className="text-[10px] text-[#a39284]">Pre-discount item total</p>
        </div>

        {/* 2. Discounts */}
        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <p className="text-[11px] font-semibold text-[#8c7a6c]">
            2. Total Discounts Applied
          </p>
          <p className="mt-1.5 text-lg font-bold text-[#b26829]">
            -{formatCurrency(totalDiscounts)}
          </p>
          <p className="text-[10px] text-[#a39284]">Tax-deductible promo discount</p>
        </div>

        {/* 3. Taxable Amount */}
        <div className="rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <p className="text-[11px] font-semibold text-[#8c7a6c]">
            3. Net Taxable Sales
          </p>
          <p className="mt-1.5 text-lg font-bold text-[#2b1b12]">
            {formatCurrency(taxableSales)}
          </p>
          <p className="text-[10px] text-[#a39284]">Subtotal minus discount</p>
        </div>

        {/* 4. VAT Collected */}
        <div className="rounded-xl border border-[#7a48a3]/20 bg-[#fbf8fe] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#7a48a3]">
              4. Total VAT Collected
            </p>
            <ShieldCheck size={14} className="text-[#7a48a3]" />
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-[#7a48a3]">
            {formatCurrency(vatCollected)}
          </p>
          <p className="text-[10px] text-[#7a48a3]/80">Taxable amount × 15%</p>
        </div>
      </div>

      {/* Clarification note */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#faf7f3] px-3.5 py-2.5 text-[11px] text-[#8c7a6c]">
        <Info size={14} className="shrink-0 text-[#c98b5b]" />
        <span>
          Statutory formula:{" "}
          <strong className="text-[#2b1b12]">
            (Subtotal − Discount) × 15% = Taxable VAT
          </strong>
          . All numbers are derived from immutable snapshots stored on completed
          orders.
        </span>
      </div>
    </div>
  );
}
