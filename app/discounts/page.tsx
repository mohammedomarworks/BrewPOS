"use client";

import { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Search,
  Percent,
  Banknote,
  Eye,
  Pencil,
  Copy,
  Power,
  Trash2,
  Check,
  TrendingUp,
  Clock,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import DiscountModal from "@/components/discounts/DiscountModal";
import DiscountDetailsModal from "@/components/discounts/DiscountDetailsModal";
import DeleteDiscountModal from "@/components/discounts/DeleteDiscountModal";
import {
  useDiscountsStore,
  getDiscountStatus,
  calculateTotalDiscountGiven,
} from "@/lib/discounts";
import { useProductsStore, useCategoriesStore } from "@/lib/products";
import { useOrdersStore } from "@/lib/orders";
import type {
  Discount,
  DiscountInput,
  DiscountStatus,
} from "@/types/discount";

function getStatusBadgeStyle(status: DiscountStatus) {
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

export default function DiscountsPage() {
  const {
    discounts,
    addDiscount,
    updateDiscount,
    toggleDiscount,
    duplicateDiscount,
    deleteDiscount,
  } = useDiscountsStore();

  const { orders } = useOrdersStore();
  const { products } = useProductsStore();
  const { categories } = useCategoriesStore();

  // Total discount given derived reactively from orders store
  const totalDiscountGiven = useMemo(
    () => calculateTotalDiscountGiven(orders),
    [orders]
  );

  // Stable timestamp for status calculations
  const [currentTime] = useState(() => Date.now());

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [appliesToFilter, setAppliesToFilter] = useState<string>("All");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const [viewingDiscount, setViewingDiscount] = useState<Discount | null>(null);
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    let activeCount = 0;
    let scheduledCount = 0;
    let expiredCount = 0;

    for (const d of discounts) {
      const status = getDiscountStatus(d, currentTime);
      if (status === "Active") activeCount++;
      else if (status === "Scheduled") scheduledCount++;
      else if (status === "Expired") expiredCount++;
    }

    return {
      total: discounts.length,
      active: activeCount,
      scheduled: scheduledCount,
      expired: expiredCount,
    };
  }, [discounts, currentTime]);

  // Filtered Discounts
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      const status = getDiscountStatus(d, currentTime);

      // Search match
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q));

      // Status filter
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      // Type filter
      const matchesType =
        typeFilter === "All" || d.type === typeFilter;

      // Applies to filter
      const matchesAppliesTo =
        appliesToFilter === "All" || d.appliesTo === appliesToFilter;

      return matchesSearch && matchesStatus && matchesType && matchesAppliesTo;
    });
  }, [discounts, search, statusFilter, typeFilter, appliesToFilter, currentTime]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveDiscount = (payload: DiscountInput) => {
    if (editingDiscount) {
      updateDiscount(editingDiscount.id, payload);
    } else {
      addDiscount(payload);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: Discount) => {
    setEditingDiscount(d);
    setIsModalOpen(true);
  };

  const handleDuplicate = (d: Discount) => {
    duplicateDiscount(d.id);
  };

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "All" ||
    typeFilter !== "All" ||
    appliesToFilter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setAppliesToFilter("All");
  };

  return (
    <div className="flex min-h-screen bg-[#faf7f3] text-[#2b1b12]">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden md:ml-64">
        <Topbar />

        <div className="mx-auto max-w-7xl p-5 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#c98b5b]/20 text-[#6d4730]">
                  <Tag size={14} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9b897b]">
                  Marketing & Offers
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#2b1b12] md:text-3xl">
                Discounts & Promotions
              </h1>
              <p className="mt-1 text-xs text-[#8c7a6c] md:text-sm">
                Create and manage offers, coupons, and promotional pricing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#2b1b12]/15 transition hover:bg-[#40291d]"
              >
                <Plus size={16} />
                <span>Add Discount</span>
              </button>
            </div>
          </div>

          {/* 5 Dynamic Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Card 1: Total Discounts */}
            <div className="rounded-2xl border border-[#eee5dc] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#8c7a6c]">
                  Total Discounts
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#faf7f3] text-[#6d4730]">
                  <Tag size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#2b1b12]">
                {metrics.total}
              </p>
              <p className="mt-0.5 text-[11px] text-[#9b897b]">
                All registered offers
              </p>
            </div>

            {/* Card 2: Active */}
            <div className="rounded-2xl border border-[#bde2c1] bg-[#f2faf3] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#3b7b46]">
                  Active Offers
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3b7b46]">
                  <Sparkles size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#23582d]">
                {metrics.active}
              </p>
              <p className="mt-0.5 text-[11px] text-[#4a8a55]">
                Ready for POS redemption
              </p>
            </div>

            {/* Card 3: Scheduled */}
            <div className="rounded-2xl border border-[#d6bcfa] bg-[#f8f5ff] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6b46c1]">
                  Scheduled
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3f0ff] text-[#6b46c1]">
                  <Clock size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#4c2d99]">
                {metrics.scheduled}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6b46c1]">
                Starts in the future
              </p>
            </div>

            {/* Card 4: Expired */}
            <div className="rounded-2xl border border-[#f6cdb9] bg-[#fef5f0] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#bc5328]">
                  Expired / Limit Reached
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf0ea] text-[#bc5328]">
                  <AlertCircle size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#8f3611]">
                {metrics.expired}
              </p>
              <p className="mt-0.5 text-[11px] text-[#bc5328]">
                Ended or usage capped
              </p>
            </div>

            {/* Card 5: Total Discount Given */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 rounded-2xl border border-[#eee5dc] bg-gradient-to-br from-[#faf7f3] to-[#f4ece4] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6d4730]">
                  Total Value Given
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b1b12] text-white">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-[#2b1b12]">
                ৳{totalDiscountGiven.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#8c7a6c]">
                Across all completed sales
              </p>
            </div>
          </div>

          {/* Search and Filters Card */}
          <div className="rounded-2xl border border-[#eee5dc] bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b897b]"
                />
                <input
                  type="text"
                  placeholder="Search by discount name, coupon code, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              {/* Reset filter button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 self-start lg:self-auto rounded-xl border border-[#e5dbd0] px-3 py-2 text-xs font-semibold text-[#8c7a6c] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#f2ebe3] text-xs">
              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold uppercase text-[#9b897b]">
                  Status:
                </span>
                <div className="flex gap-1">
                  {["All", "Active", "Scheduled", "Expired", "Inactive"].map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          statusFilter === st
                            ? "bg-[#2b1b12] text-white"
                            : "border border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <span className="text-neutral-300 hidden md:inline">|</span>

              {/* Type Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold uppercase text-[#9b897b]">
                  Type:
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-7 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2 text-xs font-medium text-[#2b1b12] outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed Amount">Fixed Amount (৳)</option>
                </select>
              </div>

              <span className="text-neutral-300 hidden md:inline">|</span>

              {/* Applies To Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold uppercase text-[#9b897b]">
                  Target:
                </span>
                <select
                  value={appliesToFilter}
                  onChange={(e) => setAppliesToFilter(e.target.value)}
                  className="h-7 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2 text-xs font-medium text-[#2b1b12] outline-none cursor-pointer"
                >
                  <option value="All">All Targets</option>
                  <option value="Entire Order">Entire Order</option>
                  <option value="Specific Products">Specific Products</option>
                  <option value="Specific Categories">Specific Categories</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table & Cards List */}
          <div className="overflow-hidden rounded-2xl border border-[#eee5dc] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                  <tr>
                    <th className="px-4 py-3.5">Name & Description</th>
                    <th className="px-4 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Type & Value</th>
                    <th className="px-4 py-3.5">Applies To</th>
                    <th className="px-4 py-3.5">Validity</th>
                    <th className="px-4 py-3.5 text-center">Usage</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebe3]">
                  {filteredDiscounts.map((d) => {
                    const status = getDiscountStatus(d, currentTime);
                    return (
                      <tr
                        key={d.id}
                        className="transition hover:bg-[#faf7f3]/70"
                      >
                        {/* Name & Description */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#faf7f3] text-[#6d4730]">
                              {d.type === "Percentage" ? (
                                <Percent size={13} />
                              ) : (
                                <Banknote size={13} />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#2b1b12]">
                                {d.name}
                              </p>
                              {d.description && (
                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#8c7a6c]">
                                  {d.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3.5">
                          <div className="inline-flex items-center gap-1 rounded-md border border-[#e5dbd0] bg-[#faf7f3] px-2 py-0.5 font-mono text-[11px] font-bold text-[#6d4730]">
                            <span>{d.code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(d.code)}
                              title="Copy coupon code"
                              className="text-[#9b897b] transition hover:text-[#2b1b12]"
                            >
                              {copiedCode === d.code ? (
                                <Check size={11} className="text-emerald-600" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Type & Value */}
                        <td className="px-4 py-3.5 font-semibold text-[#2b1b12]">
                          {d.type === "Percentage" ? (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                              {d.value}% OFF
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                              ৳{d.value.toFixed(2)} OFF
                            </span>
                          )}
                        </td>

                        {/* Applies To */}
                        <td className="px-4 py-3.5">
                          <span className="inline-block font-medium text-[#2b1b12]">
                            {d.appliesTo}
                          </span>
                          {d.appliesTo === "Specific Products" && (
                            <span className="ml-1 rounded-sm bg-[#f4ece4] px-1 py-0.2 text-[10px] text-[#6d4730]">
                              {d.productIds?.length || 0} items
                            </span>
                          )}
                          {d.appliesTo === "Specific Categories" && (
                            <span className="ml-1 rounded-sm bg-[#f4ece4] px-1 py-0.2 text-[10px] text-[#6d4730]">
                              {d.categoryIds?.join(", ")}
                            </span>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-4 py-3.5 text-[#66574d]">
                          {d.startAt || d.endAt ? (
                            <div className="text-[11px]">
                              {d.startAt && (
                                <p>
                                  From:{" "}
                                  {new Date(d.startAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              )}
                              {d.endAt ? (
                                <p>
                                  To:{" "}
                                  {new Date(d.endAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              ) : (
                                <p>No expiry</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#8c7a6c]">
                              Always valid
                            </span>
                          )}
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-3.5 text-center font-medium text-[#2b1b12]">
                          <span className="font-bold text-[#6d4730]">
                            {d.usageCount}
                          </span>
                          <span className="text-[#8c7a6c]">
                            {" "}
                            / {d.usageLimit ? d.usageLimit : "∞"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => setViewingDiscount(d)}
                              title="View Details"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(d)}
                              title="Edit Promotion"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                            >
                              <Pencil size={13} />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicate(d)}
                              title="Duplicate Promotion"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                            >
                              <Copy size={13} />
                            </button>

                            {/* Toggle Active */}
                            <button
                              type="button"
                              onClick={() => toggleDiscount(d.id)}
                              title={d.active ? "Deactivate" : "Activate"}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                d.active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-stone-200 bg-stone-100 text-stone-500 hover:bg-stone-200"
                              }`}
                            >
                              <Power size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeletingDiscount(d)}
                              title="Delete Promotion"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5dbd0] text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty States */}
            {filteredDiscounts.length === 0 && (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9b897b]">
                  <Tag size={28} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#2b1b12]">
                  {discounts.length === 0
                    ? "No promotions created yet"
                    : "No matching promotions found"}
                </h3>
                <p className="mt-1 text-xs text-[#8c7a6c]">
                  {discounts.length === 0
                    ? "Get started by creating your first promotional offer or coupon code."
                    : "Try adjusting your search criteria or resetting the filters."}
                </p>
                <div className="mt-4">
                  {discounts.length === 0 ? (
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="rounded-xl bg-[#2b1b12] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#40291d]"
                    >
                      Add First Promotion
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="rounded-xl border border-[#e5dbd0] bg-white px-4 py-2 text-xs font-semibold text-[#6d4730] transition hover:bg-[#faf7f3]"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <DiscountModal
          key={editingDiscount?.id || "new"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          discount={editingDiscount}
          products={products}
          categories={categories}
          onSave={handleSaveDiscount}
        />
      )}

      {/* View Details Modal */}
      {viewingDiscount && (
        <DiscountDetailsModal
          isOpen={Boolean(viewingDiscount)}
          onClose={() => setViewingDiscount(null)}
          discount={viewingDiscount}
          status={getDiscountStatus(viewingDiscount, currentTime)}
          products={products}
          onEdit={(d) => {
            setViewingDiscount(null);
            handleOpenEditModal(d);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDiscount && (
        <DeleteDiscountModal
          isOpen={Boolean(deletingDiscount)}
          discount={deletingDiscount}
          onClose={() => setDeletingDiscount(null)}
          onConfirmDelete={() => {
            deleteDiscount(deletingDiscount.id);
          }}
        />
      )}
    </div>
  );
}
