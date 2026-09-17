"use client";

import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ClipboardList,
  TrendingUp,
  ReceiptText,
  Clock,
  Pencil,
  Power,
  Store,
  ShoppingBag,
  Truck,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import type { Customer, CustomerWithStats } from "@/types/customer";
import type { CompletedOrder, OrderType } from "@/types/pos";
import { getStatusBadgeStyle } from "@/components/orders/OrderDetailsModal";

interface CustomerDetailsModalProps {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  orders: CompletedOrder[];
  onEdit: (customer: Customer) => void;
  onToggleStatus: (id: string) => void;
  onViewOrder: (order: CompletedOrder) => void;
}

function renderTypeIcon(type: OrderType) {
  switch (type) {
    case "Dine In":
      return <Store size={13} />;
    case "Take Away":
      return <ShoppingBag size={13} />;
    case "Delivery":
      return <Truck size={13} />;
    default:
      return <ShoppingBag size={13} />;
  }
}

function renderPaymentIcon(method: string) {
  switch (method) {
    case "cash":
      return <Banknote size={13} />;
    case "card":
      return <CreditCard size={13} />;
    case "mobile":
      return <Smartphone size={13} />;
    default:
      return <CreditCard size={13} />;
  }
}

export default function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  orders,
  onEdit,
  onToggleStatus,
  onViewOrder,
}: CustomerDetailsModalProps) {
  if (!isOpen || !customer) return null;

  // Filter orders for this customer
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === customer.id ||
      (!o.customerId && o.customer.toLowerCase() === customer.name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2b1b12] text-base font-bold text-white shadow-sm">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2b1b12]">{customer.name}</h2>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    customer.status === "Active"
                      ? "bg-[#edf6ee] text-[#3b7b46] border-[#bde2c1]"
                      : "bg-[#f4f2f0] text-[#6d6056] border-[#d8d0c8]"
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <p className="text-xs text-[#8c7a6c] flex items-center gap-1.5 mt-0.5">
                <span>{customer.id}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> Joined{" "}
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(customer.id)}
              className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              title={customer.status === "Active" ? "Mark Inactive" : "Mark Active"}
            >
              <Power size={13} className={customer.status === "Active" ? "text-[#3b7b46]" : "text-[#6d6056]"} />
              <span className="hidden sm:inline">
                {customer.status === "Active" ? "Deactivate" : "Activate"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(customer)}
              className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
            >
              <Pencil size={13} />
              <span className="hidden sm:inline">Edit</span>
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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Total Orders */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <div className="flex items-center justify-between text-[#8c7a6c]">
                <span className="text-[11px] font-medium uppercase tracking-wider">Orders</span>
                <ClipboardList size={14} className="text-[#c98b5b]" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-[#2b1b12]">
                {customer.totalOrders}
              </p>
              <p className="text-[11px] text-[#9b897b]">Completed orders</p>
            </div>

            {/* Total Spent */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <div className="flex items-center justify-between text-[#8c7a6c]">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Spent</span>
                <TrendingUp size={14} className="text-[#3b7b46]" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-[#6d4730]">
                ৳{customer.totalSpent.toFixed(2)}
              </p>
              <p className="text-[11px] text-[#9b897b]">Lifetime spend</p>
            </div>

            {/* Average Order Value */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <div className="flex items-center justify-between text-[#8c7a6c]">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg. Order</span>
                <ReceiptText size={14} className="text-[#2b1b12]" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-[#2b1b12]">
                ৳{customer.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-[11px] text-[#9b897b]">Per transaction</p>
            </div>

            {/* Last Order Date */}
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <div className="flex items-center justify-between text-[#8c7a6c]">
                <span className="text-[11px] font-medium uppercase tracking-wider">Last Order</span>
                <Clock size={14} className="text-[#b46d0e]" />
              </div>
              <p className="mt-1.5 text-sm font-bold text-[#2b1b12] truncate">
                {customer.lastOrderAt || "Never"}
              </p>
              <p className="text-[11px] text-[#9b897b]">Most recent visit</p>
            </div>
          </div>

          {/* Contact Information & Preferences */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b] mb-3">
                Contact Information
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#2b1b12]">
                  <Phone size={14} className="text-[#8c7a6c] shrink-0" />
                  <span className="font-medium">{customer.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-[#2b1b12]">
                  <Mail size={14} className="text-[#8c7a6c] shrink-0" />
                  <span className="font-medium">{customer.email || "No email registered"}</span>
                </div>

                <div className="flex items-start gap-2 text-[#2b1b12]">
                  <MapPin size={14} className="text-[#8c7a6c] shrink-0 mt-0.5" />
                  <span className="font-medium">{customer.address || "No address provided"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b] mb-3">
                Preferences & Notes
              </h3>
              <p className="text-xs text-[#66574d] italic leading-relaxed">
                {customer.notes ? `"${customer.notes}"` : "No notes recorded for this customer."}
              </p>
            </div>
          </div>

          {/* Order History Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText size={16} className="text-[#c98b5b]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                  Purchase History ({customerOrders.length})
                </h3>
              </div>
            </div>

            {customerOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8cabc] bg-[#faf7f3]/40 p-8 text-center">
                <p className="font-medium text-sm text-[#2b1b12]">No order history found</p>
                <p className="mt-1 text-xs text-[#8c7a6c]">
                  This customer has not completed any orders yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#eee5dc]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-4 py-2.5">Order</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Payment</th>
                      <th className="px-4 py-2.5">Total</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ebe3] bg-white text-xs">
                    {customerOrders.map((order) => (
                      <tr key={order.orderNumber} className="hover:bg-[#faf7f3]/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-[#2b1b12]">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-[#8c7a6c] whitespace-nowrap">
                          {order.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[#66574d]">
                            {renderTypeIcon(order.orderType)}
                            <span>{order.orderType}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 capitalize text-[#66574d]">
                            {renderPaymentIcon(order.payment.method)}
                            <span>{order.payment.method}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#6d4730]">
                          ৳{order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onViewOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#e5dbd0] bg-white px-2 py-1 text-xs font-semibold text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
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
