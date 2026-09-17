"use client";

import { useState } from "react";
import {
  X,
  Tags,
  Plus,
  Trash2,
  Pencil,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Category, Product } from "@/data/products";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  onAddCategory: (cat: Omit<Category, "id"> & { id?: string }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => { success: boolean; reason?: string };
  onToggleActive: (id: string) => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleActive,
}: CategoryModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setFeedback({ type: "error", message: "Category name is required." });
      return;
    }

    // Check duplicate name
    if (
      categories.some(
        (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
      )
    ) {
      setFeedback({
        type: "error",
        message: "A category with this name already exists.",
      });
      return;
    }

    onAddCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      active: true,
    });

    setNewCatName("");
    setNewCatDesc("");
    setFeedback({
      type: "success",
      message: `Category "${newCatName.trim()}" created successfully.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
    setFeedback(null);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) {
      setFeedback({ type: "error", message: "Category name cannot be blank." });
      return;
    }

    // Check collision with another category
    if (
      categories.some(
        (c) =>
          c.id !== id && c.name.toLowerCase() === editName.trim().toLowerCase()
      )
    ) {
      setFeedback({
        type: "error",
        message: "Another category with this name already exists.",
      });
      return;
    }

    onUpdateCategory(id, {
      name: editName.trim(),
      description: editDesc.trim(),
    });

    setEditingId(null);
    setFeedback({
      type: "success",
      message: "Category updated successfully.",
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (cat: Category) => {
    const result = onDeleteCategory(cat.id);
    if (!result.success) {
      setFeedback({
        type: "error",
        message:
          result.reason ||
          `Cannot delete "${cat.name}". Products belong to this category.`,
      });
    } else {
      setFeedback({
        type: "success",
        message: `Category "${cat.name}" removed successfully.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <Tags size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b1b12]">
                Manage Categories
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                Add, edit, or configure menu categories for POS and Menu.
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

        <div className="max-h-[78vh] overflow-y-auto p-6 space-y-6">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50/70 text-red-800"
                  : "border-emerald-200 bg-emerald-50/70 text-emerald-800"
              }`}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Add Category Form */}
          <form
            onSubmit={handleAdd}
            className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3]/70 p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
              Create New Category
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1.5fr_auto]">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name (e.g. Smoothies)"
                className="h-10 rounded-xl border border-[#e5dbd0] bg-white px-3 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
              />

              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Optional description"
                className="h-10 rounded-xl border border-[#e5dbd0] bg-white px-3 text-xs text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
              />

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#2b1b12] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                Existing Categories ({categories.length})
              </h3>
            </div>

            <div className="divide-y divide-[#eee5dc] rounded-2xl border border-[#eee5dc] bg-white overflow-hidden">
              {categories.map((cat) => {
                const productCount = products.filter(
                  (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                ).length;
                const isEditing = editingId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-2 p-3.5 transition sm:flex-row sm:items-center sm:justify-between hover:bg-[#faf7f3]/50"
                  >
                    {isEditing ? (
                      /* Editing Mode */
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 w-full sm:w-44 rounded-lg border border-[#c98b5b] bg-white px-2.5 text-xs font-semibold text-[#2b1b12] outline-none"
                        />
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description"
                          className="h-9 w-full sm:flex-1 rounded-lg border border-[#e5dbd0] bg-white px-2.5 text-xs text-[#2b1b12] outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(cat.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700"
                            title="Save Category"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#8c7a6c] transition hover:bg-[#f4ece4]"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleActive(cat.id)}
                            title={
                              cat.active ? "Category Active (Click to hide)" : "Category Hidden (Click to activate)"
                            }
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                              cat.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 bg-gray-100 text-gray-400"
                            }`}
                          >
                            {cat.active ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#2b1b12]">
                                {cat.name}
                              </span>
                              {!cat.active && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                  Hidden
                                </span>
                              )}
                              <span className="rounded-md bg-[#faf7f3] border border-[#e8dfd4] px-2 py-0.5 text-[11px] font-medium text-[#6d4730]">
                                {productCount} {productCount === 1 ? "item" : "items"}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-[#8c7a6c]">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#66574d] transition hover:border-[#c98b5b] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                            title="Edit Category"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5dbd0] text-[#9b897b] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            title={
                              productCount > 0
                                ? `Cannot delete: ${productCount} items belong to this category`
                                : "Delete Category"
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2b1b12] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#40291d]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
