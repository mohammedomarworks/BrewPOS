"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Discount } from "@/types/discount";
import { useModalEscape } from "@/lib/use-modal-escape";

interface DeleteDiscountModalProps {
  isOpen: boolean;
  discount: Discount | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export default function DeleteDiscountModal({
  isOpen,
  discount,
  onClose,
  onConfirmDelete,
}: DeleteDiscountModalProps) {
  useModalEscape(isOpen, onClose);

  if (!isOpen || !discount) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-discount-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white p-6 shadow-2xl transition-all"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
        >
          <X size={16} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle size={26} />
        </div>

        <h3 id="delete-discount-title" className="mt-4 text-lg font-bold text-[#2b1b12]">
          Delete Promotion?
        </h3>

        <p className="mt-2 text-xs text-[#66574d] leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#2b1b12]">
            {discount.name} ({discount.code})
          </span>
          ?
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <p className="font-semibold">Note on Order History:</p>
          <p className="mt-0.5 text-[11px] text-amber-800">
            Deleting this promotion stops it from being redeemed in new POS orders.
            Historical completed orders will preserve their discount records.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5dbd0] px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-red-700"
          >
            <Trash2 size={14} />
            Delete Promotion
          </button>
        </div>
      </div>
    </div>
  );
}
