"use client";

import React from "react";
import { AlertTriangle, X, RotateCcw } from "lucide-react";

interface ResetDefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetDefaultsModal({
  isOpen,
  onClose,
  onConfirm,
}: ResetDefaultsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f0e8df] pb-3">
          <div className="flex items-center gap-2 text-[#c23b3b]">
            <AlertTriangle size={18} />
            <h4 className="text-base font-bold text-[#2b1b12]">
              Reset Settings to Defaults?
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8c7a6c] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-[#6d5b4e]">
          <p>
            This action will revert all store configuration back to factory default values:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#8c7a6c]">
            <li>Store name: <strong>BrewPOS Coffee Shop</strong></li>
            <li>VAT rate: <strong>15% (Bangladesh standard)</strong></li>
            <li>Tender currency: <strong>৳ (BDT)</strong></li>
            <li>All payment tenders re-enabled (Cash, Card, Mobile)</li>
            <li>Standard receipt header & footer greetings</li>
          </ul>

          <div className="rounded-xl border border-[#edf6ee] bg-[#f8fbf8] p-3 text-[11px] text-[#3f7a4e]">
            <strong>Safe operation:</strong> Your historical orders, customer records, inventory catalog, and report analytics will <u>NOT</u> be deleted.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0e8df]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5dbd0] px-4 py-2 text-xs font-semibold text-[#66574d] hover:bg-[#faf7f3]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#c23b3b] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#a82a2a]"
          >
            <RotateCcw size={13} />
            <span>Reset Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
