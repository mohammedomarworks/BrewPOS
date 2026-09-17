"use client";

import { useState } from "react";
import { X, User, Phone, Mail, MapPin, FileText, AlertCircle, Check } from "lucide-react";
import type { Customer, CustomerInput } from "@/types/customer";
import { isDuplicateCustomer } from "@/lib/customers";
import { useModalEscape } from "@/lib/use-modal-escape";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (data: CustomerInput) => void;
}

export default function CustomerModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: CustomerModalProps) {
  const isEditing = !!customer;

  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [notes, setNotes] = useState(customer?.notes || "");
  const [status, setStatus] = useState<"Active" | "Inactive">(
    customer?.status || "Active"
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    // Check duplicate phone or email
    const duplicateCheck = isDuplicateCustomer(
      phone.trim(),
      email.trim() || undefined,
      customer?.id
    );

    if (duplicateCheck.isDuplicate) {
      if (duplicateCheck.field === "phone") {
        newErrors.phone = "A customer with this phone number already exists.";
      } else if (duplicateCheck.field === "email") {
        newErrors.email = "A customer with this email address already exists.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(customer ? { id: customer.id } : {}),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <User size={18} />
            </div>
            <div>
              <h2 id="customer-modal-title" className="text-lg font-bold text-[#2b1b12]">
                {isEditing ? "Edit Customer Profile" : "Add New Customer"}
              </h2>
              <p className="text-xs text-[#8c7a6c]">
                {isEditing
                  ? `Update details for ${customer.name}`
                  : "Register a new customer for BrewPOS"}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <User size={13} className="text-[#8c7a6c]" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Mohammed Omar"
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

          {/* Grid: Phone & Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
                <Phone size={13} className="text-[#8c7a6c]" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="e.g. +880 1711-000000"
                className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
                <Mail size={13} className="text-[#8c7a6c]" />
                Email Address <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. omar@example.com"
                className={`mt-1.5 h-11 w-full rounded-xl border bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
              {errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#8c7a6c]" />
              Address / Area <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12] flex items-center gap-1.5">
              <FileText size={13} className="text-[#8c7a6c]" />
              Customer Notes / Coffee Preferences <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers oat milk, extra caramel drizzle, regular morning customer..."
              className="mt-1.5 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white resize-none"
            />
          </div>

          {/* Status Selection */}
          <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#2b1b12]">Active Status</p>
                <p className="text-[11px] text-[#8c7a6c]">
                  Active customers appear in POS register for quick ordering.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("Active")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    status === "Active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-[#e5dbd0] text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("Inactive")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    status === "Inactive"
                      ? "bg-[#6d6056] text-white shadow-sm"
                      : "bg-white border border-[#e5dbd0] text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              <span>{isEditing ? "Save Changes" : "Create Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
