"use client";

import React from "react";
import { Hash, Ban, RotateCcw, CheckCircle2 } from "lucide-react";
import type { OrderSettings } from "@/types/settings";
import type { OrderStatus } from "@/types/pos";

interface OrderSettingsTabProps {
  data: OrderSettings;
  onChange: (updates: Partial<OrderSettings>) => void;
}

export default function OrderSettingsTab({
  data,
  onChange,
}: OrderSettingsTabProps) {
  const currentYear = new Date().getFullYear();
  const sampleNumber = `${(data.orderPrefix || "COF").toUpperCase()}-${currentYear}-00042`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Order Numbering & Policies</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Configure order sequence formatting, default creation status, and cancellation or refund permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Order Prefix */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Hash size={14} className="text-[#c98b5b]" />
            <span>Order Number Prefix *</span>
          </label>
          <input
            type="text"
            value={data.orderPrefix}
            onChange={(e) =>
              onChange({
                orderPrefix: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
              })
            }
            maxLength={6}
            placeholder="e.g. COF, BRW, POS"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 font-mono text-xs font-bold text-[#2b1b12] uppercase outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Prefix assigned to new orders. Example preview:{" "}
            <strong className="font-mono text-[#2b1b12]">{sampleNumber}</strong>
          </p>
        </div>

        {/* Default Order Status */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <CheckCircle2 size={14} className="text-[#c98b5b]" />
            <span>Default Checkout Status</span>
          </label>
          <select
            value={data.defaultOrderStatus}
            onChange={(e) =>
              onChange({ defaultOrderStatus: e.target.value as OrderStatus })
            }
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs font-semibold text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          >
            <option value="Completed">Completed (Immediate fulfillment)</option>
            <option value="Preparing">Preparing (Send to kitchen/bar)</option>
            <option value="Confirmed">Confirmed (Awaiting prep)</option>
            <option value="Pending">Pending (Unconfirmed)</option>
          </select>
          <p className="text-[10px] text-[#a39284]">
            Status assigned to orders immediately upon completing tender in POS.
          </p>
        </div>
      </div>

      <div className="border-t border-[#f0e8df] pt-4" />

      {/* Policy Switches */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8c7a6c]">
          Order Modification Policies
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Allow Order Cancellation */}
          <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
            <div className="flex items-center gap-2.5">
              <Ban size={16} className="text-[#c23b3b]" />
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">Allow Order Cancellation</p>
                <p className="text-[10px] text-[#8c7a6c]">Permit cashiers/managers to void active orders</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.allowCancellation}
              onChange={() => onChange({ allowCancellation: !data.allowCancellation })}
              className="h-4 w-4 rounded accent-[#c98b5b]"
            />
          </div>

          {/* Allow Refunds */}
          <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
            <div className="flex items-center gap-2.5">
              <RotateCcw size={16} className="text-[#943d7e]" />
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">Allow Customer Refunds</p>
                <p className="text-[10px] text-[#8c7a6c]">Enable refund workflow UI for settled orders</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.allowRefunds}
              onChange={() => onChange({ allowRefunds: !data.allowRefunds })}
              className="h-4 w-4 rounded accent-[#c98b5b]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
