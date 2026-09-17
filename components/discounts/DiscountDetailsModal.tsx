"use client";

import {
  X,
  Tag,
  Percent,
  Banknote,
  Calendar,
} from "lucide-react";
import type { Discount, DiscountStatus } from "@/types/discount";
import type { Product } from "@/data/products";

interface DiscountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  status: DiscountStatus;
  products: Product[];
  onEdit: (discount: Discount) => void;
}

function getStatusBadge(status: DiscountStatus) {
  switch (status) {
    case "Active":
      return "bg-[#edf6ee] text-[#3b7b46] border-[#bde2c1]";
    case "Scheduled":
      return "bg-[#f3f0ff] text-[#6b46c1] border-[#d6bcfa]";
    case "Expired":
      return "bg-[#fdf0ea] text-[#bc5328] border-[#f6cdb9]";
    case "Inactive":
      return "bg-[#f4f2f0] text-[#786d65] border-[#d8d3cf]";
    default:
      return "bg-[#f4f2f0] text-[#786d65] border-[#d8d3cf]";
  }
}

export default function DiscountDetailsModal({
  isOpen,
  onClose,
  discount,
  status,
  products,
  onEdit,
}: DiscountDetailsModalProps) {
  if (!isOpen || !discount) return null;

  const targetProducts =
    discount.appliesTo === "Specific Products" && discount.productIds
      ? products.filter((p) => discount.productIds?.includes(p.id))
      : [];

  const usagePercent =
    discount.usageLimit !== undefined && discount.usageLimit > 0
      ? Math.min(100, Math.round((discount.usageCount / discount.usageLimit) * 100))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Tag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2b1b12]">
                  {discount.name}
                </h2>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-[#c98b5b]">
                {discount.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
          {/* Main Value Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-[#eee5dc] bg-gradient-to-br from-[#faf7f3] to-[#f4ece4] p-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                Promotion Value
              </span>
              <p className="text-2xl font-black text-[#2b1b12]">
                {discount.type === "Percentage"
                  ? `${discount.value}% OFF`
                  : `৳${discount.value.toFixed(2)} Flat OFF`}
              </p>
              {discount.description && (
                <p className="mt-1 text-xs text-[#66574d]">{discount.description}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2b1b12] text-white">
              {discount.type === "Percentage" ? (
                <Percent size={22} />
              ) : (
                <Banknote size={22} />
              )}
            </div>
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <span className="text-[11px] font-medium text-[#9b897b]">Applies To</span>
              <p className="mt-1 font-semibold text-[#2b1b12]">
                {discount.appliesTo}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <span className="text-[11px] font-medium text-[#9b897b]">Eligibility</span>
              <p className="mt-1 font-semibold text-[#2b1b12]">
                {discount.customerEligibility}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <span className="text-[11px] font-medium text-[#9b897b]">
                Minimum Order
              </span>
              <p className="mt-1 font-semibold text-[#2b1b12]">
                {discount.minimumOrderAmount
                  ? `৳${discount.minimumOrderAmount.toFixed(2)}`
                  : "None"}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <span className="text-[11px] font-medium text-[#9b897b]">
                Maximum Discount
              </span>
              <p className="mt-1 font-semibold text-[#2b1b12]">
                {discount.maximumDiscountAmount
                  ? `৳${discount.maximumDiscountAmount.toFixed(2)}`
                  : "No limit"}
              </p>
            </div>
          </div>

          {/* Usage & Redemptions */}
          <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2b1b12]">Total Redemptions</span>
              <span className="font-bold text-[#6d4730]">
                {discount.usageCount}{" "}
                {discount.usageLimit ? `/ ${discount.usageLimit}` : "(Unlimited)"}
              </span>
            </div>
            {usagePercent !== null && (
              <div className="mt-2.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee5dc]">
                  <div
                    className="h-full rounded-full bg-[#c98b5b] transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[10px] text-[#8c7a6c]">
                  {usagePercent}% of limit reached
                </div>
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="space-y-2 rounded-2xl border border-[#eee5dc] bg-white p-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#9b897b]">
              <Calendar size={13} />
              <span>Validity Schedule</span>
            </div>
            <div className="flex justify-between text-[#66574d]">
              <span>Valid From:</span>
              <span className="font-medium text-[#2b1b12]">
                {discount.startAt
                  ? new Date(discount.startAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Immediate"}
              </span>
            </div>
            <div className="flex justify-between text-[#66574d]">
              <span>Valid Until:</span>
              <span className="font-medium text-[#2b1b12]">
                {discount.endAt
                  ? new Date(discount.endAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "No expiry date"}
              </span>
            </div>
          </div>

          {/* Targeting Scope Details */}
          {discount.appliesTo === "Specific Products" && (
            <div className="rounded-2xl border border-[#eee5dc] bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                Target Products ({targetProducts.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targetProducts.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 py-1 text-xs font-medium text-[#2b1b12]"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {discount.appliesTo === "Specific Categories" &&
            discount.categoryIds &&
            discount.categoryIds.length > 0 && (
              <div className="rounded-2xl border border-[#eee5dc] bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                  Target Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {discount.categoryIds.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 py-1 text-xs font-semibold text-[#6d4730]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#eee5dc] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] px-5 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(discount);
              }}
              className="rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#40291d]"
            >
              Edit Promotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
