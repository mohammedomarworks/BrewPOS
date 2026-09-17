"use client";

import React from "react";
import { Bell, Volume2, Mail } from "lucide-react";
import type { NotificationSettings } from "@/types/settings";

interface NotificationsTabProps {
  data: NotificationSettings;
  onChange: (updates: Partial<NotificationSettings>) => void;
}

export default function NotificationsTab({
  data,
  onChange,
}: NotificationsTabProps) {
  const toggle = (key: keyof NotificationSettings) => {
    onChange({ [key]: !data[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b1b12]">System Notifications</h3>
        <p className="mt-1 text-xs text-[#8c7a6c]">
          Configure real-time audio and alert preferences for low inventory and receipts.
        </p>
      </div>

      <div className="space-y-3">
        {/* Low Stock Alerts */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fcf0e4] text-[#b26829]">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">
                Low Stock Threshold Alerts
              </p>
              <p className="text-[10px] text-[#8c7a6c]">
                Highlight ingredients on POS and inventory dashboard when stock reaches minimum reorder level
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.lowStockAlerts}
            onChange={() => toggle("lowStockAlerts")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2f7] text-[#3b6088]">
              <Volume2 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">
                Register Sound Effects
              </p>
              <p className="text-[10px] text-[#8c7a6c]">
                Play subtle auditory chime upon adding items to cart and completing payment
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.soundAlerts}
            onChange={() => toggle("soundAlerts")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>

        {/* Email Receipts */}
        <div className="flex items-center justify-between rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf6ee] text-[#3f7a4e]">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2b1b12]">
                Automatic Email Receipts
              </p>
              <p className="text-[10px] text-[#8c7a6c]">
                Automatically dispatch electronic receipts when a registered customer email is attached
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.emailReceipts}
            onChange={() => toggle("emailReceipts")}
            className="h-4 w-4 rounded accent-[#c98b5b]"
          />
        </div>
      </div>
    </div>
  );
}
