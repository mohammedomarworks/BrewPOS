"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Truck,
  SlidersHorizontal,
  ChefHat,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  TrendingUp,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SkeletonTable from "@/components/ui/SkeletonTable";
import IngredientModal from "@/components/inventory/IngredientModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";
import ReceiveStockModal from "@/components/inventory/ReceiveStockModal";
import RecipeModal from "@/components/inventory/RecipeModal";
import DeleteIngredientModal from "@/components/inventory/DeleteIngredientModal";
import InventoryHistoryModal from "@/components/inventory/InventoryHistoryModal";
import {
  useInventoryStore,
  getStockStatus,
  calculateInventoryValue,
} from "@/lib/inventory";
import { useRecipesStore } from "@/lib/recipes";
import { useProductsStore } from "@/lib/products";
import { formatCurrency } from "@/lib/settings-store";
import type {
  Ingredient,
  IngredientInput,
  StockStatus,
} from "@/types/inventory";

function getStatusBadge(status: StockStatus) {
  switch (status) {
    case "Healthy":
      return "bg-[#edf6ee] text-[#3b7b46] border-[#bde2c1]";
    case "Low Stock":
      return "bg-[#fef7ee] text-[#b46d0e] border-[#f8ddb2]";
    case "Out of Stock":
      return "bg-[#fdf0f0] text-[#ba3030] border-[#f6bbbb]";
    default:
      return "bg-[#faf7f3] text-[#66574d] border-[#e8dfd4]";
  }
}

