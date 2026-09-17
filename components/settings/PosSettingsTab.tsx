"use client";

import React from "react";
import { Store, ShoppingBag, Truck, Image as ImageIcon, Zap, CheckSquare, Receipt } from "lucide-react";
import type { PosSettings } from "@/types/settings";
import type { OrderType } from "@/types/pos";

interface PosSettingsTabProps {
  data: PosSettings;
  onChange: (updates: Partial<PosSettings>) => void;
}

export default function PosSettingsTab({
  data,
  onChange,
}: PosSettingsTabProps) {
  const toggle = (key: keyof PosSettings) => {
    onChange({ [key]: !data[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Point of Sale Preferences</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Customize register workflow, tender defaults, and catalog presentation for baristas and cashiers.
        </p>
      </div>

      {/* Default Order Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#2b1b12]">
          Default Order Type
        </label>
        <div className="flex flex-wrap gap-2.5">
          {(["Dine In", "Take Away", "Delivery"] as OrderType[]).map((type) => {
            const isSelected = data.defaultOrderType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ defaultOrderType: type })}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-[#2b1b12] bg-[#2b1b12] text-white shadow-xs"
                    : "border-[#e5dbd0] bg-[#faf7f3] text-[#66574d] hover:border-[#c98b5b]"
                }`}
              >
                {type === "Dine In" && <Store size={14} />}
                {type === "Take Away" && <ShoppingBag size={14} />}
                {type === "Delivery" && <Truck size={14} />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[#a39284]">
          Initial selection when starting a new customer cart in the POS.
        </p>
      </div>

      <div className="border-t border-[#f0e8df] pt-4" />

      {/* Feature Switches */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Enable Dine In */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <Store size={16} className="text-[#8a4f28]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Enable Dine In</p>
              <p className="text-[10px] text-[#8c7a6c]">Allow table dining orders</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.enableDineIn}
            onChange={() => toggle("enableDineIn")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Enable Take Away */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} className="text-[#3b6088]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Enable Take Away</p>
              <p className="text-[10px] text-[#8c7a6c]">Allow to-go counter orders</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.enableTakeAway}
            onChange={() => toggle("enableTakeAway")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Enable Delivery */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <Truck size={16} className="text-[#3f7a4e]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Enable Delivery</p>
              <p className="text-[10px] text-[#8c7a6c]">Allow dispatched delivery orders</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.enableDelivery}
            onChange={() => toggle("enableDelivery")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Allow Walk-in Customers */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <CheckSquare size={16} className="text-[#b26829]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Allow Walk-in Patrons</p>
              <p className="text-[10px] text-[#8c7a6c]">Fast orders without member registration</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.allowWalkIn}
            onChange={() => toggle("allowWalkIn")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Quick Tender Buttons */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <Zap size={16} className="text-[#c98b5b]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Quick Tender Buttons</p>
              <p className="text-[10px] text-[#8c7a6c]">Show suggested cash amount buttons</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.enableQuickTender}
            onChange={() => toggle("enableQuickTender")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Show Product Images */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <ImageIcon size={16} className="text-[#7a48a3]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Show Product Images</p>
              <p className="text-[10px] text-[#8c7a6c]">Display visual menu photos in POS catalog</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.showProductImages}
            onChange={() => toggle("showProductImages")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Require Customer for Delivery */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <Truck size={16} className="text-[#3f7a4e]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Require Customer for Delivery</p>
              <p className="text-[10px] text-[#8c7a6c]">Ensure address and phone are captured</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.requireCustomerForDelivery}
            onChange={() => toggle("requireCustomerForDelivery")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Auto Open Receipt */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3.5">
          <div className="flex items-center gap-2.5">
            <Receipt size={16} className="text-[#b26829]" />
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">Auto-Open Receipt Preview</p>
              <p className="text-[10px] text-[#8c7a6c]">Show receipt immediately on successful payment</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.autoOpenReceipt}
            onChange={() => toggle("autoOpenReceipt")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>
      </div>
    </div>
  );
}
