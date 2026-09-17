"use client";

import { useState } from "react";
import { X, User, Phone, Mail, AlertCircle, Check } from "lucide-react";
import type { Customer, CustomerInput } from "@/types/customer";
import { isDuplicateCustomer } from "@/lib/customers";
import { useModalEscape } from "@/lib/use-modal-escape";

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  onSaveCustomer: (data: CustomerInput) => Customer;
}

export default function QuickCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
  onSaveCustomer,
}: QuickCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Customer name is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Invalid email address.";
      }
    }

    const dupCheck = isDuplicateCustomer(phone.trim(), email.trim() || undefined);
    if (dupCheck.isDuplicate) {
      if (dupCheck.field === "phone") {
        newErrors.phone = "A customer with this phone number already exists.";
      } else if (dupCheck.field === "email") {
        newErrors.email = "A customer with this email address already exists.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const created = onSaveCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      status: "Active",
    });

    onCustomerCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-customer-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              <User size={16} />
            </div>
            <div>
              <h3 id="quick-customer-title" className="text-base font-bold text-[#2b1b12]">
                New Customer
              </h3>
              <p className="text-[11px] text-[#8c7a6c]">
                Quick registration for POS cashier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
              />
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Nusrat Jahan"
                className={`h-10 w-full rounded-xl border bg-[#faf7f3] pl-9 pr-3 text-xs font-medium text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="e.g. +880 1711-000000"
                className={`h-10 w-full rounded-xl border bg-[#faf7f3] pl-9 pr-3 text-xs font-medium text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-[#2b1b12]">
              Email Address <span className="text-[11px] font-normal text-[#8c7a6c]">(Optional)</span>
            </label>
            <div className="relative mt-1">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. nusrat@example.com"
                className={`h-10 w-full rounded-xl border bg-[#faf7f3] pl-9 pr-3 text-xs font-medium text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:bg-white ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e5dbd0] focus:border-[#c98b5b]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.email}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eee5dc]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e5dbd0] bg-white px-3.5 py-2 text-xs font-semibold text-[#66574d] transition hover:bg-[#faf7f3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#2b1b12] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#40291d]"
            >
              <Check size={13} />
              <span>Save & Select</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
