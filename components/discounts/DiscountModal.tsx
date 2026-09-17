"use client";

import { useState, useId } from "react";
import {
  X,
  Tag,
  Percent,
  Banknote,
  Users,
  Check,
  Search,
  Layers,
  Sparkles,
} from "lucide-react";
import type {
  Discount,
  DiscountInput,
  DiscountType,
  DiscountAppliesTo,
  CustomerEligibility,
} from "@/types/discount";
import type { Product, Category } from "@/data/products";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  products: Product[];
  categories: Category[];
  onSave: (data: DiscountInput) => void;
}

export default function DiscountModal({
  isOpen,
  onClose,
  discount,
  products,
  categories,
  onSave,
}: DiscountModalProps) {
  const isEditing = Boolean(discount);

  // Form states initialized from discount prop
  const [code, setCode] = useState(discount?.code || "");
  const [name, setName] = useState(discount?.name || "");
  const [description, setDescription] = useState(discount?.description || "");
  const [type, setType] = useState<DiscountType>(discount?.type || "Percentage");
  const [value, setValue] = useState(discount?.value ? String(discount.value) : "");
  const [appliesTo, setAppliesTo] = useState<DiscountAppliesTo>(
    discount?.appliesTo || "Entire Order"
  );
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    discount?.productIds || []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    discount?.categoryIds || []
  );
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(
    discount?.minimumOrderAmount !== undefined
      ? String(discount.minimumOrderAmount)
      : ""
  );
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState(
    discount?.maximumDiscountAmount !== undefined
      ? String(discount.maximumDiscountAmount)
      : ""
  );
  const [startAt, setStartAt] = useState(
    discount?.startAt ? discount.startAt.slice(0, 16) : ""
  );
  const [endAt, setEndAt] = useState(
    discount?.endAt ? discount.endAt.slice(0, 16) : ""
  );
  const [isUnlimitedUsage, setIsUnlimitedUsage] = useState(
    discount?.usageLimit === undefined
  );
  const [usageLimit, setUsageLimit] = useState(
    discount?.usageLimit ? String(discount.usageLimit) : "100"
  );
  const [customerEligibility, setCustomerEligibility] =
    useState<CustomerEligibility>(discount?.customerEligibility || "Everyone");
  const [active, setActive] = useState(discount?.active ?? true);

  // Filter state for product picker
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const nameId = useId();
  const codeId = useId();
  const descId = useId();
  const valId = useId();
  const minId = useId();
  const maxId = useId();
  const startId = useId();
  const endId = useId();
  const limitId = useId();

  if (!isOpen) return null;

  const handleToggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleToggleCategory = (catName: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const handleSelectAllProducts = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => {
      const combined = new Set([...prev, ...visibleIds]);
      return Array.from(combined);
    });
  };

  const handleClearSelectedProducts = () => {
    setSelectedProductIds([]);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === "All" || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Discount code is required.";
    } else if (code.trim().length < 3) {
      newErrors.code = "Discount code must be at least 3 characters.";
    }

    if (!name.trim()) {
      newErrors.name = "Promotion name is required.";
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      newErrors.value = "Discount value must be greater than 0.";
    } else if (type === "Percentage" && numVal > 100) {
      newErrors.value = "Percentage discount cannot exceed 100%.";
    }

    if (appliesTo === "Specific Products" && selectedProductIds.length === 0) {
      newErrors.appliesTo = "Please select at least one eligible product.";
    }

    if (appliesTo === "Specific Categories" && selectedCategoryIds.length === 0) {
      newErrors.appliesTo = "Please select at least one eligible category.";
    }

    if (startAt && endAt) {
      const startDate = new Date(startAt);
      const endDate = new Date(endAt);
      if (endDate < startDate) {
        newErrors.endAt = "End date cannot be earlier than start date.";
      }
    }

    if (!isUnlimitedUsage) {
      const numLimit = parseInt(usageLimit, 10);
      if (isNaN(numLimit) || numLimit <= 0) {
        newErrors.usageLimit = "Usage limit must be a positive integer.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numValue = parseFloat(value);
    const numMin = parseFloat(minimumOrderAmount);
    const numMax = parseFloat(maximumDiscountAmount);
    const numLimit = parseInt(usageLimit, 10);

    const payload: DiscountInput = {
      ...(discount ? { id: discount.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      value: numValue,
      appliesTo,
      productIds: appliesTo === "Specific Products" ? selectedProductIds : undefined,
      categoryIds:
        appliesTo === "Specific Categories" ? selectedCategoryIds : undefined,
      minimumOrderAmount: !isNaN(numMin) && numMin > 0 ? numMin : undefined,
      maximumDiscountAmount:
        type === "Percentage" && !isNaN(numMax) && numMax > 0
          ? numMax
          : undefined,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      usageLimit: !isUnlimitedUsage && !isNaN(numLimit) && numLimit > 0 ? numLimit : undefined,
      customerEligibility,
      active,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b1b12]">
                {isEditing ? "Edit Promotion" : "Create New Promotion"}
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                {isEditing
                  ? `Update configuration for coupon ${discount?.code}`
                  : "Set up discounts, coupon codes, and target rules."}
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[78vh] overflow-y-auto p-6 space-y-5"
        >
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f0e8df] pb-2">
              <Sparkles size={16} className="text-[#c98b5b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                Basic Information
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={codeId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    id={codeId}
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER10"
                    className={`h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 font-mono text-sm font-bold uppercase text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white ${
                      errors.code ? "border-red-400 bg-red-50/40" : "border-[#e5dbd0]"
                    }`}
                  />
                </div>
                {errors.code && (
                  <p className="mt-1 text-xs text-red-600">{errors.code}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor={nameId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  Promotion Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Coffee Special"
                  className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white ${
                    errors.name ? "border-red-400 bg-red-50/40" : "border-[#e5dbd0]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor={descId}
                className="block text-xs font-semibold text-[#2b1b12]"
              >
                Description <span className="font-normal text-[#8c7a6c]">(optional)</span>
              </label>
              <textarea
                id={descId}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the offer shown to cashiers and customers..."
                className="mt-1.5 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-sm text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
              />
            </div>
          </div>

          {/* Section 2: Discount Value & Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f0e8df] pb-2">
              <Percent size={16} className="text-[#c98b5b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                Discount Value & Calculations
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#2b1b12]">
                  Discount Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("Percentage")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                      type === "Percentage"
                        ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                        : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                    }`}
                  >
                    <Percent size={14} />
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Fixed Amount")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                      type === "Fixed Amount"
                        ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                        : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                    }`}
                  >
                    <Banknote size={14} />
                    Fixed Amount (৳)
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor={valId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  {type === "Percentage" ? "Percentage Off (%)" : "Flat Amount Off (৳)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#9b897b]">
                    {type === "Percentage" ? "%" : "৳"}
                  </span>
                  <input
                    id={valId}
                    type="number"
                    step="any"
                    min="0"
                    max={type === "Percentage" ? "100" : undefined}
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "Percentage" ? "10" : "50"}
                    className={`h-11 w-full rounded-xl border bg-[#faf7f3] pl-8 pr-3.5 text-sm font-bold text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white ${
                      errors.value ? "border-red-400 bg-red-50/40" : "border-[#e5dbd0]"
                    }`}
                  />
                </div>
                {errors.value && (
                  <p className="mt-1 text-xs text-red-600">{errors.value}</p>
                )}
              </div>
            </div>

            {/* Threshold Conditions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={minId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  Minimum Order Subtotal (৳)
                </label>
                <input
                  id={minId}
                  type="number"
                  step="any"
                  min="0"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  placeholder="e.g. 300 (leave blank for none)"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                />
                <p className="mt-1 text-[11px] text-[#8c7a6c]">
                  Order subtotal must meet or exceed this amount to qualify.
                </p>
              </div>

              {type === "Percentage" && (
                <div>
                  <label
                    htmlFor={maxId}
                    className="block text-xs font-semibold text-[#2b1b12]"
                  >
                    Maximum Discount Cap (৳)
                  </label>
                  <input
                    id={maxId}
                    type="number"
                    step="any"
                    min="0"
                    value={maximumDiscountAmount}
                    onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                    placeholder="e.g. 150 (leave blank for none)"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                  />
                  <p className="mt-1 text-[11px] text-[#8c7a6c]">
                    Maximum discount allowed regardless of large order sizes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Targeting (Applies To) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f0e8df] pb-2">
              <Layers size={16} className="text-[#c98b5b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                Targeting & Applicability
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2b1b12]">
                Applies To
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: "Entire Order", label: "Entire Order" },
                  { id: "Specific Products", label: "Specific Products" },
                  { id: "Specific Categories", label: "Specific Categories" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAppliesTo(item.id as DiscountAppliesTo)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      appliesTo === item.id
                        ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                        : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {errors.appliesTo && (
                <p className="mt-1.5 text-xs text-red-600">{errors.appliesTo}</p>
              )}
            </div>

            {/* Target Picker: Specific Products */}
            {appliesTo === "Specific Products" && (
              <div className="rounded-2xl border border-[#e5dbd0] bg-[#faf7f3] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2b1b12]">
                    Select Products ({selectedProductIds.length} selected)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                      className="text-xs font-semibold text-[#c98b5b] hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearSelectedProducts}
                      className="text-xs text-[#8c7a6c] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Filter & Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7a6c]"
                    />
                    <input
                      type="text"
                      placeholder="Search menu products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="h-9 w-full rounded-xl border border-[#e5dbd0] bg-white pl-8 pr-3 text-xs text-[#2b1b12] outline-none"
                    />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="h-9 rounded-xl border border-[#e5dbd0] bg-white px-2.5 text-xs text-[#2b1b12] outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product List */}
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition cursor-pointer ${
                          isSelected
                            ? "border-[#c98b5b] bg-[#fbf5ee]"
                            : "border-[#e5dbd0] bg-white hover:bg-[#faf7f3]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                              isSelected
                                ? "border-[#c98b5b] bg-[#c98b5b] text-white"
                                : "border-[#cdbfb2] bg-white"
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2b1b12]">{p.name}</p>
                            <p className="text-[11px] text-[#8c7a6c]">{p.category}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#6d4730]">
                          ৳{p.price.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="py-4 text-center text-xs text-[#8c7a6c]">
                      No products match your search.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Target Picker: Specific Categories */}
            {appliesTo === "Specific Categories" && (
              <div className="rounded-2xl border border-[#e5dbd0] bg-[#faf7f3] p-4 space-y-2">
                <p className="text-xs font-bold text-[#2b1b12]">
                  Select Target Categories ({selectedCategoryIds.length} selected)
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((c) => {
                    const isSelected = selectedCategoryIds.includes(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleToggleCategory(c.name)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#c98b5b] bg-[#c98b5b] text-white shadow-xs"
                            : "border-[#e5dbd0] bg-white text-[#6d4730] hover:bg-[#f4ece4]"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Eligibility & Limitations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f0e8df] pb-2">
              <Users size={16} className="text-[#c98b5b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b897b]">
                Eligibility & Usage Limits
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#2b1b12]">
                  Customer Eligibility
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerEligibility("Everyone")}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      customerEligibility === "Everyone"
                        ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                        : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                    }`}
                  >
                    Everyone (All)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerEligibility("Registered Customers")}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      customerEligibility === "Registered Customers"
                        ? "border-[#2b1b12] bg-[#2b1b12] text-white"
                        : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                    }`}
                  >
                    Registered Only
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#8c7a6c]">
                  {customerEligibility === "Registered Customers"
                    ? "Requires selecting a customer profile at checkout."
                    : "Valid for walk-ins and registered customers alike."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={limitId}
                    className="block text-xs font-semibold text-[#2b1b12]"
                  >
                    Usage Limit
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#6d4730] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedUsage}
                      onChange={(e) => setIsUnlimitedUsage(e.target.checked)}
                      className="accent-[#c98b5b]"
                    />
                    Unlimited Usage
                  </label>
                </div>

                <input
                  id={limitId}
                  type="number"
                  min="1"
                  disabled={isUnlimitedUsage}
                  value={isUnlimitedUsage ? "" : usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder={isUnlimitedUsage ? "Unlimited" : "e.g. 100"}
                  className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition disabled:bg-neutral-100 disabled:text-neutral-400 focus:border-[#c98b5b] focus:bg-white ${
                    errors.usageLimit
                      ? "border-red-400 bg-red-50/40"
                      : "border-[#e5dbd0]"
                  }`}
                />
                {errors.usageLimit && (
                  <p className="mt-1 text-xs text-red-600">{errors.usageLimit}</p>
                )}
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={startId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  Start Date & Time <span className="font-normal text-[#8c7a6c]">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    id={startId}
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={endId}
                  className="block text-xs font-semibold text-[#2b1b12]"
                >
                  End Date & Time <span className="font-normal text-[#8c7a6c]">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    id={endId}
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className={`h-11 w-full rounded-xl border bg-[#faf7f3] px-3 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white ${
                      errors.endAt
                        ? "border-red-400 bg-red-50/40"
                        : "border-[#e5dbd0]"
                    }`}
                  />
                </div>
                {errors.endAt && (
                  <p className="mt-1 text-xs text-red-600">{errors.endAt}</p>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <input
                id="discount-active-toggle"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded accent-[#2b1b12] cursor-pointer"
              />
              <label
                htmlFor="discount-active-toggle"
                className="text-xs font-medium text-[#2b1b12] cursor-pointer"
              >
                Promotion is Active and available for redemption
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#eee5dc] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] px-5 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#40291d]"
            >
              {isEditing ? "Update Promotion" : "Create Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
