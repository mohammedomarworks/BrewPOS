"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  Eye,
  ShoppingBag,
  Store,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  ClipboardList,
  CheckCircle2,
  Clock,
  Ban,
  TrendingUp,
  ReceiptText,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SkeletonTable from "@/components/ui/SkeletonTable";
import OrderDetailsModal, {
  getStatusBadgeStyle,
} from "@/components/orders/OrderDetailsModal";
import { useOrdersStore } from "@/lib/orders";
import { formatCurrency } from "@/lib/settings-store";
import type { CompletedOrder, OrderStatus, OrderType } from "@/types/pos";

type DateFilter = "All" | "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days";

function isWithinDateRange(createdAtStr: string, filter: DateFilter): boolean {
  if (filter === "All") return true;

  const orderDate = new Date(createdAtStr);
  if (isNaN(orderDate.getTime())) return true;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(
    startOfToday.getTime() - 24 * 60 * 60 * 1000
  );
  const endOfYesterday = new Date(startOfToday.getTime() - 1);
  const sevenDaysAgo = new Date(
    startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000
  );
  const thirtyDaysAgo = new Date(
    startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  switch (filter) {
    case "Today":
      return orderDate >= startOfToday;
    case "Yesterday":
      return orderDate >= startOfYesterday && orderDate <= endOfYesterday;
    case "Last 7 Days":
      return orderDate >= sevenDaysAgo;
    case "Last 30 Days":
      return orderDate >= thirtyDaysAgo;
    default:
      return true;
  }
}

function renderTypeIcon(type: OrderType) {
  switch (type) {
    case "Dine In":
      return <Store size={14} />;
    case "Take Away":
      return <ShoppingBag size={14} />;
    case "Delivery":
      return <Truck size={14} />;
    default:
      return <ShoppingBag size={14} />;
  }
}

function renderPaymentIcon(method: string) {
  switch (method) {
    case "cash":
      return <Banknote size={14} />;
    case "card":
      return <CreditCard size={14} />;
    case "mobile":
      return <Smartphone size={14} />;
    default:
      return <CreditCard size={14} />;
  }
}

export default function OrdersPage() {
  const { orders, isLoaded, updateOrderStatus } = useOrdersStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All");

  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term);

      // Status
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      // Payment
      const matchesPayment =
        paymentFilter === "All" ||
        order.payment.method.toLowerCase() === paymentFilter.toLowerCase();

      // Order Type
      const matchesType =
        orderTypeFilter === "All" || order.orderType === orderTypeFilter;

      // Date
      const matchesDate = isWithinDateRange(order.createdAt, dateFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesType &&
        matchesDate
      );
    });
  }, [orders, search, statusFilter, paymentFilter, orderTypeFilter, dateFilter]);

  // Real-time Summary Cards
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const pending = orders.filter(
      (o) => o.status === "Pending" || o.status === "Preparing"
    ).length;
    const cancelled = orders.filter(
      (o) => o.status === "Cancelled" || o.status === "Refunded"
    ).length;

    // Total sales for active valid orders
    const totalSales = orders
      .filter((o) => o.status !== "Cancelled" && o.status !== "Refunded")
      .reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, completed, pending, cancelled, totalSales };
  }, [orders]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    paymentFilter !== "All" ||
    orderTypeFilter !== "All" ||
    dateFilter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setOrderTypeFilter("All");
    setDateFilter("All");
  };

  const handleViewOrder = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (orderNumber: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderNumber, newStatus);
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Orders" subtitle="Customer order management" />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Page Heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#2b1b12]">
                Orders
              </h1>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                View and manage all customer orders.
              </p>
            </div>

            <Link
              href="/pos"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
            >
              <Plus size={16} />
              <span>Create New Order</span>
            </Link>
          </div>

          {/* Metric Summary Cards */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Total Orders</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730]">
                  <ClipboardList size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#2b1b12]">
                {metrics.totalOrders}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Recorded orders</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Completed</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3b7b46]">
                  <CheckCircle2 size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#3b7b46]">
                {metrics.completed}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Fully processed</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Pending</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fef7ee] text-[#b46d0e]">
                  <Clock size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#b46d0e]">
                {metrics.pending}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">In progress</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Cancelled</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf0f0] text-[#ba3030]">
                  <Ban size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#ba3030]">
                {metrics.cancelled}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Void or refunded</p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)] sm:col-span-1 xl:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Total Sales</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#c98b5b]">
                  <TrendingUp size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#6d4730]">
                {formatCurrency(metrics.totalSales)}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Net revenue</p>
            </div>
          </section>

          {/* Search and Filters Bar */}
          <section className="mt-6 rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b897b]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order number (e.g. 00001) or customer..."
                  className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              {/* Filters Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>

                {/* Payment Filter */}
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Payments</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Mobile">Mobile Payment</option>
                </select>

                {/* Order Type Filter */}
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Types</option>
                  <option value="Dine In">Dine In</option>
                  <option value="Take Away">Take Away</option>
                  <option value="Delivery">Delivery</option>
                </select>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-[#e5dbd0] px-3 text-xs font-semibold text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Orders Table Section */}
          <section className="mt-6 rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)] overflow-hidden">
            {/* Table Header Metadata */}
            <div className="flex items-center justify-between border-b border-[#eee5dc] px-6 py-4">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-[#c98b5b]" />
                <h2 className="font-semibold text-[#2b1b12]">Order Records</h2>
                <span className="rounded-md bg-[#faf7f3] border border-[#e8dfd4] px-2 py-0.5 text-xs font-medium text-[#6d4730]">
                  {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                </span>
              </div>
            </div>

            {/* Empty State: No orders at all */}
            {!isLoaded ? (
              <div className="p-4">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9f8068]">
                  <ClipboardList size={30} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#2b1b12]">
                  No orders yet
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#8c7a6c]">
                  There are no customer orders recorded. Use the POS module to create
                  and process new coffee shop orders.
                </p>
                <Link
                  href="/pos"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
                >
                  <Plus size={16} />
                  <span>Create New Order</span>
                </Link>
              </div>
            ) : filteredOrders.length === 0 ? (
              /* Empty State: Filter produced 0 results */
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f3] border border-[#e8dfd4] text-[#9f8068]">
                  <Filter size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#2b1b12]">
                  No matching orders
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#8c7a6c]">
                  No orders match your current filter and search criteria. Try
                  clearing filters or searching with a different term.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                >
                  <RotateCcw size={13} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              /* Orders Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-5 py-3.5">Order</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5">Total</th>
                      <th className="px-5 py-3.5">Payment</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee5dc]">
                    {filteredOrders.map((order) => {
                      const totalQty = order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      );

                      return (
                        <tr
                          key={order.orderNumber}
                          className="hover:bg-[#faf7f3]/70 transition"
                        >
                          {/* Order Number */}
                          <td className="px-5 py-4 font-mono font-bold text-xs text-[#2b1b12]">
                            {order.orderNumber}
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4 font-medium text-[#2b1b12]">
                            {order.customer}
                          </td>

                          {/* Type */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 py-1 text-xs font-medium text-[#66574d]">
                              {renderTypeIcon(order.orderType)}
                              <span>{order.orderType}</span>
                            </span>
                          </td>

                          {/* Items */}
                          <td className="px-5 py-4 text-xs text-[#66574d]">
                            <span className="font-semibold text-[#2b1b12]">
                              {totalQty} {totalQty === 1 ? "item" : "items"}
                            </span>
                            <span className="block truncate max-w-[140px] text-[11px] text-[#9b897b]">
                              {order.items.map((i) => i.name).join(", ")}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 font-bold text-[#6d4730]">
                            {formatCurrency(order.total)}
                          </td>

                          {/* Payment */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize text-[#66574d]">
                              {renderPaymentIcon(order.payment.method)}
                              <span>
                                {order.payment.method === "mobile"
                                  ? "Mobile"
                                  : order.payment.method}
                              </span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-xs text-[#8c7a6c] whitespace-nowrap">
                            {order.createdAt}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewOrder(order)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#e5dbd0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsOpen}
          order={selectedOrder}
          onClose={() => setIsDetailsOpen(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
