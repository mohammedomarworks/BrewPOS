"use client";

import { useState } from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  Store,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import type { CompletedOrder, OrderStatus, OrderType } from "@/types/pos";
import Receipt from "@/components/pos/Receipt";

interface OrderDetailsModalProps {
  order: CompletedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderNumber: string, newStatus: OrderStatus) => void;
}

export function getStatusBadgeStyle(status: OrderStatus) {
  switch (status) {
    case "Completed":
      return "bg-[#edf6ee] text-[#3b7b46] border-[#bde2c1]";
    case "Pending":
      return "bg-[#fef7ee] text-[#b46d0e] border-[#f8ddb2]";
    case "Preparing":
      return "bg-[#fff4ed] text-[#cc5a1b] border-[#fecfb2]";
    case "Ready":
      return "bg-[#eef4fe] text-[#255ec4] border-[#bfd4f9]";
    case "Confirmed":
      return "bg-[#f0f7f7] text-[#286f70] border-[#bedfdf]";
    case "Cancelled":
      return "bg-[#fdf0f0] text-[#ba3030] border-[#f6bbbb]";
    case "Refunded":
      return "bg-[#f4f2f0] text-[#6d6056] border-[#d8d0c8]";
    default:
      return "bg-[#faf7f3] text-[#66574d] border-[#e8dfd4]";
  }
}

function renderOrderTypeIcon(type: OrderType) {
  switch (type) {
    case "Dine In":
      return <Store size={15} />;
    case "Take Away":
      return <ShoppingBag size={15} />;
    case "Delivery":
      return <Truck size={15} />;
    default:
      return <ShoppingBag size={15} />;
  }
}

function renderPaymentIcon(method: string) {
  switch (method) {
    case "cash":
      return <Banknote size={15} />;
    case "card":
      return <CreditCard size={15} />;
    case "mobile":
      return <Smartphone size={15} />;
    default:
      return <CreditCard size={15} />;
  }
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusChange,
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (onStatusChange) {
      onStatusChange(order.orderNumber, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity print:bg-white print:p-0">
      {/* Reusable Print receipt for window.print() */}
      <Receipt order={order} variant="print-only" />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Hash size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2b1b12]">Order Details</h2>
                <span className="font-mono text-xs font-semibold text-[#6d4730]">
                  {order.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  title="Copy Order Number"
                  className="text-[#9b897b] transition hover:text-[#2b1b12]"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#8c7a6c]">{order.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <p className="text-[11px] font-medium text-[#9b897b]">Status</p>
              {onStatusChange ? (
                <div className="mt-1">
                  <select
                    value={order.status}
                    onChange={handleStatusSelect}
                    className={`h-7 w-full rounded-lg border px-2 text-xs font-semibold outline-none transition cursor-pointer ${getStatusBadgeStyle(
                      order.status
                    )}`}
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              ) : (
                <span
                  className={`mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <p className="text-[11px] font-medium text-[#9b897b]">Customer</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
                <User size={13} className="text-[#8c7a6c]" />
                <span className="truncate">{order.customer}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <p className="text-[11px] font-medium text-[#9b897b]">Order Type</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#2b1b12]">
                {renderOrderTypeIcon(order.orderType)}
                <span>{order.orderType}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <p className="text-[11px] font-medium text-[#9b897b]">Payment</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold capitalize text-[#2b1b12]">
                {renderPaymentIcon(order.payment.method)}
                <span>
                  {order.payment.method === "mobile"
                    ? "Mobile"
                    : order.payment.method}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#eee5dc]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                  <tr>
                    <th className="px-3.5 py-2.5">Product</th>
                    <th className="px-3.5 py-2.5 text-center">Qty</th>
                    <th className="px-3.5 py-2.5 text-right">Unit Price</th>
                    <th className="px-3.5 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebe3] bg-white">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf7f3]/60 transition">
                      <td className="px-3.5 py-2.5 font-medium text-[#2b1b12]">
                        {item.name}
                        <span className="block text-[11px] text-[#9b897b]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-medium text-[#66574d]">
                        {item.quantity}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-[#66574d]">
                        ৳{item.price.toFixed(2)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-[#6d4730]">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Payment Specifics */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Details */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/70 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9b897b]">
                Payment Specifics
              </h4>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8c7a6c]">Method:</span>
                  <span className="font-semibold capitalize text-[#2b1b12]">
                    {order.payment.method === "mobile"
                      ? "Mobile Payment"
                      : order.payment.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7a6c]">Amount Tendered:</span>
                  <span className="font-semibold text-[#2b1b12]">
                    ৳{order.payment.amountReceived.toFixed(2)}
                  </span>
                </div>

                {order.payment.method === "cash" && (
                  <div className="flex justify-between font-medium text-emerald-700">
                    <span>Change Returned:</span>
                    <span className="font-bold">
                      ৳{order.payment.change.toFixed(2)}
                    </span>
                  </div>
                )}

                {order.payment.cardLast4 && (
                  <div className="flex justify-between">
                    <span className="text-[#8c7a6c]">Card Masked:</span>
                    <span className="font-mono text-[#2b1b12]">
                      •••• {order.payment.cardLast4}
                    </span>
                  </div>
                )}

                {order.payment.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-[#8c7a6c]">Transaction Ref:</span>
                    <span className="font-mono text-[#6d4730]">
                      {order.payment.transactionRef}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#eee5dc] pt-2 text-[11px] text-[#9b897b]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Timestamp:
                  </span>
                  <span>{order.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/70 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9b897b]">
                Financial Summary
              </h4>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#66574d]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2b1b12]">
                    ৳{order.subtotal.toFixed(2)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-[#c98b5b]">
                    <span>Discount ({order.discountPercent}%)</span>
                    <span className="font-semibold">-৳{order.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8c7a6c]">
                  <span>Taxable Amount</span>
                  <span>৳{order.taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>VAT (15%)</span>
                  <span className="font-medium text-[#2b1b12]">
                    ৳{order.vat.toFixed(2)}
                  </span>
                </div>

                <div className="my-2 border-t border-dashed border-[#ddd0c4]" />

                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-sm font-bold text-[#2b1b12]">
                    Grand Total
                  </span>
                  <span className="text-xl font-extrabold text-[#6d4730]">
                    ৳{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <Printer size={16} />
            Print Receipt
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#40291d]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