export default function InventoryPage() {
  const {
    ingredients,
    isLoaded,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    toggleIngredientActive,
    adjustStock,
    receiveStock,
    getStockTransactions,
  } = useInventoryStore();

  const {
    recipes,
    saveRecipe,
    deleteRecipe,
    isIngredientUsedInAnyRecipe,
  } = useRecipesStore();

  const { products } = useProductsStore();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [unitFilter, setUnitFilter] = useState<string>("All");

  // Modal States
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveTargetId, setReceiveTargetId] = useState<string | undefined>(undefined);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetId, setHistoryTargetId] = useState<string | undefined>(undefined);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

  // Dynamic Summary Metrics calculated from actual inventory
  const metrics = useMemo(() => {
    const totalIngredients = ingredients.length;
    let healthyCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const ing of ingredients) {
      const status = getStockStatus(ing);
      if (status === "Healthy") healthyCount++;
      else if (status === "Low Stock") lowStockCount++;
      else if (status === "Out of Stock") outOfStockCount++;
    }

    const totalValue = calculateInventoryValue(ingredients);

    return {
      totalIngredients,
      healthyCount,
      lowStockCount,
      outOfStockCount,
      totalValue,
    };
  }, [ingredients]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        ing.name.toLowerCase().includes(term) ||
        ing.sku.toLowerCase().includes(term) ||
        (ing.supplier && ing.supplier.toLowerCase().includes(term));

      const status = getStockStatus(ing);
      const matchesStatus = statusFilter === "All" || status === statusFilter;

      const matchesUnit = unitFilter === "All" || ing.unit === unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [ingredients, search, statusFilter, unitFilter]);

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "All" || unitFilter !== "All";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setUnitFilter("All");
  };

  // Actions
  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setIsIngredientModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = (data: IngredientInput) => {
    if (editingIngredient) {
      updateIngredient(editingIngredient.id, data);
    } else {
      addIngredient(data);
    }
    setIsIngredientModalOpen(false);
  };

  const handleOpenAdjustment = (ing: Ingredient) => {
    setAdjustingIngredient(ing);
    setIsAdjustmentModalOpen(true);
  };

  const handleOpenReceive = (ingId?: string) => {
    setReceiveTargetId(ingId);
    setIsReceiveModalOpen(true);
  };

  const handleOpenHistory = (ingId?: string) => {
    setHistoryTargetId(ingId);
    setIsHistoryModalOpen(true);
  };

  const handleOpenDelete = (ing: Ingredient) => {
    setIngredientToDelete(ing);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ingredientToDelete) {
      deleteIngredient(ingredientToDelete.id);
      setIngredientToDelete(null);
    }
  };

  const handleDeactivate = () => {
    if (ingredientToDelete) {
      toggleIngredientActive(ingredientToDelete.id);
    }
  };

  // Get products using the targeted ingredient for deletion modal
  const productsUsingIngredient = useMemo(() => {
    if (!ingredientToDelete) return [];
    const check = isIngredientUsedInAnyRecipe(ingredientToDelete.id);
    return products.filter((p) => check.productIds.includes(p.id));
  }, [ingredientToDelete, isIngredientUsedInAnyRecipe, products]);

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Inventory Management"
          subtitle="Monitor stock levels, ingredients, recipes, and inventory activity"
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Page Heading & Top Primary Actions */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#2b1b12]">
                Inventory Management
              </h1>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Track raw materials, stock levels, recipe costs, and automatic sale deductions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenReceive()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#66574d] shadow-xs transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <Truck size={15} className="text-[#c98b5b]" />
                <span>Receive Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#66574d] shadow-xs transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <ChefHat size={15} className="text-[#c98b5b]" />
                <span>Manage Recipes</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenHistory()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#66574d] shadow-xs transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <History size={15} className="text-[#8c7a6c]" />
                <span>Stock History</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
              >
                <Plus size={15} />
                <span>Add Ingredient</span>
              </button>
            </div>
          </div>

          {/* 5 Dynamic Summary Cards */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {/* Total Ingredients */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Total Ingredients</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730]">
                  <Package size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#2b1b12]">
                {metrics.totalIngredients}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Tracked catalog items</p>
            </div>

            {/* In Stock / Healthy */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">In Stock</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3b7b46]">
                  <CheckCircle2 size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#3b7b46]">
                {metrics.healthyCount}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Above safety threshold</p>
            </div>

            {/* Low Stock */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Low Stock</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fef7ee] text-[#b46d0e]">
                  <AlertTriangle size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#b46d0e]">
                {metrics.lowStockCount}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Needs replenishment</p>
            </div>

            {/* Out of Stock */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Out of Stock</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf0f0] text-[#ba3030]">
                  <AlertCircle size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#ba3030]">
                {metrics.outOfStockCount}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Zero available</p>
            </div>

            {/* Total Inventory Value */}
            <div className="col-span-2 rounded-2xl border border-[#e8dfd4] bg-white p-4 shadow-[0_4px_20px_rgba(72,48,32,0.04)] sm:col-span-1 xl:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#8c7a6c]">Inventory Value</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece4] text-[#c98b5b]">
                  <TrendingUp size={15} />
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#6d4730]">
                {formatCurrency(metrics.totalValue)}
              </h3>
              <p className="mt-1 text-[11px] text-[#9b897b]">Current stock valuation</p>
            </div>
          </section>

          {/* Low Stock Attention Alert Banner */}
          {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Stock Attention Alert: {metrics.lowStockCount + metrics.outOfStockCount} item{metrics.lowStockCount + metrics.outOfStockCount === 1 ? "" : "s"} at or below minimum threshold
                  </h4>
                  <p className="text-xs text-amber-800">
                    {metrics.outOfStockCount > 0 && `${metrics.outOfStockCount} out of stock. `}
                    Products relying on these ingredients may become unavailable in the POS.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatusFilter("Low Stock")}
                className="shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition"
              >
                View Low Stock
              </button>
            </div>
          )}

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
                  placeholder="Search by ingredient name, SKU (ING-...), or supplier..."
                  className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Stock Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b] cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Healthy">Healthy Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                {/* Unit Filter */}
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-medium text-[#66574d] outline-none transition focus:border-[#c98b5b] cursor-pointer"
                >
                  <option value="All">All Units</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="L">Liters (L)</option>
                  <option value="pcs">Pieces (pcs)</option>
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

          {/* Stock Table Section */}
          <section className="mt-6 rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)] overflow-hidden">
            {/* Table Header Metadata */}
            <div className="flex items-center justify-between border-b border-[#eee5dc] px-6 py-4">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#c98b5b]" />
                <h2 className="font-semibold text-[#2b1b12]">Inventory Stock Table</h2>
                <span className="rounded-md bg-[#faf7f3] border border-[#e8dfd4] px-2 py-0.5 text-xs font-medium text-[#6d4730]">
                  {filteredIngredients.length} {filteredIngredients.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Empty States / Loading */}
            {!isLoaded ? (
              <div className="p-4">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : ingredients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9f8068]">
                  <Package size={32} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#2b1b12]">
                  No ingredients yet
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#8c7a6c]">
                  Your coffee shop inventory is empty. Add raw materials such as coffee beans, milk, syrups, and packaging to begin tracking stock.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
                >
                  <Plus size={16} />
                  <span>Add First Ingredient</span>
                </button>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f3] border border-[#e8dfd4] text-[#9f8068]">
                  <Search size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#2b1b12]">
                  No matching ingredients
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#8c7a6c]">
                  No ingredients match your current search and filter settings.
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
              /* Desktop & Tablet Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#eee5dc] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wider text-[#9b897b]">
                    <tr>
                      <th className="px-5 py-3.5">Ingredient</th>
                      <th className="px-5 py-3.5">SKU</th>
                      <th className="px-5 py-3.5 text-right">Current Stock</th>
                      <th className="px-5 py-3.5 text-center">Unit</th>
                      <th className="px-5 py-3.5 text-right">Min Stock</th>
                      <th className="px-5 py-3.5 text-right">Cost / Unit</th>
                      <th className="px-5 py-3.5 text-right">Stock Value</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee5dc]">
                    {filteredIngredients.map((ing) => {
                      const status = getStockStatus(ing);
                      const stockValue = ing.currentStock * ing.costPerUnit;

                      return (
                        <tr
                          key={ing.id}
                          className="hover:bg-[#faf7f3]/70 transition"
                        >
                          {/* Ingredient & Supplier */}
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-[#2b1b12]">
                                {ing.name}
                              </p>
                              <p className="text-[11px] text-[#9b897b]">
                                {ing.supplier ? `Supplier: ${ing.supplier}` : "No supplier assigned"}
                              </p>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-5 py-4 font-mono text-xs font-bold text-[#66574d]">
                            {ing.sku}
                          </td>

                          {/* Current Stock */}
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`text-sm font-bold ${
                                ing.currentStock <= 0
                                  ? "text-red-600"
                                  : ing.currentStock <= ing.minimumStock
                                  ? "text-amber-600"
                                  : "text-[#2b1b12]"
                              }`}
                            >
                              {ing.currentStock.toLocaleString()}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="px-5 py-4 text-center">
                            <span className="rounded-md border border-[#e5dbd0] bg-[#faf7f3] px-2 py-0.5 text-xs font-medium text-[#66574d]">
                              {ing.unit}
                            </span>
                          </td>

                          {/* Min Stock */}
                          <td className="px-5 py-4 text-right text-xs text-[#8c7a6c]">
                            {ing.minimumStock.toLocaleString()}
                          </td>

                          {/* Cost / Unit */}
                          <td className="px-5 py-4 text-right text-xs font-medium text-[#2b1b12]">
                            {formatCurrency(ing.costPerUnit)}
                          </td>

                          {/* Stock Value */}
                          <td className="px-5 py-4 text-right text-xs font-bold text-[#6d4730]">
                            {formatCurrency(stockValue)}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Adjust */}
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustment(ing)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="Adjust Stock (Add/Remove/Set)"
                              >
                                <SlidersHorizontal size={14} />
                              </button>

                              {/* Quick Receive */}
                              <button
                                type="button"
                                onClick={() => handleOpenReceive(ing.id)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="Receive Stock (Purchase)"
                              >
                                <Truck size={14} className="text-[#c98b5b]" />
                              </button>

                              {/* History */}
                              <button
                                type="button"
                                onClick={() => handleOpenHistory(ing.id)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="View Movement History"
                              >
                                <History size={14} />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(ing)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title="Edit Ingredient Specifications"
                              >
                                <Pencil size={14} />
                              </button>

                              {/* Toggle Active */}
                              <button
                                type="button"
                                onClick={() => toggleIngredientActive(ing.id)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                                title={ing.active ? "Set Inactive" : "Set Active"}
                              >
                                <Power
                                  size={14}
                                  className={ing.active ? "text-[#3b7b46]" : "text-[#6d6056]"}
                                />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(ing)}
                                className="rounded-lg border border-[#e5dbd0] bg-white p-1.5 text-[#a39284] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                title="Delete Ingredient"
                              >
                                <Trash2 size={14} />
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

      {/* Add / Edit Ingredient Modal */}
      {isIngredientModalOpen && (
        <IngredientModal
          key={editingIngredient?.id || "new"}
          isOpen={isIngredientModalOpen}
          onClose={() => setIsIngredientModalOpen(false)}
          ingredient={editingIngredient}
          onSave={handleSaveIngredient}
        />
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && adjustingIngredient && (
        <StockAdjustmentModal
          key={adjustingIngredient.id}
          isOpen={isAdjustmentModalOpen}
          onClose={() => {
            setIsAdjustmentModalOpen(false);
            setAdjustingIngredient(null);
          }}
          ingredient={adjustingIngredient}
          onAdjust={adjustStock}
        />
      )}

      {/* Receive Stock Modal */}
      {isReceiveModalOpen && (
        <ReceiveStockModal
          key={receiveTargetId || "receive"}
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          ingredients={ingredients.filter((i) => i.active)}
          initialIngredientId={receiveTargetId}
          onReceive={receiveStock}
        />
      )}

      {/* Recipe Management Modal */}
      {isRecipeModalOpen && (
        <RecipeModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          products={products}
          ingredients={ingredients}
          recipes={recipes}
          onSaveRecipe={saveRecipe}
          onDeleteRecipe={deleteRecipe}
        />
      )}

      {/* History Audit Log Modal */}
      {isHistoryModalOpen && (
        <InventoryHistoryModal
          key={historyTargetId || "history"}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          transactions={getStockTransactions()}
          ingredients={ingredients}
          initialIngredientId={historyTargetId}
        />
      )}

      {/* Delete / Safeguard Modal */}
      {isDeleteModalOpen && ingredientToDelete && (
        <DeleteIngredientModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setIngredientToDelete(null);
          }}
          ingredient={ingredientToDelete}
          usedInProducts={productsUsingIngredient}
          onConfirmDelete={handleConfirmDelete}
          onDeactivate={handleDeactivate}
        />
      )}
    </div>
  );
}
