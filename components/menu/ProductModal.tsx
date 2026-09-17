"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Coffee,
  AlertCircle,
  Check,
} from "lucide-react";
import type { Product, Category } from "@/data/products";
import { generateSKU, isSKUUnique } from "@/lib/products";
import { useSettingsStore } from "@/lib/settings-store";
import { useModalEscape } from "@/lib/use-modal-escape";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSave: (data: Omit<Product, "id"> & { id?: number }) => void;
}

const EMOJI_OPTIONS = ["☕", "🥛", "🍫", "🧊", "🧋", "🍵", "🥐", "🧁", "🍰", "🥪", "🍪", "🍩"];

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
}: ProductModalProps) {
  const isEditing = !!product;

  const { settings } = useSettingsStore();
  const currencySymbol = settings.taxCurrency.currencySymbol || "৳";

  const defaultCategory =
    categories.length > 0 ? categories[0].name : "Hot Coffee";

  // Initial state derived from props on mount/open
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || defaultCategory);
  const [sku, setSku] = useState(product?.sku || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [image, setImage] = useState(product?.image || "☕");
  const [description, setDescription] = useState(product?.description || "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [popular, setPopular] = useState(product?.popular ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const handleGenerateSKU = () => {
    const generated = generateSKU(name || "Item", category);
    setSku(generated);
    if (errors.sku) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.sku;
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required.";
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = "Price must be a positive number greater than 0.";
    }

    const finalSKU = sku.trim() || generateSKU(name, category);
    if (!isSKUUnique(finalSKU, product?.id)) {
      newErrors.sku = "This SKU is already in use by another product.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(product ? { id: product.id } : {}),
      name: name.trim(),
      category: category.trim(),
      sku: finalSKU,
      price: numPrice,
      image,
      description: description.trim(),
      available,
      popular,
      isNew,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Coffee size={20} />
            </div>
            <div>
              <h2 id="product-modal-title" className="text-lg font-bold text-[#2b1b12]">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                {isEditing
                  ? "Update product details, pricing, and availability."
                  : "Fill out the fields to add a new item to your menu."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6 space-y-5">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
              Basic Details
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-[#2b1b12]">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => {
                      const c = { ...prev };
                      delete c.name;
                      return c;
                    });
                  }
                }}
                placeholder="e.g. Caramel Macchiato"
                className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] ${
                  errors.name
                    ? "border-red-400 bg-red-50/40 focus:border-red-500"
                    : "border-[#e5dbd0] bg-[#faf7f3] focus:border-[#c98b5b] focus:bg-white"
                }`}
              />
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={13} /> {errors.name}
                </p>
              )}
            </div>

            {/* Category & SKU Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#2b1b12]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#2b1b12]">
                    SKU Code
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#c98b5b] hover:underline"
                  >
                    <Sparkles size={11} /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value.toUpperCase());
                    if (errors.sku) {
                      setErrors((prev) => {
                        const c = { ...prev };
                        delete c.sku;
                        return c;
                      });
                    }
                  }}
                  placeholder="e.g. HOT-MAC-010"
                  className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 font-mono text-xs uppercase text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] ${
                    errors.sku
                      ? "border-red-400 bg-red-50/40 focus:border-red-500"
                      : "border-[#e5dbd0] bg-[#faf7f3] focus:border-[#c98b5b] focus:bg-white"
                  }`}
                />
                {errors.sku && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={13} /> {errors.sku}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-xs font-semibold text-[#2b1b12]">
                Price ({currencySymbol}) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9b897b]">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) {
                      setErrors((prev) => {
                        const c = { ...prev };
                        delete c.price;
                        return c;
                      });
                    }
                  }}
                  placeholder="180.00"
                  className={`h-11 w-full rounded-xl border pl-8 pr-4 text-sm font-semibold text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] ${
                    errors.price
                      ? "border-red-400 bg-red-50/40 focus:border-red-500"
                      : "border-[#e5dbd0] bg-[#faf7f3] focus:border-[#c98b5b] focus:bg-white"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={13} /> {errors.price}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#2b1b12]">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short tasting notes or ingredients..."
                className="mt-1.5 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white resize-none"
              />
            </div>

            {/* Icon / Emoji Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#2b1b12]">
                Item Icon / Avatar
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setImage(em)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                      image === em
                        ? "border-[#c98b5b] bg-[#c98b5b]/15 ring-2 ring-[#c98b5b]"
                        : "border-[#e5dbd0] bg-[#faf7f3] hover:bg-[#f4ece4]"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility & Tags */}
          <div className="border-t border-[#eee5dc] pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
              Availability & Badges
            </h3>

            {/* Available Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3">
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">
                  Available in POS
                </p>
                <p className="text-[11px] text-[#8c7a6c]">
                  When disabled, item appears as out of stock and cannot be ordered.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  available ? "bg-[#3b7b46]" : "bg-[#d8d0c8]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    available ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Popular and New Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3 text-xs font-medium text-[#2b1b12] cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-[#d8d0c8] text-[#c98b5b] focus:ring-[#c98b5b]"
                />
                <span>Mark as Popular ⭐</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-3 text-xs font-medium text-[#2b1b12] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded border-[#d8d0c8] text-[#c98b5b] focus:ring-[#c98b5b]"
                />
                <span>Mark as New Item 🏷️</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#eee5dc] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] bg-white px-5 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#40291d]"
            >
              <Check size={15} />
              <span>{isEditing ? "Save Changes" : "Create Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
