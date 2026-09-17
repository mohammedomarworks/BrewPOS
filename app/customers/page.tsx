"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Power,
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import CustomerModal from "@/components/customers/CustomerModal";
import CustomerDetailsModal from "@/components/customers/CustomerDetailsModal";
import DeleteCustomerModal from "@/components/customers/DeleteCustomerModal";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import {
  useCustomersStore,
  calculateCustomerMetrics,
} from "@/lib/customers";
import { useOrdersStore } from "@/lib/orders";
import type { Customer, CustomerInput, CustomerWithStats } from "@/types/customer";
import type { CompletedOrder, OrderStatus } from "@/types/pos";

export default function CustomersPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  } = useCustomersStore();

  const { orders, updateOrderStatus } = useOrdersStore();

  // Search and Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activityFilter, setActivityFilter] = useState<string>("All");

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sub-modal: Order details view from customer history
  const [viewingOrder, setViewingOrder] = useState<CompletedOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Pure reference timestamp for calculating new customer window
  const [currentTime] = useState(() => Date.now());

  // Derive stats for all customers from authoritative orders
  const customersWithStats: CustomerWithStats[] = useMemo(() => {
    return customers.map((c) => calculateCustomerMetrics(c, orders));
  }, [customers, orders]);

  // Keep selectedCustomer updated if orders or customers change
  const currentSelectedCustomer = useMemo(() => {
    if (!selectedCustomer) return null;
    const found = customersWithStats.find((c) => c.id === selectedCustomer.id);
    return found || null;
  }, [selectedCustomer, customersWithStats]);

  // Dynamic Summary Cards calculated from actual data
  const metrics = useMemo(() => {
    const totalCustomers = customersWithStats.length;
    const activeCustomers = customersWithStats.filter(
      (c) => c.status === "Active"
    ).length;

    // New customers in the last 30 days
    const thirtyDaysAgo = currentTime - 30 * 24 * 60 * 60 * 1000;
    const newCustomers = customersWithStats.filter((c) => {
      const created = new Date(c.createdAt).getTime();
      return !isNaN(created) && created >= thirtyDaysAgo;
    }).length;

    // Total Customer Sales (sum of totals from orders made by registered customers)
    const totalCustomerSales = customersWithStats.reduce(
      (sum, c) => sum + c.totalSpent,
      0
    );

    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      totalCustomerSales,
    };
  }, [customersWithStats, currentTime]);

  // Filtered Customer List
  const filteredCustomers = useMemo(() => {
    return customersWithStats.filter((c) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesActivity =
        activityFilter === "All" ||
        (activityFilter === "Has Orders" && c.totalOrders > 0) ||
        (activityFilter === "No Orders" && c.totalOrders === 0);

      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [customersWithStats, search, statusFilter, activityFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    activityFilter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setActivityFilter("All");
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (data: CustomerInput) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer(data);
    }
    setIsCustomerModalOpen(false);
  };

  const handleOpenDetails = (c: CustomerWithStats) => {
    setSelectedCustomer(c);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (c: Customer) => {
    setCustomerToDelete(c);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      if (selectedCustomer?.id === customerToDelete.id) {
        setIsDetailsOpen(false);
      }
      setCustomerToDelete(null);
    }
  };

  const handleDeactivateCustomer = (id: string) => {
    updateCustomer(id, { status: "Inactive" });
  };

  const handleViewOrder = (order: CompletedOrder) => {
    setViewingOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleOrderStatusChange = (
    orderNumber: string,
    newStatus: OrderStatus
  ) => {
    updateOrderStatus(orderNumber, newStatus);
    if (viewingOrder && viewingOrder.orderNumber === orderNumber) {
      setViewingOrder({ ...viewingOrder, status: newStatus });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Customers"
          subtitle="Manage customer profiles, activity, and purchase history"
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#2b1b12]">
                Customers
              </h1>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Manage customer profiles, activity, and purchase history.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
              >
                <Plus size={16} />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Customers */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Total Customers</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730]">
                  <Users size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#2b1b12]">
                {metrics.totalCustomers}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Registered profiles</p>
            </div>

            {/* Active Customers */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Active Customers</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3b7b46]">
                  <UserCheck size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#3b7b46]">
                {metrics.activeCustomers}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Available in POS register</p>
            </div>

            {/* New Customers */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">New Customers</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fef7ee] text-[#b46d0e]">
                  <UserPlus size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#b46d0e]">
                {metrics.newCustomers}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Joined in last 30 days</p>
            </div>

            {/* Total Customer Sales */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Customer Sales</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#c98b5b]">
                  <TrendingUp size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#6d4730]">
                ৳{metrics.totalCustomerSales.toFixed(2)}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">From customer orders</p>
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
                  placeholder="Search by name, phone (+880...), or email..."
                  className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Activity Filter */}
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Activity</option>
                  <option value="Has Orders">Has Orders</option>
                  <option value="No Orders">No Orders</option>
                </select>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-[#e5dbd0] px-3 text-xs font-semibold text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                    title="Reset filters"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Customer Table / Card Section */}
          <section className="mt-6 rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)] overflow-hidden">
            {/* Table Header Metadata */}
            <div className="flex items-center justify-between border-b border-[#eee5dc] px-6 py-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#c98b5b]" />
                <h2 className="font-semibold text-[#2b1b12]">Customer Profiles</h2>
                <span className="rounded-md bg-[#faf7f3] border border-[#e8dfd4] px-2 py-0.5 text-xs font-medium text-[#6d4730]">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? "customer" : "customers"}
                </span>
              </div>
            </div>

            {/* Empty State: No Customers in Store */}
            {customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9f8068]">
                  <Users size={32} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#2b1b12]">
                  No customers yet
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#8c7a6c]">
                  There are no customer profiles registered yet. Add your first customer
                  to start tracking loyalty, order history, and personal preferences.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
                >
                  <Plus size={16} />
                  <span>Add Customer</span>
                </button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              /* Empty State: Filter produced 0 results */
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f3] border border-[#e8dfd4] text-[#9f8068]">
                  <Filter size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#2b1b12]">
                  No matching customers found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#8c7a6c]">
                  No customer profiles match your current search and filter settings.
                  Try clearing your filters or searching with a different term.
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
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Phone</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5 text-center">Orders</th>
                      <th className="px-5 py-3.5">Total Spent</th>
                      <th className="px-5 py-3.5">Last Order</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee5dc]">
                    {filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-[#faf7f3]/70 transition cursor-pointer"
                        onClick={() => handleOpenDetails(c)}
                      >
                        {/* Customer Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2b1b12] text-xs font-bold text-white shadow-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#2b1b12]">
                                {c.name}
                              </p>
                              <p className="text-[11px] text-[#9b897b]">
                                {c.id} {c.address ? `• ${c.address}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4 text-xs font-medium text-[#2b1b12] whitespace-nowrap">
                          {c.phone}
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-xs text-[#66574d] truncate max-w-[160px]">
                          {c.email || <span className="text-[#a39284]">—</span>}
                        </td>

                        {/* Orders */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-md bg-[#faf7f3] border border-[#e5dbd0] px-2 py-0.5 text-xs font-bold text-[#2b1b12]">
                            {c.totalOrders}
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td className="px-5 py-4 font-bold text-[#6d4730] whitespace-nowrap">
                          ৳{c.totalSpent.toFixed(2)}
                        </td>

                        {/* Last Order */}
                        <td className="px-5 py-4 text-xs text-[#8c7a6c] whitespace-nowrap">
                          {c.lastOrderAt || <span className="text-[#a39284]">Never</span>}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              c.status === "Active"
                                ? "bg-[#edf6ee] text-[#3b7b46] border-[#bde2c1]"
                                : "bg-[#f4f2f0] text-[#6d6056] border-[#d8d0c8]"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-5 py-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(c)}
                              className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                              title="View Customer Details"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c)}
                              className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                              title="Edit Customer"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleCustomerStatus(c.id)}
                              className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                              title={c.status === "Active" ? "Set Inactive" : "Set Active"}
                            >
                              <Power
                                size={14}
                                className={c.status === "Active" ? "text-[#3b7b46]" : "text-[#6d6056]"}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDelete(c)}
                              className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#a39284] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                              title="Delete Customer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          key={editingCustomer?.id || "new"}
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Customer Details Drawer / Modal */}
      {isDetailsOpen && currentSelectedCustomer && (
        <CustomerDetailsModal
          customer={currentSelectedCustomer}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          orders={orders}
          onEdit={(c) => {
            setIsDetailsOpen(false);
            handleOpenEditModal(c);
          }}
          onToggleStatus={(id) => toggleCustomerStatus(id)}
          onViewOrder={handleViewOrder}
        />
      )}

      {/* Delete / Deactivate Customer Modal */}
      {isDeleteModalOpen && customerToDelete && (
        <DeleteCustomerModal
          isOpen={isDeleteModalOpen}
          customer={customerToDelete}
          orderCount={
            customersWithStats.find((c) => c.id === customerToDelete.id)
              ?.totalOrders || 0
          }
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCustomerToDelete(null);
          }}
          onConfirmDelete={handleConfirmDelete}
          onDeactivate={() => handleDeactivateCustomer(customerToDelete.id)}
        />
      )}

      {/* Nested Order Details Modal */}
      {isOrderDetailsOpen && viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
          onStatusChange={handleOrderStatusChange}
        />
      )}
    </div>
  );
}
