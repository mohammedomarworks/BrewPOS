"use client";

import { useState } from "react";
import {
  X,
  Package,
  Barcode,
  Scale,
  DollarSign,
  Truck,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";
import type {
  Ingredient,
  IngredientInput,
  InventoryUnit,
} from "@/types/inventory";
import { generateIngredientSKU } from "@/lib/inventory";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: Ingredient | null;
  onSave: (data: IngredientInput) => void;
}

const UNIT_OPTIONS: { value: InventoryUnit; label: string; description: string }[] = [
  { value: "g", label: "Grams (g)", description: "For coffee beans, tea, powders" },
  { value: "kg", label: "Kilograms (kg)", description: "Bulk dry goods" },
  { value: "ml", label: "Milliliters (ml)", description: "For milk, water, syrups" },
  { value: "L", label: "Liters (L)", description: "Bulk liquids" },
  { value: "pcs", label: "Pieces (pcs)", description: "For cups, lids, pastries" },
];

export default function IngredientModal({
  isOpen,
  onClose,
  ingredient,
  onSave,
}: IngredientModalProps) {
  const isEditing = !!ingredient;

  const [name, setName] = useState(ingredient?.name || "");
  const [sku, setSku] = useState(ingredient?.sku || "");
  const [unit, setUnit] = useState<InventoryUnit>(ingredient?.unit || "g");
  const [currentStock, setCurrentStock] = useState<string>(
    ingredient ? String(ingredient.currentStock) : "0"
  );
  const [minimumStock, setMinimumStock] = useState<string>(
    ingredient ? String(ingredient.minimumStock) : "100"
  );
  const [maximumStock, setMaximumStock] = useState<string>(
    ingredient?.maximumStock ? String(ingredient.maximumStock) : ""
  );
  const [costPerUnit, setCostPerUnit] = useState<string>(
    ingredient ? String(ingredient.costPerUnit) : "1.00"
  );
  const [supplier, setSupplier] = useState(ingredient?.supplier || "");
  const [active, setActive] = useState(ingredient?.active ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleGenerateSKU = () => {
    const generated = generateIngredientSKU(name || "Item");
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
      newErrors.name = "Ingredient name is required.";
    }

    const numMin = parseFloat(minimumStock);
    if (isNaN(numMin) || numMin < 0) {
      newErrors.minimumStock = "Minimum stock must be 0 or greater.";
    }

    const numCost = parseFloat(costPerUnit);
    if (isNaN(numCost) || numCost < 0) {
      newErrors.costPerUnit = "Cost per unit must be 0 or greater.";
    }

    let numMax: number | undefined = undefined;
    if (maximumStock.trim()) {
      numMax = parseFloat(maximumStock);
      if (isNaN(numMax) || numMax <= 0) {
        newErrors.maximumStock = "Maximum stock must be a positive number.";
      } else if (!isNaN(numMin) && numMax < numMin) {
        newErrors.maximumStock = "Maximum stock cannot be less than minimum stock.";
      }
    }

    if (!isEditing) {
      const numCurrent = parseFloat(currentStock);
      if (isNaN(numCurrent) || numCurrent < 0) {
        newErrors.currentStock = "Current stock must be 0 or greater.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalSKU = sku.trim() || generateIngredientSKU(name);

    onSave({
      ...(ingredient ? { id: ingredient.id } : {}),
      name: name.trim(),
      sku: finalSKU,
      unit,
      currentStock: isEditing ? ingredient.currentStock : parseFloat(currentStock) || 0,
      minimumStock: numMin,
      maximumStock: numMax,
      costPerUnit: numCost,
      supplier: supplier.trim() || undefined,
      active,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b1b12]">
                {isEditing ? "Edit Ingredient" : "Add New Ingredient"}
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                {isEditing
                  ? `Update specifications for ${ingredient.name}`
                  : "Register a new raw material/ingredient for coffee and recipes"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Ingredient Name */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <Package size={13} className="text-[#8c7a6c]" />
              Ingredient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Coffee Beans, Whole Milk, Vanilla Syrup"
              className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#e5dbd0] focus:border-[#c98b5b]"
              }`}
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Grid: SKU & Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SKU */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
                  <Barcode size={13} className="text-[#8c7a6c]" />
                  SKU / Code
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="text-[11px] font-semibold text-[#c98b5b] hover:underline"
                >
                  Auto-generate
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ING-COF-001"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm font-mono text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
              />
            </div>

            {/* Base Unit */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
                <Scale size={13} className="text-[#8c7a6c]" />
                Measurement Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm font-medium text-[#2b1b12] outline-none transition focus:border-[#c98b5b] cursor-pointer"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label} — {u.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock Notice / Input */}
          {isEditing ? (
            <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-[#c98b5b] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#2b1b12]">
                      Current Stock:{" "}
                      <span className="font-bold text-[#6d4730]">
                        {ingredient.currentStock} {ingredient.unit}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#8c7a6c]">
                      Stock levels cannot be edited directly here to preserve the audit trail. Use &ldquo;Adjust Stock&rdquo; or &ldquo;Receive Stock&rdquo; instead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
                <Scale size={13} className="text-[#8c7a6c]" />
                Initial Stock Quantity ({unit})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="e.g. 5000"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
              />
              {errors.currentStock && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.currentStock}
                </p>
              )}
            </div>
          )}

          {/* Grid: Minimum Stock, Maximum Stock, Cost per Unit */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Minimum Stock */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12]">
                Min Stock ({unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={minimumStock}
                onChange={(e) => {
                  setMinimumStock(e.target.value);
                  if (errors.minimumStock)
                    setErrors((prev) => ({ ...prev, minimumStock: "" }));
                }}
                placeholder="Alert threshold"
                className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.minimumStock
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
              {errors.minimumStock && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.minimumStock}
                </p>
              )}
            </div>

            {/* Maximum Stock */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12]">
                Max Capacity ({unit})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={maximumStock}
                onChange={(e) => setMaximumStock(e.target.value)}
                placeholder="Storage limit"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
              />
            </div>

            {/* Cost per Unit */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1">
                <DollarSign size={12} className="text-[#8c7a6c]" />
                Cost / Unit (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={costPerUnit}
                onChange={(e) => {
                  setCostPerUnit(e.target.value);
                  if (errors.costPerUnit)
                    setErrors((prev) => ({ ...prev, costPerUnit: "" }));
                }}
                placeholder="0.00"
                className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.costPerUnit
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
              {errors.costPerUnit && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.costPerUnit}
                </p>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <Truck size={13} className="text-[#8c7a6c]" />
              Supplier / Source <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. BeanCraft Roasters, Dhaka Dairy Co."
              className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

          {/* Status Toggle */}
          <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">Active Status</p>
                <p className="text-[11px] text-[#8c7a6c]">
                  Active ingredients are enabled for recipe assembly and inventory tracking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActive(true)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-[#e5dbd0] text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setActive(false)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    !active
                      ? "bg-[#6d6056] text-white shadow-sm"
                      : "bg-white border border-[#e5dbd0] text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eee5dc]">
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
              <Check size={14} />
              <span>{isEditing ? "Save Changes" : "Create Ingredient"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
