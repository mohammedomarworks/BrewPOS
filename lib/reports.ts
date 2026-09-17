import type { CompletedOrder, OrderStatus, OrderType, PaymentMethod } from "@/types/pos";
import type { Ingredient, StockTransaction } from "@/types/inventory";
import type { Customer } from "@/types/customer";
import type { Category } from "@/data/products";

// ============================================================================
// Types
// ============================================================================

export type DateRangePreset =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "This Month"
  | "Last Month"
  | "Custom";

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface DateRangeBounds {
  start: Date;
  end: Date;
  label: string;
}

export interface ReportFilterOptions {
  dateFilter: DateRangeFilter;
  paymentMethod?: "all" | PaymentMethod;
  orderType?: "all" | OrderType;
  category?: string; // "all" or specific category name/id
}

export interface SalesSummaryKPI {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscount: number;
  taxableSales: number;
  grossSalesBeforeDiscount: number;
  vatCollected: number;
  customersServed: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  refundedOrdersCount: number;
  allOrdersCount: number;
}

export interface SalesTrendDataPoint {
  key: string;
  label: string;
  dateStr: string;
  sales: number;
  orders: number;
}

export interface PaymentBreakdownItem {
  method: PaymentMethod;
  label: string;
  amount: number;
  orders: number;
  percentage: number;
}

export interface OrderTypeBreakdownItem {
  type: OrderType;
  sales: number;
  orders: number;
  percentage: number;
}

export interface TopProductItem {
  productId: number;
  name: string;
  category: string;
  price: number;
  quantitySold: number;
  revenue: number;
  percentageOfSales: number;
}

export interface CategoryPerformanceItem {
  category: string;
  sales: number;
  itemsSold: number;
  percentageOfSales: number;
}

export interface TopCustomerItem {
  customerId?: string;
  name: string;
  orders: number;
  totalSpent: number;
  averageOrder: number;
  isRegistered: boolean;
}

export interface CustomerAnalyticsSummary {
  totalCustomersServed: number;
  registeredCustomersCount: number;
  walkInOrdersCount: number;
  topCustomers: TopCustomerItem[];
}

export interface DiscountSummaryItem {
  name: string;
  code?: string;
  type?: "Percentage" | "Fixed Amount";
  usageCount: number;
  totalDiscountValue: number;
}

export interface DiscountAnalyticsSummary {
  totalDiscountGiven: number;
  discountedOrdersCount: number;
  averageDiscountPerDiscountedOrder: number;
  mostUsedDiscount: DiscountSummaryItem | null;
  highestValueDiscount: DiscountSummaryItem | null;
  discounts: DiscountSummaryItem[];
}

export interface VatSummaryReport {
  vatRate: number; // 15
  grossSalesBeforeDiscount: number;
  totalDiscounts: number;
  taxableSales: number;
  vatCollected: number;
}

export interface ConsumedIngredientItem {
  ingredientId: string;
  name: string;
  totalQuantity: number;
  unit: string;
  displayQuantity: string;
}

export interface InventoryAnalyticsSummary {
  totalInventoryValue: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  consumedIngredients: ConsumedIngredientItem[];
}

export interface OrderStatusCountItem {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface HourlyPerformancePoint {
  hour: number;
  label: string; // "08:00"
  sales: number;
  orders: number;
}

export interface PeriodHighlights {
  highestSalesDay: { label: string; sales: number } | null;
  lowestSalesDay: { label: string; sales: number } | null;
  highestOrderDay: { label: string; orders: number } | null;
  highestRevenueProduct: { name: string; revenue: number } | null;
  peakHour: { label: string; sales: number; orders: number } | null;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `৳${rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `৳${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `৳${(amount / 1000).toFixed(1)}k`;
  }
  return `৳${amount.toFixed(0)}`;
}

export function formatPercent(rate: number): string {
  if (isNaN(rate) || !isFinite(rate)) return "0.0%";
  return `${rate.toFixed(1)}%`;
}

// ============================================================================
// Date Range Calculation Utilities
// ============================================================================

/**
 * Robust date parser for order createdAt values.
 * Handles ISO strings ("2026-09-17T10:00:00Z"),
 * localized strings ("Sep 17, 2026, 11:15 PM"),
 * and standard date timestamps.
 */
export function parseOrderDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  // Try cleaning typical "at" from strings like "Sep 17, 2026 at 11:15 PM"
  const cleaned = dateStr.replace(" at ", " ");
  const fallback = new Date(cleaned);
  return !isNaN(fallback.getTime()) ? fallback : null;
}

