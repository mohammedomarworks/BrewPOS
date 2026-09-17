"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import type { ReceiptSettings } from "@/types/settings";

interface ReceiptSettingsTabProps {
  data: ReceiptSettings;
  onChange: (updates: Partial<ReceiptSettings>) => void;
}

export default function ReceiptSettingsTab({
  data,
  onChange,
}: ReceiptSettingsTabProps) {
  const toggle = (key: keyof ReceiptSettings) => {
    if (typeof data[key] === "boolean") {
      onChange({ [key]: !data[key] });
    }
  };

  const receiptSwitches: { key: keyof ReceiptSettings; label: string; desc: string }[] = [
    { key: "showLogo", label: "Show Business Logo", desc: "Display store logo at top of receipt if available" },
    { key: "showAddress", label: "Show Address", desc: "Print store branch address below store name" },
    { key: "showPhone", label: "Show Phone Number", desc: "Print store contact number on header" },
    { key: "showVatNumber", label: "Show Tax/VAT Registration (BIN)", desc: "Include statutory tax number for invoice compliance" },
    { key: "showCashier", label: "Show Cashier Name", desc: "Print name of barista/cashier who tendered order" },
    { key: "showCustomer", label: "Show Customer Name", desc: "Print patron name or Walk-in Customer tag" },
    { key: "showOrderType", label: "Show Order Type", desc: "Indicate Dine In, Take Away, or Delivery clearly" },
    { key: "showPaymentMethod", label: "Show Payment Breakdown", desc: "Print tender method, amount received, and change return" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Receipt Template Designer</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Control which metadata elements appear on customer printouts, thermal receipts, and digital order summaries.
        </p>
      </div>

      {/* Footer message editor */}
      <div className="space-y-1.5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
          <MessageSquare size={14} className="text-[#c98b5b]" />
          <span>Receipt Footer Greeting / Notice</span>
        </label>
        <textarea
          rows={2}
          value={data.footerMessage}
          onChange={(e) => onChange({ footerMessage: e.target.value })}
          placeholder="e.g. Thank you for choosing BrewPOS! Please come again."
          className="w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
        />
        <p className="text-[10px] text-[#a39284]">
          Printed at the very bottom of every customer receipt slip.
        </p>
      </div>

      {/* Display Switches */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8c7a6c]">
          Header & Body Elements
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {receiptSwitches.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5 transition hover:border-[#e0d3c5]"
            >
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">{item.label}</p>
                <p className="text-[10px] text-[#8c7a6c]">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(data[item.key])}
                onChange={() => toggle(item.key)}
                className="h-4 w-4 rounded accent-[#c98b5b]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
