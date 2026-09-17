import type { Product } from "@/data/products";

export type OrderType = "Dine In" | "Take Away" | "Delivery";

export type CartItem = Product & {
  quantity: number;
};

export type PaymentMethod = "cash" | "card" | "mobile";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export type PaymentDetails = {
  method: PaymentMethod;
  amountReceived: number;
  change: number;
  transactionRef?: string;
  cardLast4?: string;
};

export type CompletedOrder = {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discount: number;
  discountId?: string;
  discountCode?: string;
  discountName?: string;
  discountType?: "Percentage" | "Fixed Amount";
  taxableAmount: number;
  vat: number;
  total: number;
  customer: string;
  customerId?: string;
  orderType: OrderType;
  payment: PaymentDetails;
  createdAt: string;
  status: OrderStatus;
};