/**
 * Computes exact start and end Date boundaries for any given DateRangeFilter.
 */
export function getDateRangeBounds(
  filter: DateRangeFilter,
  referenceDate = new Date()
): DateRangeBounds {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();

  const startOfToday = new Date(year, month, date, 0, 0, 0, 0);
  const endOfToday = new Date(year, month, date, 23, 59, 59, 999);

  switch (filter.preset) {
    case "Today":
      return {
        start: startOfToday,
        end: endOfToday,
        label: "Today",
      };

    case "Yesterday": {
      const startOfYesterday = new Date(year, month, date - 1, 0, 0, 0, 0);
      const endOfYesterday = new Date(year, month, date - 1, 23, 59, 59, 999);
      return {
        start: startOfYesterday,
        end: endOfYesterday,
        label: "Yesterday",
      };
    }

    case "Last 7 Days": {
      // 6 days ago + today = 7 days
      const startOf7Days = new Date(year, month, date - 6, 0, 0, 0, 0);
      return {
        start: startOf7Days,
        end: endOfToday,
        label: "Last 7 Days",
      };
    }

    case "Last 30 Days": {
      // 29 days ago + today = 30 days
      const startOf30Days = new Date(year, month, date - 29, 0, 0, 0, 0);
      return {
        start: startOf30Days,
        end: endOfToday,
        label: "Last 30 Days",
      };
    }

    case "This Month": {
      const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
      return {
        start: startOfMonth,
        end: endOfToday,
        label: "This Month",
      };
    }

    case "Last Month": {
      const startOfLastMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endOfLastMonth = new Date(year, month, 0, 23, 59, 59, 999);
      return {
        start: startOfLastMonth,
        end: endOfLastMonth,
        label: "Last Month",
      };
    }

    case "Custom": {
      let customStart = startOfToday;
      let customEnd = endOfToday;

      if (filter.startDate) {
        const [sy, sm, sd] = filter.startDate.split("-").map(Number);
        if (sy && sm && sd) {
          customStart = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
        }
      }

      if (filter.endDate) {
        const [ey, em, ed] = filter.endDate.split("-").map(Number);
        if (ey && em && ed) {
          customEnd = new Date(ey, em - 1, ed, 23, 59, 59, 999);
        }
      }

      const formattedLabel = `${customStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${customEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

      return {
        start: customStart,
        end: customEnd,
        label: formattedLabel,
      };
    }

    default:
      return {
        start: startOfToday,
        end: endOfToday,
        label: "Today",
      };
  }
}

/**
 * Check if an order was created within the specified DateRangeBounds.
 */
export function isOrderInDateRange(
  order: CompletedOrder,
  bounds: DateRangeBounds
): boolean {
  const date = parseOrderDate(order.createdAt);
  if (!date) return false;
  return date.getTime() >= bounds.start.getTime() && date.getTime() <= bounds.end.getTime();
}

/**
 * Filter a list of orders based on comprehensive report filters.
 * Returns both the filtered completed orders (for revenue calculations)
 * and all filtered orders (for status breakdown).
 */
export function filterOrders(
  orders: CompletedOrder[],
  filters: ReportFilterOptions
): {
  filteredCompleted: CompletedOrder[];
  filteredAll: CompletedOrder[];
  bounds: DateRangeBounds;
} {
  const bounds = getDateRangeBounds(filters.dateFilter);

  const filteredAll = orders.filter((order) => {
    // 1. Date filter
    if (!isOrderInDateRange(order, bounds)) {
      return false;
    }

    // 2. Payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      if (order.payment?.method !== filters.paymentMethod) {
        return false;
      }
    }

    // 3. Order type filter
    if (filters.orderType && filters.orderType !== "all") {
      if (order.orderType !== filters.orderType) {
        return false;
      }
    }

    // 4. Category filter
    if (filters.category && filters.category !== "all") {
      const hasCategory = order.items.some(
        (item) =>
          item.category?.toLowerCase() === filters.category?.toLowerCase()
      );
      if (!hasCategory) return false;
    }

    return true;
  });

  // Completed orders rule: Only "Completed" status counts toward sales revenue
  const filteredCompleted = filteredAll.filter(
    (order) => order.status === "Completed"
  );

  return { filteredCompleted, filteredAll, bounds };
}

// ============================================================================
// Core Analytics Calculations
// ============================================================================

/**
 * KPI Summary from valid completed orders.
 */
export function getSalesSummary(
  completedOrders: CompletedOrder[],
  allOrdersInPeriod: CompletedOrder[]
): SalesSummaryKPI {
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalDiscount = completedOrders.reduce(
    (sum, o) => sum + (o.discount || 0),
    0
  );
  const taxableSales = completedOrders.reduce(
    (sum, o) => sum + (o.taxableAmount || 0),
    0
  );
  const grossSalesBeforeDiscount = completedOrders.reduce(
    (sum, o) => sum + (o.subtotal || 0),
    0
  );
  const vatCollected = completedOrders.reduce(
    (sum, o) => sum + (o.vat || 0),
    0
  );

  // Distinct customers served
  const customerSet = new Set<string>();
  completedOrders.forEach((o) => {
    if (o.customerId) {
      customerSet.add(o.customerId);
    } else if (o.customer && o.customer.trim().length > 0) {
      customerSet.add(o.customer.trim().toLowerCase());
    }
  });

  const completedOrdersCount = completedOrders.length;
  const cancelledOrdersCount = allOrdersInPeriod.filter(
    (o) => o.status === "Cancelled"
  ).length;
  const refundedOrdersCount = allOrdersInPeriod.filter(
    (o) => o.status === "Refunded"
  ).length;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    totalDiscount,
    taxableSales,
    grossSalesBeforeDiscount,
    vatCollected,
    customersServed: customerSet.size,
    completedOrdersCount,
    cancelledOrdersCount,
    refundedOrdersCount,
    allOrdersCount: allOrdersInPeriod.length,
  };
}

/**
 * Sales Trend over time (Hourly for 1-day ranges; Daily for up to 31 days; Monthly otherwise).
 */
export function getSalesTrend(
  completedOrders: CompletedOrder[],
  bounds: DateRangeBounds,
  preset: DateRangePreset
): SalesTrendDataPoint[] {
  const diffDays = Math.round(
    (bounds.end.getTime() - bounds.start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isSingleDay = preset === "Today" || preset === "Yesterday" || diffDays <= 1;

  if (isSingleDay) {
    // 24 Hourly buckets (00:00 to 23:00)
    const hourlyPoints: SalesTrendDataPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = String(h).padStart(2, "0") + ":00";
      hourlyPoints.push({
        key: String(h),
        label: hourStr,
        dateStr: hourStr,
        sales: 0,
        orders: 0,
      });
    }

    completedOrders.forEach((order) => {
      const d = parseOrderDate(order.createdAt);
      if (d) {
        const h = d.getHours();
        if (hourlyPoints[h]) {
          hourlyPoints[h].sales += order.total || 0;
          hourlyPoints[h].orders += 1;
        }
      }
    });

    return hourlyPoints;
  }

  // Daily grouping
  const daysCount = Math.max(1, Math.min(diffDays, 60));
  const dailyMap = new Map<string, SalesTrendDataPoint>();

  // Initialize chronological day slots
  for (let i = 0; i <= daysCount; i++) {
    const currentDay = new Date(bounds.start.getTime() + i * 24 * 60 * 60 * 1000);
    if (currentDay > bounds.end) break;

    const yyyy = currentDay.getFullYear();
    const mm = String(currentDay.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDay.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    const label = currentDay.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    dailyMap.set(key, {
      key,
      label,
      dateStr: key,
      sales: 0,
      orders: 0,
    });
  }

  completedOrders.forEach((order) => {
    const d = parseOrderDate(order.createdAt);
    if (d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;

      const existing = dailyMap.get(key);
      if (existing) {
        existing.sales += order.total || 0;
        existing.orders += 1;
      }
    }
  });

  return Array.from(dailyMap.values());
}

/**
 * Payment method breakdown (Cash, Card, Mobile).
 */
export function getPaymentBreakdown(
  completedOrders: CompletedOrder[]
): PaymentBreakdownItem[] {
  const totals: Record<PaymentMethod, { amount: number; orders: number }> = {
    cash: { amount: 0, orders: 0 },
    card: { amount: 0, orders: 0 },
    mobile: { amount: 0, orders: 0 },
  };

  completedOrders.forEach((order) => {
    const method = (order.payment?.method || "cash").toLowerCase() as PaymentMethod;
    if (totals[method]) {
      totals[method].amount += order.total || 0;
      totals[method].orders += 1;
    } else {
      totals.cash.amount += order.total || 0;
      totals.cash.orders += 1;
    }
  });

  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const configs: { method: PaymentMethod; label: string }[] = [
    { method: "cash", label: "Cash" },
    { method: "card", label: "Card" },
    { method: "mobile", label: "Mobile" },
  ];

  return configs.map(({ method, label }) => {
    const data = totals[method];
    const percentage = totalSales > 0 ? (data.amount / totalSales) * 100 : 0;
    return {
      method,
      label,
      amount: data.amount,
      orders: data.orders,
      percentage,
    };
  });
}

/**
 * Order type breakdown (Dine In, Take Away, Delivery).
 */
export function getOrderTypeBreakdown(
  completedOrders: CompletedOrder[]
): OrderTypeBreakdownItem[] {
  const types: OrderType[] = ["Dine In", "Take Away", "Delivery"];
  const map = new Map<OrderType, { sales: number; orders: number }>();
  types.forEach((t) => map.set(t, { sales: 0, orders: 0 }));

  completedOrders.forEach((order) => {
    const type = order.orderType || "Dine In";
    const existing = map.get(type) || { sales: 0, orders: 0 };
    existing.sales += order.total || 0;
    existing.orders += 1;
    map.set(type, existing);
  });

  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return types.map((type) => {
    const data = map.get(type) || { sales: 0, orders: 0 };
    const percentage = totalSales > 0 ? (data.sales / totalSales) * 100 : 0;
    return {
      type,
      sales: data.sales,
      orders: data.orders,
      percentage,
    };
  });
}

/**
 * Top Products performance from completed orders.
 */
export function getTopProducts(
  completedOrders: CompletedOrder[],
  sortBy: "revenue" | "quantity" = "revenue"
): TopProductItem[] {
  const productMap = new Map<
    number,
    {
      productId: number;
      name: string;
      category: string;
      price: number;
      quantitySold: number;
      revenue: number;
    }
  >();

  completedOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const existing = productMap.get(item.id) || {
        productId: item.id,
        name: item.name,
        category: item.category || "Beverage",
        price: item.price,
        quantitySold: 0,
        revenue: 0,
      };

      const itemQty = item.quantity || 1;
      existing.quantitySold += itemQty;
      existing.revenue += item.price * itemQty;
      productMap.set(item.id, existing);
    });
  });

  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const list: TopProductItem[] = Array.from(productMap.values()).map((p) => ({
    ...p,
    percentageOfSales: totalSales > 0 ? (p.revenue / totalSales) * 100 : 0,
  }));

  list.sort((a, b) => {
    if (sortBy === "quantity") {
      return b.quantitySold - a.quantitySold || b.revenue - a.revenue;
    }
    return b.revenue - a.revenue || b.quantitySold - a.quantitySold;
  });

  return list;
}

/**
 * Category performance derived from completed orders.
 */
export function getCategoryPerformance(
  completedOrders: CompletedOrder[],
  knownCategories: Category[] = []
): CategoryPerformanceItem[] {
  const categoryMap = new Map<string, { sales: number; itemsSold: number }>();

  // Pre-fill known categories
  knownCategories.forEach((cat) => {
    categoryMap.set(cat.name, { sales: 0, itemsSold: 0 });
  });

  completedOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const catName = item.category || "Other";
      const existing = categoryMap.get(catName) || { sales: 0, itemsSold: 0 };
      const itemQty = item.quantity || 1;
      existing.sales += item.price * itemQty;
      existing.itemsSold += itemQty;
      categoryMap.set(catName, existing);
    });
  });

  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const results: CategoryPerformanceItem[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      sales: data.sales,
      itemsSold: data.itemsSold,
      percentageOfSales: totalSales > 0 ? (data.sales / totalSales) * 100 : 0,
    }))
    .filter((c) => c.itemsSold > 0 || knownCategories.some((k) => k.name === c.category));

  results.sort((a, b) => b.sales - a.sales);
  return results;
}

/**
 * Customer analytics from completed orders and registered customer directory.
 */
export function getCustomerAnalytics(
  completedOrders: CompletedOrder[],
  registeredCustomers: Customer[] = []
): CustomerAnalyticsSummary {
  let registeredCount = 0;
  let walkInCount = 0;

  const customerSpending = new Map<
    string,
    {
      customerId?: string;
      name: string;
      orders: number;
      totalSpent: number;
      isRegistered: boolean;
    }
  >();

  completedOrders.forEach((order) => {
    const isRegistered =
      Boolean(order.customerId) ||
      registeredCustomers.some(
        (c) => c.name.toLowerCase() === (order.customer || "").toLowerCase()
      );

    if (isRegistered) {
      registeredCount += 1;
    } else {
      walkInCount += 1;
    }

    const key = order.customerId || order.customer || "Walk-in Customer";
    const existing = customerSpending.get(key) || {
      customerId: order.customerId,
      name: order.customer || "Walk-in Customer",
      orders: 0,
      totalSpent: 0,
      isRegistered,
    };

    existing.orders += 1;
    existing.totalSpent += order.total || 0;
    customerSpending.set(key, existing);
  });

  const topCustomers: TopCustomerItem[] = Array.from(customerSpending.values())
    .map((c) => ({
      ...c,
      averageOrder: c.orders > 0 ? c.totalSpent / c.orders : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalCustomersServed: customerSpending.size,
    registeredCustomersCount: registeredCount,
    walkInOrdersCount: walkInCount,
    topCustomers,
  };
}

/**
 * Historical discount analytics using snapshot stored directly on orders.
 */
export function getDiscountAnalytics(
  completedOrders: CompletedOrder[]
): DiscountAnalyticsSummary {
  let totalDiscountGiven = 0;
  let discountedOrdersCount = 0;

  const discountMap = new Map<string, DiscountSummaryItem>();

  completedOrders.forEach((order) => {
    if (order.discount && order.discount > 0) {
      totalDiscountGiven += order.discount;
      discountedOrdersCount += 1;

      const codeOrName =
        order.discountCode || order.discountName || "Special Order Discount";
      const key = codeOrName.toUpperCase();

      const existing = discountMap.get(key) || {
        name: order.discountName || order.discountCode || "Special Discount",
        code: order.discountCode,
        type: order.discountType,
        usageCount: 0,
        totalDiscountValue: 0,
      };

      existing.usageCount += 1;
      existing.totalDiscountValue += order.discount;
      discountMap.set(key, existing);
    }
  });

  const discounts = Array.from(discountMap.values()).sort(
    (a, b) => b.totalDiscountValue - a.totalDiscountValue
  );

  let mostUsedDiscount: DiscountSummaryItem | null = null;
  let highestValueDiscount: DiscountSummaryItem | null = null;

  if (discounts.length > 0) {
    mostUsedDiscount = [...discounts].sort((a, b) => b.usageCount - a.usageCount)[0];
    highestValueDiscount = [...discounts].sort(
      (a, b) => b.totalDiscountValue - a.totalDiscountValue
    )[0];
  }

  return {
    totalDiscountGiven,
    discountedOrdersCount,
    averageDiscountPerDiscountedOrder:
      discountedOrdersCount > 0
        ? totalDiscountGiven / discountedOrdersCount
        : 0,
    mostUsedDiscount,
    highestValueDiscount,
    discounts,
  };
}

/**
 * VAT Summary: 15% VAT on taxable sales from completed orders.
 */
export function getVatSummary(
  completedOrders: CompletedOrder[]
): VatSummaryReport {
  const grossSalesBeforeDiscount = completedOrders.reduce(
    (sum, o) => sum + (o.subtotal || 0),
    0
  );
  const totalDiscounts = completedOrders.reduce(
    (sum, o) => sum + (o.discount || 0),
    0
  );
  const taxableSales = completedOrders.reduce(
    (sum, o) => sum + (o.taxableAmount || 0),
    0
  );
  const vatCollected = completedOrders.reduce(
    (sum, o) => sum + (o.vat || 0),
    0
  );

  return {
    vatRate: 15,
    grossSalesBeforeDiscount,
    totalDiscounts,
    taxableSales,
    vatCollected,
  };
}

/**
 * Inventory Analytics: Current valuation and stock consumption from actual transaction history.
 */
export function getInventorySummary(
  ingredients: Ingredient[],
  transactions: StockTransaction[],
  bounds: DateRangeBounds
): InventoryAnalyticsSummary {
  // Current valuation
  const totalInventoryValue = ingredients.reduce(
    (sum, ing) => sum + (ing.currentStock || 0) * (ing.costPerUnit || 0),
    0
  );

  const lowStockItemsCount = ingredients.filter(
    (ing) => ing.currentStock > 0 && ing.currentStock <= ing.minimumStock
  ).length;

  const outOfStockItemsCount = ingredients.filter(
    (ing) => ing.currentStock <= 0
  ).length;

  // Consumption within bounds from transactions
  const consumptionMap = new Map<string, { total: number; unit: string; name: string }>();

  transactions.forEach((tx) => {
    const txDate = parseOrderDate(tx.createdAt);
    if (!txDate) return;
    if (
      txDate.getTime() >= bounds.start.getTime() &&
      txDate.getTime() <= bounds.end.getTime()
    ) {
      if (tx.type === "Sale Consumption" || tx.quantity < 0) {
        const ing = ingredients.find((i) => i.id === tx.ingredientId);
        const name = ing ? ing.name : tx.ingredientId;
        const unit = ing ? ing.unit : "units";
        const deduction = Math.abs(tx.quantity);

        const existing = consumptionMap.get(tx.ingredientId) || {
          total: 0,
          unit,
          name,
        };
        existing.total += deduction;
        consumptionMap.set(tx.ingredientId, existing);
      }
    }
  });

  const consumedIngredients: ConsumedIngredientItem[] = Array.from(
    consumptionMap.entries()
  )
    .map(([ingredientId, data]) => {
      let displayQuantity = `${data.total.toLocaleString()} ${data.unit}`;
      // Friendly unit conversions (e.g. g -> kg, ml -> L)
      if (data.unit === "g" && data.total >= 1000) {
        displayQuantity = `${(data.total / 1000).toFixed(1)} kg`;
      } else if (data.unit === "ml" && data.total >= 1000) {
        displayQuantity = `${(data.total / 1000).toFixed(1)} L`;
      }

      return {
        ingredientId,
        name: data.name,
        totalQuantity: data.total,
        unit: data.unit,
        displayQuantity,
      };
    })
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  return {
    totalInventoryValue,
    lowStockItemsCount,
    outOfStockItemsCount,
    consumedIngredients,
  };
}

/**
 * Breakdown of all orders by OrderStatus.
 */
export function getOrderStatusBreakdown(
  ordersInPeriod: CompletedOrder[]
): OrderStatusCountItem[] {
  const statuses: OrderStatus[] = [
    "Completed",
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Cancelled",
    "Refunded",
  ];

  const total = ordersInPeriod.length;
  const countMap = new Map<OrderStatus, number>();
  statuses.forEach((s) => countMap.set(s, 0));

  ordersInPeriod.forEach((o) => {
    const s = o.status || "Completed";
    countMap.set(s, (countMap.get(s) || 0) + 1);
  });

  return statuses.map((status) => {
    const count = countMap.get(status) || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return {
      status,
      count,
      percentage,
    };
  });
}

/**
 * Hourly sales and order distribution (00:00 to 23:00).
 */
export function getHourlyPerformance(
  completedOrders: CompletedOrder[]
): HourlyPerformancePoint[] {
  const points: HourlyPerformancePoint[] = [];

  for (let h = 0; h < 24; h++) {
    points.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      sales: 0,
      orders: 0,
    });
  }

  completedOrders.forEach((order) => {
    const d = parseOrderDate(order.createdAt);
    if (d) {
      const h = d.getHours();
      if (points[h]) {
        points[h].sales += order.total || 0;
        points[h].orders += 1;
      }
    }
  });

  return points;
}

/**
 * Highlights for highest/lowest performing days, peak hours, and top revenue drivers.
 */
export function getPeriodHighlights(
  trendData: SalesTrendDataPoint[],
  topProducts: TopProductItem[],
  hourlyData: HourlyPerformancePoint[]
): PeriodHighlights {
  const activeTrend = trendData.filter((t) => t.sales > 0 || t.orders > 0);

  let highestSalesDay: { label: string; sales: number } | null = null;
  let lowestSalesDay: { label: string; sales: number } | null = null;
  let highestOrderDay: { label: string; orders: number } | null = null;

  if (activeTrend.length > 0) {
    const sortedBySales = [...activeTrend].sort((a, b) => b.sales - a.sales);
    highestSalesDay = {
      label: sortedBySales[0].label,
      sales: sortedBySales[0].sales,
    };
    lowestSalesDay = {
      label: sortedBySales[sortedBySales.length - 1].label,
      sales: sortedBySales[sortedBySales.length - 1].sales,
    };

    const sortedByOrders = [...activeTrend].sort((a, b) => b.orders - a.orders);
    highestOrderDay = {
      label: sortedByOrders[0].label,
      orders: sortedByOrders[0].orders,
    };
  }

  const highestRevenueProduct =
    topProducts.length > 0
      ? { name: topProducts[0].name, revenue: topProducts[0].revenue }
      : null;

  // Peak hour
  const activeHours = hourlyData.filter((h) => h.sales > 0 || h.orders > 0);
  let peakHour: { label: string; sales: number; orders: number } | null = null;
  if (activeHours.length > 0) {
    const sortedHours = [...activeHours].sort((a, b) => b.sales - a.sales);
    peakHour = {
      label: sortedHours[0].label,
      sales: sortedHours[0].sales,
      orders: sortedHours[0].orders,
    };
  }

  return {
    highestSalesDay,
    lowestSalesDay,
    highestOrderDay,
    highestRevenueProduct,
    peakHour,
  };
}

// ============================================================================
// CSV Export Utility
// ============================================================================

/**
 * Generates a clean, comprehensive CSV report file content for the current report view.
 */
export function generateReportCsv(
  summary: SalesSummaryKPI,
  bounds: DateRangeBounds,
  completedOrders: CompletedOrder[],
  topProducts: TopProductItem[],
  paymentBreakdown: PaymentBreakdownItem[]
): string {
  const rows: string[] = [];

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  // Header & Metadata
  rows.push("BREWPOS SALES & ANALYTICS REPORT");
  rows.push(`Period,${escapeCsv(bounds.label)}`);
  rows.push(`Generated At,${escapeCsv(new Date().toLocaleString("en-US"))}`);
  rows.push("");

  // Executive KPI Summary
  rows.push("EXECUTIVE KPI SUMMARY");
  rows.push("Metric,Value");
  rows.push(`Total Sales,${summary.totalSales.toFixed(2)}`);
  rows.push(`Completed Orders,${summary.totalOrders}`);
  rows.push(`Average Order Value,${summary.averageOrderValue.toFixed(2)}`);
  rows.push(`Total Discount Given,${summary.totalDiscount.toFixed(2)}`);
  rows.push(`Taxable Amount,${summary.taxableSales.toFixed(2)}`);
  rows.push(`VAT Collected (15%),${summary.vatCollected.toFixed(2)}`);
  rows.push(`Distinct Customers,${summary.customersServed}`);
  rows.push(`Cancelled Orders,${summary.cancelledOrdersCount}`);
  rows.push(`Refunded Orders,${summary.refundedOrdersCount}`);
  rows.push("");

  // Payment Breakdown
  rows.push("SALES BY PAYMENT METHOD");
  rows.push("Method,Amount (BDT),Orders,Percentage");
  paymentBreakdown.forEach((p) => {
    rows.push(
      `${escapeCsv(p.label)},${p.amount.toFixed(2)},${p.orders},${p.percentage.toFixed(1)}%`
    );
  });
  rows.push("");

  // Top Products
  rows.push("TOP PRODUCTS PERFORMANCE");
  rows.push("Product,Category,Quantity Sold,Revenue (BDT),Percentage of Sales");
  topProducts.forEach((p) => {
    rows.push(
      `${escapeCsv(p.name)},${escapeCsv(p.category)},${p.quantitySold},${p.revenue.toFixed(2)},${p.percentageOfSales.toFixed(1)}%`
    );
  });
  rows.push("");

  // Completed Orders List
  rows.push("COMPLETED ORDERS DETAIL");
  rows.push(
    "Order Number,Date & Time,Customer,Order Type,Payment Method,Subtotal,Discount,Taxable,VAT,Total,Status"
  );
  completedOrders.forEach((o) => {
    rows.push(
      [
        escapeCsv(o.orderNumber),
        escapeCsv(o.createdAt),
        escapeCsv(o.customer || "Walk-in"),
        escapeCsv(o.orderType),
        escapeCsv(o.payment?.method || "cash"),
        (o.subtotal || 0).toFixed(2),
        (o.discount || 0).toFixed(2),
        (o.taxableAmount || 0).toFixed(2),
        (o.vat || 0).toFixed(2),
        (o.total || 0).toFixed(2),
        escapeCsv(o.status),
      ].join(",")
    );
  });

  return rows.join("\n");
}
