"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSettingsStore } from "@/lib/settings-store";
import { useUsersStore } from "@/lib/user-store";
import { addAuditLog } from "@/lib/audit-store";
import type { Settings } from "@/types/settings";

// Icons
import {
  Settings as SettingsIcon,
  Store,
  Coins,
  LayoutGrid,
  CreditCard,
  Receipt,
  Hash,
  Users,
  Bell,
  History,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Tab Components
import BusinessSettingsTab from "@/components/settings/BusinessSettingsTab";
import TaxCurrencySettingsTab from "@/components/settings/TaxCurrencySettingsTab";
import PosSettingsTab from "@/components/settings/PosSettingsTab";
import PaymentSettingsTab from "@/components/settings/PaymentSettingsTab";
import ReceiptSettingsTab from "@/components/settings/ReceiptSettingsTab";
import OrderSettingsTab from "@/components/settings/OrderSettingsTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import UsersTab from "@/components/settings/UsersTab";
import AuditLogTab from "@/components/settings/AuditLogTab";
import ResetDefaultsModal from "@/components/settings/ResetDefaultsModal";

type SettingsTab =
  | "business"
  | "taxCurrency"
  | "pos"
  | "payments"
  | "receipt"
  | "orders"
  | "users"
  | "notifications"
  | "audit";

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { id: "business", label: "Business", icon: Store },
  { id: "taxCurrency", label: "Tax & Currency", icon: Coins },
  { id: "pos", label: "POS Preferences", icon: LayoutGrid },
  { id: "payments", label: "Payment Channels", icon: CreditCard },
  { id: "receipt", label: "Receipt Template", icon: Receipt },
  { id: "orders", label: "Order Policies", icon: Hash },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "audit", label: "Audit Trail", icon: History },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettingsToDefaults } =
    useSettingsStore();
  const { activeUser } = useUsersStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [draftSettings, setDraftSettings] = useState<Settings>(settings);
  const [prevSettings, setPrevSettings] = useState<Settings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Sync draft when store updates externally (recommended React state sync pattern)
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setDraftSettings(settings);
  }

  // Handle Save
  const handleSave = () => {
    setValidationError(null);

    // Validation
    if (!draftSettings.business.name.trim()) {
      setValidationError("Coffee shop name cannot be empty.");
      return;
    }
    if (
      !draftSettings.taxCurrency.currencyCode.trim() ||
      !draftSettings.taxCurrency.currencySymbol.trim()
    ) {
      setValidationError("Currency code and symbol are required.");
      return;
    }
    if (
      !draftSettings.payments.enableCash &&
      !draftSettings.payments.enableCard &&
      !draftSettings.payments.enableMobile
    ) {
      setValidationError(
        "At least one payment method (Cash, Card, or Mobile) must be enabled."
      );
      return;
    }
    if (!draftSettings.orders.orderPrefix.trim()) {
      setValidationError("Order number prefix cannot be empty.");
      return;
    }

    updateSettings(draftSettings);

    // Record audit event
    addAuditLog({
      actor: `${activeUser.role} (${activeUser.name})`,
      action: "Settings Saved",
      target: `Section: ${activeTab}`,
      details: `Updated store configuration for ${activeTab}`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Reset Section to current store settings
  const handleResetSection = () => {
    setDraftSettings((prev) => ({
      ...prev,
      [activeTab]: settings[activeTab as keyof Settings],
    }));
    setValidationError(null);
  };

  // Confirm Reset to factory defaults
  const handleConfirmResetDefaults = () => {
    const fresh = resetSettingsToDefaults();
    setDraftSettings(fresh);
    addAuditLog({
      actor: `${activeUser.role} (${activeUser.name})`,
      action: "Factory Reset",
      target: "System Configuration",
      details: "Reverted all store configuration back to initial factory defaults",
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Settings & Administration"
          subtitle="Configure business profile, statutory taxes, tenders, and staff access."
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SettingsIcon className="text-[#c98b5b]" size={24} />
                <h2 className="text-2xl font-bold tracking-tight text-[#2b1b12]">
                  Store Settings
                </h2>
              </div>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Central configuration management for your coffee shop registers and policies.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2 text-xs font-semibold text-[#8c7a6c] shadow-xs transition hover:bg-[#faf7f3] hover:text-[#c23b3b]"
              >
                <RotateCcw size={13} />
                <span>Reset to Defaults</span>
              </button>

              {activeTab !== "users" && activeTab !== "audit" && (
                <>
                  <button
                    type="button"
                    onClick={handleResetSection}
                    className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2 text-xs font-semibold text-[#66574d] shadow-xs transition hover:bg-[#faf7f3]"
                  >
                    <span>Reset Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#432d20]"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#f5c6c6] bg-[#fbeaea] p-4 text-xs font-semibold text-[#c23b3b] shadow-xs">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#d1e7d4] bg-[#edf6ee] p-4 text-xs font-semibold text-[#3f7a4e] shadow-xs animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Settings and configuration saved successfully!</span>
            </div>
          )}

          {/* Settings Tab Navigation & Panel */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* Tab Navigation Menu */}
            <div className="space-y-1 rounded-2xl border border-[#e8dfd4] bg-white p-2.5 shadow-[0_4px_20px_rgba(72,48,32,0.04)] h-fit">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setValidationError(null);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#2b1b12] text-white shadow-xs"
                        : "text-[#66574d] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-[#c98b5b]" : "text-[#8c7a6c]"}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              {activeTab === "business" && (
                <BusinessSettingsTab
                  data={draftSettings.business}
                  onChange={(b) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      business: { ...prev.business, ...b },
                    }))
                  }
                />
              )}

              {activeTab === "taxCurrency" && (
                <TaxCurrencySettingsTab
                  data={draftSettings.taxCurrency}
                  onChange={(t) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      taxCurrency: { ...prev.taxCurrency, ...t },
                    }))
                  }
                />
              )}

              {activeTab === "pos" && (
                <PosSettingsTab
                  data={draftSettings.pos}
                  onChange={(p) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      pos: { ...prev.pos, ...p },
                    }))
                  }
                />
              )}

              {activeTab === "payments" && (
                <PaymentSettingsTab
                  data={draftSettings.payments}
                  onChange={(pay) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      payments: { ...prev.payments, ...pay },
                    }))
                  }
                />
              )}

              {activeTab === "receipt" && (
                <ReceiptSettingsTab
                  data={draftSettings.receipt}
                  onChange={(r) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      receipt: { ...prev.receipt, ...r },
                    }))
                  }
                />
              )}

              {activeTab === "orders" && (
                <OrderSettingsTab
                  data={draftSettings.orders}
                  onChange={(o) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      orders: { ...prev.orders, ...o },
                    }))
                  }
                />
              )}

              {activeTab === "users" && <UsersTab />}

              {activeTab === "notifications" && (
                <NotificationsTab
                  data={draftSettings.notifications}
                  onChange={(n) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, ...n },
                    }))
                  }
                />
              )}

              {activeTab === "audit" && <AuditLogTab />}
            </div>
          </div>
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetDefaultsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetDefaults}
      />
    </div>
  );
}
