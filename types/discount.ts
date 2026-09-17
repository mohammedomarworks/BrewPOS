import type { CartItem } from "@/types/pos";

export type DiscountType = "Percentage" | "Fixed Amount";

export type DiscountAppliesTo =
  | "Entire Order"
  | "Specific Products"
  | "Specific Categories";

export type CustomerEligibility = "Everyone" | "Registered Customers";

export type DiscountStatus = "Active" | "Scheduled" | "Expired" | "Inactive";

export interface Discount {
  id: string; // e.g. "DISC-001"
  code: string; // e.g. "SUMMER10" (normalized to uppercase)
  name: string; // e.g. "Summer Coffee Offer"
  description?: string;
  type: DiscountType;
  value: number; // percentage (1-100) or fixed amount (in BDT ৳)
  appliesTo: DiscountAppliesTo;
  productIds?: number[]; // IDs of eligible products if Specific Products
  categoryIds?: string[]; // IDs/names of eligible categories if Specific Categories
  minimumOrderAmount?: number; // min subtotal required (in BDT ৳)
  maximumDiscountAmount?: number; // max discount cap for percentage types (in BDT ৳)
  startAt?: string; // ISO date string
  endAt?: string; // ISO date string
  usageLimit?: number; // total times this discount can be used (undefined = unlimited)
  usageCount: number; // times this discount has been used in completed orders
  customerEligibility: CustomerEligibility;
  active: boolean; // administrative toggle
  createdAt: string;
  updatedAt: string;
}

export type DiscountInput = Omit<
  Discount,
  "id" | "usageCount" | "createdAt" | "updatedAt"
> & {
  id?: string;
};

export interface DiscountCalculationResult {
  valid: boolean;
  reason?: string;
  discount: Discount | null;
  eligibleSubtotal: number;
  discountAmount: number;
  taxableAmount: number;
  vat: number;
  total: number;
}

export interface DiscountValidationParams {
  discount: Discount;
  cart: CartItem[];
  customerId?: string;
  currentTime?: number;
}
