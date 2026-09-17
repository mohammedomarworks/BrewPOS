"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Tags,
  Pencil,
  Copy,
  Trash2,
  Coffee,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Filter,
  ShoppingCart,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ProductModal from "@/components/menu/ProductModal";
import CategoryModal from "@/components/menu/CategoryModal";
import DeleteConfirmModal from "@/components/menu/DeleteConfirmModal";
import {
  useProductsStore,
  useCategoriesStore,
} from "@/lib/products";
import type { Product } from "@/data/products";

export default function MenuPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    duplicateProduct,
  } = useProductsStore();

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
  } = useCategoriesStore();

  // Search and Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Dynamic Summary Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.available !== false).length;
    const outOfStock = products.filter((p) => p.available === false).length;
    const totalCategories = categories.length;

    return { totalProducts, activeProducts, outOfStock, totalCategories };
  }, [products, categories]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search matches name, category, or SKU
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term));

      // Category filter
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      // Availability filter
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && p.available !== false) ||
        (availabilityFilter === "Unavailable" && p.available === false);

      // Tag filter
      const matchesTag =
        tagFilter === "All" ||
        (tagFilter === "Popular" && p.popular) ||
        (tagFilter === "New" && p.isNew);

      return (
        matchesSearch && matchesCategory && matchesAvailability && matchesTag
      );
    });
  }, [products, search, selectedCategory, availabilityFilter, tagFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "All" ||
    availabilityFilter !== "All" ||
    tagFilter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setAvailabilityFilter("All");
    setTagFilter("All");
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (
    data: Omit<Product, "id"> & { id?: number }
  ) => {
    if (data.id) {
      updateProduct(data.id, data);
    } else {
      addProduct(data);
    }
  };

  const handlePromptDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateProduct(id);
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Menu Management"
          subtitle="Manage products, categories, pricing, and availability."
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Page Heading & Actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>
                <span className="text-xs text-[#b8a798]">&bull;</span>
                <Link
                  href="/pos"
                  className="flex items-center gap-1 text-xs text-[#8c7a6c] hover:text-[#2b1b12]"
                >
                  <ShoppingCart size={13} />
                  POS View
                </Link>
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-[#2b1b12]">
                Menu Management
              </h1>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Manage products, categories, pricing, and availability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <Tags size={15} />
                <span>Manage Categories</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
              >
                <Plus size={15} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Total Products</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730]">
                  <Coffee size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#2b1b12]">
                {metrics.totalProducts}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">In catalog</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Active in POS</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3b7b46]">
                  <CheckCircle2 size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#3b7b46]">
                {metrics.activeProducts}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Available to order</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Categories</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#c98b5b]">
                  <Tags size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#6d4730]">
                {metrics.totalCategories}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Configured groups</p>
            </div>

            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Out of Stock</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf0f0] text-[#ba3030]">
                  <XCircle size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#ba3030]">
                {metrics.outOfStock}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Hidden / Unavailable</p>
            </div>
          </section>

          {/* Search & Filters Section */}
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
                  placeholder="Search by product name, category, or SKU..."
                  className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Availability Filter */}
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Availability</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>

                {/* Tag Filter */}
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b]"
                >
                  <option value="All">All Badges</option>
                  <option value="Popular">Popular ⭐</option>
                  <option value="New">New Item 🏷️</option>
                </select>

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

          {/* Product Catalog Section */}
          <section className="mt-6 rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)] overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#eee5dc] px-6 py-4">
              <div className="flex items-center gap-2">
                <Coffee size={18} className="text-[#c98b5b]" />
                <h2 className="font-semibold text-[#2b1b12]">Product Catalog</h2>
                <span className="rounded-md bg-[#faf7f3] border border-[#e8dfd4] px-2 py-0.5 text-xs font-medium text-[#6d4730]">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}
                </span>
              </div>
            </div>

            {/* Empty State: No products in catalog at all */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9f8068]">
                  <Coffee size={32} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#2b1b12]">
                  No products found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#8c7a6c]">
                  Your coffee shop menu is currently empty. Add products to populate
                  your POS and menu catalog.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
                >
                  <Plus size={16} />
                  <span>Add First Product</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State: Filters yielded 0 results */
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f3] border border-[#e8dfd4] text-[#9f8068]">
                  <Filter size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#2b1b12]">
                  No matching products
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#8c7a6c]">
                  Try adjusting your search query, selecting another category, or
                  resetting your active filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                >
                  <RotateCcw size={13} />
                  <span>Clear Filters</span>
                </button>
              </div>
            ) : (
              /* Product Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">SKU</th>
                      <th className="px-5 py-3.5">Availability</th>
                      <th className="px-5 py-3.5">Badges</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee5dc]">
                    {filteredProducts.map((p) => {
                      const isAvail = p.available !== false;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-[#faf7f3]/70 transition"
                        >
                          {/* Product Info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efe2d5] text-xl">
                                {p.image || "☕"}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-[#2b1b12]">
                                  {p.name}
                                </p>
                                {p.description && (
                                  <p className="line-clamp-1 max-w-xs text-xs text-[#8c7a6c]">
                                    {p.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-[#e5dbd0] bg-[#faf7f3] px-2.5 py-1 text-xs font-medium text-[#66574d]">
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4 font-bold text-sm text-[#6d4730]">
                            ৳{p.price.toFixed(2)}
                          </td>

                          {/* SKU */}
                          <td className="px-5 py-4 font-mono text-xs text-[#8c7a6c]">
                            {p.sku || "—"}
                          </td>

                          {/* Availability Toggle */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => toggleProductAvailability(p.id)}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                                isAvail
                                  ? "border-emerald-200 bg-emerald-50 text-[#3b7b46] hover:bg-emerald-100"
                                  : "border-red-200 bg-red-50 text-[#ba3030] hover:bg-red-100"
                              }`}
                              title={
                                isAvail
                                  ? "Click to mark Out of Stock / Unavailable"
                                  : "Click to mark Available"
                              }
                            >
                              {isAvail ? (
                                <>
                                  <Eye size={12} />
                                  <span>Available</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} />
                                  <span>Unavailable</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Badges */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {p.popular && (
                                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Popular ⭐
                                </span>
                              )}
                              {p.isNew && (
                                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                  New 🏷️
                                </span>
                              )}
                              {!p.popular && !p.isNew && (
                                <span className="text-xs text-[#b8a798]">—</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="Edit Product"
                              >
                                <Pencil size={13} />
                              </button>

                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => handleDuplicate(p.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="Duplicate Product"
                              >
                                <Copy size={13} />
                              </button>

                              {/* Toggle availability */}
                              <button
                                type="button"
                                onClick={() => toggleProductAvailability(p.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title={
                                  isAvail
                                    ? "Mark Unavailable"
                                    : "Mark Available"
                                }
                              >
                                {isAvail ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handlePromptDelete(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#9b897b] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                title="Delete Product"
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
            )}
          </section>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          product={editingProduct}
          categories={categories.filter((c) => c.active)}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* Categories Management Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          categories={categories}
          products={products}
          onClose={() => setIsCategoryModalOpen(false)}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
          onToggleActive={toggleCategoryActive}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          product={deletingProduct}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingProduct(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
