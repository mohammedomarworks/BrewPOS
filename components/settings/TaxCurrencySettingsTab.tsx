"use client";

import React from "react";
import { Coins, Percent, AlertCircle, CheckCircle2 } from "lucide-react";
import type { TaxCurrencySettings } from "@/types/settings";

interface TaxCurrencySettingsTabProps {
  data: TaxCurrencySettings;
  onChange: (updates: Partial<TaxCurrencySettings>) => void;
}

export default function TaxCurrencySettingsTab({
  data,
  onChange,
}: TaxCurrencySettingsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Tax & Currency Configuration</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Set store tender currency, visual currency symbol, and the statutory Value Added Tax (VAT) rate applied to new transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Currency Code */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Coins size={14} className="text-[#c98b5b]" />
            <span>Currency Code *</span>
          </label>
          <input
            type="text"
            value={data.currencyCode}
            onChange={(e) =>
              onChange({ currencyCode: e.target.value.toUpperCase().trim() })
            }
            placeholder="e.g. BDT, USD, EUR, GBP"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 font-mono text-xs text-[#2b1b12] uppercase outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            ISO 4217 standard 3-letter currency code (Default: BDT).
          </p>
        </div>

        {/* Currency Symbol */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Coins size={14} className="text-[#c98b5b]" />
            <span>Currency Symbol *</span>
          </label>
          <input
            type="text"
            value={data.currencySymbol}
            onChange={(e) => onChange({ currencySymbol: e.target.value.trim() })}
            placeholder="e.g. ৳, $, €, £"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 font-mono text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Symbol prefixed to all monetary prices and totals across the POS and invoices (Default: ৳).
          </p>
        </div>

        {/* VAT Rate */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Percent size={14} className="text-[#c98b5b]" />
            <span>Default Statutory VAT Rate (%) *</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.vatRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChange({ vatRate: isNaN(val) ? 0 : val });
                }}
                className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-3.5 pr-8 font-mono text-xs font-semibold text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8c7a6c]">
                %
              </span>
            </div>

            {data.vatRate === 15 && (
              <span className="flex items-center gap-1 rounded-full bg-[#edf6ee] px-2.5 py-1 text-[11px] font-semibold text-[#3f7a4e]">
                <CheckCircle2 size={12} />
                <span>Bangladesh Statutory Standard (15%)</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#a39284]">
            Applied as: (Subtotal − Discounts) × VAT% = Taxable VAT.
          </p>
        </div>
      </div>

      {/* Historical Data Protection Guarantee Banner */}
      <div className="rounded-xl border border-[#e8dfd4] bg-[#faf7f3] p-4 text-xs text-[#6d5b4e]">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#c98b5b]" />
          <div>
            <p className="font-semibold text-[#2b1b12]">
              Historical Data Protection Guarantee
            </p>
            <p className="mt-1 text-[#8c7a6c] leading-relaxed">
              Modifying the VAT rate or currency will only apply to new transactions going forward. Completed historical orders maintain their immutable stored VAT amounts and original totals, ensuring audit reports remain 100% compliant with historical records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
