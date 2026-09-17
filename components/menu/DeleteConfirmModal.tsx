"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Product } from "@/data/products";
import { useModalEscape } from "@/lib/use-modal-escape";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  product,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  useModalEscape(isOpen, onClose);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
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
          <AlertTriangle size={24} />
        </div>

        <h3 id="delete-modal-title" className="mt-4 text-lg font-bold text-[#2b1b12]">
          Delete &ldquo;{product.name}&rdquo;?
        </h3>

        <p className="mt-1.5 text-xs text-[#8c7a6c] leading-relaxed">
          This will permanently remove <span className="font-semibold text-[#2b1b12]">{product.name}</span> ({product.sku || "SKU N/A"}) from the menu catalog and POS interface. This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <Trash2 size={14} />
            <span>Delete Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
