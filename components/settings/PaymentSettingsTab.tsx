"use client";

import React from "react";
import { Banknote, CreditCard, Smartphone, ShieldCheck } from "lucide-react";
import type { PaymentSettings, MobileProvider } from "@/types/settings";

interface PaymentSettingsTabProps {
  data: PaymentSettings;
  onChange: (updates: Partial<PaymentSettings>) => void;
}

const ALL_PROVIDERS: MobileProvider[] = ["bKash", "Nagad", "Rocket", "Upay"];

export default function PaymentSettingsTab({
  data,
  onChange,
}: PaymentSettingsTabProps) {
  const enabledCount =
    (data.enableCash ? 1 : 0) +
    (data.enableCard ? 1 : 0) +
    (data.enableMobile ? 1 : 0);

  const handleToggle = (key: "enableCash" | "enableCard" | "enableMobile") => {
    // If attempting to disable the only enabled payment method, reject with warning
    if (data[key] && enabledCount <= 1) {
      alert("At least one payment method must remain enabled for customer checkout.");
      return;
    }
    onChange({ [key]: !data[key] });
  };

  const handleProviderToggle = (provider: MobileProvider) => {
    const current = data.mobileProviders || [];
    let updated: MobileProvider[];
    if (current.includes(provider)) {
      if (current.length <= 1) {
        alert("At least one mobile payment provider must remain active.");
        return;
      }
      updated = current.filter((p) => p !== provider);
    } else {
      updated = [...current, provider];
    }
    onChange({ mobileProviders: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Payment Methods</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Enable or disable payment tenders and configure simulated mobile banking providers for the checkout register.
        </p>
      </div>

      {/* Main Payment Methods */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Cash */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
            data.enableCash
              ? "border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)]"
              : "border-dashed border-[#e0d3c5] bg-[#faf7f3] opacity-60"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6ee] text-[#3f7a4e]">
                <Banknote size={20} />
              </div>
              <input
                type="checkbox"
                checked={data.enableCash}
                onChange={() => handleToggle("enableCash")}
                className="h-4 w-4 rounded accent-[#c98b5b]"
              />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#2b1b12]">Cash Tender</h4>
            <p className="mt-1 text-xs text-[#8c7a6c]">
              Physical currency with cash received, change return, and quick tender denominations.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0e8df] text-[11px] font-semibold">
            <span className={data.enableCash ? "text-[#3f7a4e]" : "text-[#a39284]"}>
              {data.enableCash ? "Active in POS" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
            data.enableCard
              ? "border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)]"
              : "border-dashed border-[#e0d3c5] bg-[#faf7f3] opacity-60"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2f7] text-[#3b6088]">
                <CreditCard size={20} />
              </div>
              <input
                type="checkbox"
                checked={data.enableCard}
                onChange={() => handleToggle("enableCard")}
                className="h-4 w-4 rounded accent-[#c98b5b]"
              />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#2b1b12]">Credit / Debit Card</h4>
            <p className="mt-1 text-xs text-[#8c7a6c]">
              POS card terminal simulation with card masking (e.g. •••• 4242).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0e8df] text-[11px] font-semibold">
            <span className={data.enableCard ? "text-[#3b6088]" : "text-[#a39284]"}>
              {data.enableCard ? "Active in POS" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Mobile Banking */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
            data.enableMobile
              ? "border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)]"
              : "border-dashed border-[#e0d3c5] bg-[#faf7f3] opacity-60"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fcf0e4] text-[#b26829]">
                <Smartphone size={20} />
              </div>
              <input
                type="checkbox"
                checked={data.enableMobile}
                onChange={() => handleToggle("enableMobile")}
                className="h-4 w-4 rounded accent-[#c98b5b]"
              />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#2b1b12]">Mobile Banking (MFS)</h4>
            <p className="mt-1 text-xs text-[#8c7a6c]">
              QR code and wallet transaction references (bKash, Nagad, Rocket, Upay).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0e8df] text-[11px] font-semibold">
            <span className={data.enableMobile ? "text-[#b26829]" : "text-[#a39284]"}>
              {data.enableMobile ? "Active in POS" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Providers Configuration */}
      {data.enableMobile && (
        <div className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#2b1b12]">
                Active Mobile Financial Services (MFS)
              </h4>
              <p className="mt-0.5 text-xs text-[#8c7a6c]">
                Select which MFS operators are displayed when Mobile payment is selected at checkout.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#c98b5b]">
              {(data.mobileProviders || []).length} active
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ALL_PROVIDERS.map((provider) => {
              const isChecked = (data.mobileProviders || []).includes(provider);
              return (
                <label
                  key={provider}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-semibold transition ${
                    isChecked
                      ? "border-[#c98b5b] bg-[#faf7f3] text-[#2b1b12]"
                      : "border-[#e5dbd0] bg-white text-[#8c7a6c]"
                  }`}
                >
                  <span>{provider}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleProviderToggle(provider)}
                    className="h-4 w-4 rounded accent-[#c98b5b]"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-[#e8dfd4] bg-[#faf7f3] p-4 text-xs text-[#6d5b4e]">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#3f7a4e]" />
        <div>
          <p className="font-semibold text-[#2b1b12]">Safety & Offline Guard</p>
          <p className="mt-0.5 text-[#8c7a6c]">
            The system guarantees at least one tender remains active. All tenders are simulated locally without connecting to live bank APIs during this development phase.
          </p>
        </div>
      </div>
    </div>
  );
}
