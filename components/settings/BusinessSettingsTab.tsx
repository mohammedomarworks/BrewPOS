"use client";

import React from "react";
import { Store, MapPin, Phone, Mail, Globe, FileText, Image as ImageIcon } from "lucide-react";
import type { BusinessSettings } from "@/types/settings";

interface BusinessSettingsTabProps {
  data: BusinessSettings;
  onChange: (updates: Partial<BusinessSettings>) => void;
}

export default function BusinessSettingsTab({
  data,
  onChange,
}: BusinessSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">Business Profile</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Manage your coffee shop identification, branding, contact information, and statutory tax registration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Business Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Store size={14} className="text-[#c98b5b]" />
            <span>Coffee Shop Name *</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. BrewPOS Coffee Shop"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Displayed on dashboard, sidebar header, printed receipts, and reports.
          </p>
        </div>

        {/* Tagline / Subtitle */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Store size={14} className="text-[#c98b5b]" />
            <span>Tagline / Slogan</span>
          </label>
          <input
            type="text"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. Premium Artisanal Coffee"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Subtitle shown below your store name on receipts and invoices.
          </p>
        </div>

        {/* Business Address */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <MapPin size={14} className="text-[#c98b5b]" />
            <span>Physical Address</span>
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="e.g. Road 27, Dhanmondi, Dhaka 1209"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Printed on customer receipts and used for delivery calculations.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Phone size={14} className="text-[#c98b5b]" />
            <span>Contact Phone</span>
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="e.g. +880 1711-000000"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Store helpline printed on thermal receipts.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Mail size={14} className="text-[#c98b5b]" />
            <span>Official Email</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="e.g. hello@brewpos.com"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <Globe size={14} className="text-[#c98b5b]" />
            <span>Website</span>
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="e.g. https://brewpos.com"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
        </div>

        {/* Tax / VAT Registration Number */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <FileText size={14} className="text-[#c98b5b]" />
            <span>BIN / VAT Registration Number</span>
          </label>
          <input
            type="text"
            value={data.vatNumber}
            onChange={(e) => onChange({ vatNumber: e.target.value })}
            placeholder="e.g. BIN-9876543210"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
          <p className="text-[10px] text-[#a39284]">
            Statutory VAT registration printed on official tax invoices.
          </p>
        </div>

        {/* Logo URL */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
            <ImageIcon size={14} className="text-[#c98b5b]" />
            <span>Logo Image URL (Optional)</span>
          </label>
          <input
            type="text"
            value={data.logoUrl || ""}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            placeholder="e.g. /logo.png or https://example.com/logo.png"
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
