import type { OrderStatus, OrderType } from "./pos";

export type MobileProvider = "bKash" | "Nagad" | "Rocket" | "Upay";

export interface BusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  logoUrl?: string;
}

export interface TaxCurrencySettings {
  currencyCode: string; // e.g., "BDT", "USD", "EUR"
  currencySymbol: string; // e.g., "৳", "$", "€"
  vatRate: number; // default: 15
}

export interface PosSettings {
  defaultOrderType: OrderType;
  enableDineIn: boolean;
  enableTakeAway: boolean;
  enableDelivery: boolean;
  allowWalkIn: boolean;
  enableQuickTender: boolean;
  showProductImages: boolean;
  requireCustomerForDelivery: boolean;
  autoOpenReceipt: boolean;
}

export interface PaymentSettings {
  enableCash: boolean;
  enableCard: boolean;
  enableMobile: boolean;
  mobileProviders: MobileProvider[];
}

export interface ReceiptSettings {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showVatNumber: boolean;
  showCashier: boolean;
  showCustomer: boolean;
  showOrderType: boolean;
  showPaymentMethod: boolean;
  footerMessage: string;
}

export interface OrderSettings {
  orderPrefix: string; // default: "COF"
  allowCancellation: boolean;
  allowRefunds: boolean;
  defaultOrderStatus: OrderStatus; // default: "Completed"
}

export interface NotificationSettings {
  lowStockAlerts: boolean;
  soundAlerts: boolean;
  emailReceipts: boolean;
}

export interface Settings {
  business: BusinessSettings;
  taxCurrency: TaxCurrencySettings;
  pos: PosSettings;
  payments: PaymentSettings;
  receipt: ReceiptSettings;
  orders: OrderSettings;
  notifications: NotificationSettings;
  updatedAt: string;
}
