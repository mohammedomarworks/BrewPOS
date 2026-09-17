"use client";

import React, { useState, useMemo } from "react";
import { Download, Printer, BarChart3 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SkeletonTable from "@/components/ui/SkeletonTable";
import { useOrdersStore } from "@/lib/orders";
import { useCategoriesStore } from "@/lib/products";
import { useCustomersStore } from "@/lib/customers";
import { useInventoryStore } from "@/lib/inventory-store";
import {
  filterOrders,
  getSalesSummary,
  getSalesTrend,
  getPaymentBreakdown,
  getOrderTypeBreakdown,
  getTopProducts,
  getCategoryPerformance,
  getCustomerAnalytics,
  getDiscountAnalytics,
  getVatSummary,
  getInventorySummary,
  getOrderStatusBreakdown,
  getHourlyPerformance,
  getPeriodHighlights,
  generateReportCsv,
} from "@/lib/reports";
import type {
  DateRangeFilter,
  ReportFilterOptions,
} from "@/lib/reports";
import type { PaymentMethod, OrderType } from "@/types/pos";

// Report Components
import PrintReportHeader from "@/components/reports/PrintReportHeader";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ReportFilters from "@/components/reports/ReportFilters";
import KpiCardGrid from "@/components/reports/KpiCardGrid";
import SalesTrendChart from "@/components/reports/SalesTrendChart";
import PaymentBreakdownCard from "@/components/reports/PaymentBreakdownCard";
import OrderTypeBreakdownCard from "@/components/reports/OrderTypeBreakdownCard";
import TopProductsTable from "@/components/reports/TopProductsTable";
import CategoryPerformanceTable from "@/components/reports/CategoryPerformanceTable";
import CustomerAnalyticsCard from "@/components/reports/CustomerAnalyticsCard";
import DiscountReportCard from "@/components/reports/DiscountReportCard";
import VatReportCard from "@/components/reports/VatReportCard";
import InventoryAnalyticsCard from "@/components/reports/InventoryAnalyticsCard";
import OrderStatusBreakdownCard from "@/components/reports/OrderStatusBreakdownCard";
import HourlyPerformanceChart from "@/components/reports/HourlyPerformanceChart";
import PeriodHighlightsCard from "@/components/reports/PeriodHighlightsCard";
import ReportEmptyState from "@/components/reports/ReportEmptyState";

export default function ReportsPage() {
  // Global Data Stores
  const { orders, isLoaded } = useOrdersStore();
  const { categories } = useCategoriesStore();
  const { customers } = useCustomersStore();
  const { ingredients, getStockTransactions } = useInventoryStore();

  // Report Filter State
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    preset: "Today",
  });
  const [paymentMethod, setPaymentMethod] = useState<"all" | PaymentMethod>(
    "all"
  );
  const [orderType, setOrderType] = useState<"all" | OrderType>("all");
  const [category, setCategory] = useState<string>("all");

  const filterOptions: ReportFilterOptions = useMemo(
    () => ({
      dateFilter,
      paymentMethod,
      orderType,
      category,
    }),
    [dateFilter, paymentMethod, orderType, category]
  );

  // Filtered Orders & Bounds
  const { filteredCompleted, filteredAll, bounds } = useMemo(
    () => filterOrders(orders, filterOptions),
    [orders, filterOptions]
  );

  // Derived Analytics Data (Memoized for optimal performance)
  const salesSummary = useMemo(
    () => getSalesSummary(filteredCompleted, filteredAll),
    [filteredCompleted, filteredAll]
  );

  const salesTrend = useMemo(
    () => getSalesTrend(filteredCompleted, bounds, dateFilter.preset),
    [filteredCompleted, bounds, dateFilter.preset]
  );

  const paymentBreakdown = useMemo(
    () => getPaymentBreakdown(filteredCompleted),
    [filteredCompleted]
  );

  const orderTypeBreakdown = useMemo(
    () => getOrderTypeBreakdown(filteredCompleted),
    [filteredCompleted]
  );

  const topProducts = useMemo(
    () => getTopProducts(filteredCompleted, "revenue"),
    [filteredCompleted]
  );

  const categoryPerformance = useMemo(
    () => getCategoryPerformance(filteredCompleted, categories),
    [filteredCompleted, categories]
  );

  const customerAnalytics = useMemo(
    () => getCustomerAnalytics(filteredCompleted, customers),
    [filteredCompleted, customers]
  );

  const discountAnalytics = useMemo(
    () => getDiscountAnalytics(filteredCompleted),
    [filteredCompleted]
  );

  const vatSummary = useMemo(
    () => getVatSummary(filteredCompleted),
    [filteredCompleted]
  );

  const stockTransactions = useMemo(
    () => getStockTransactions(),
    [getStockTransactions]
  );

  const inventorySummary = useMemo(
    () => getInventorySummary(ingredients, stockTransactions, bounds),
    [ingredients, stockTransactions, bounds]
  );

  const orderStatuses = useMemo(
    () => getOrderStatusBreakdown(filteredAll),
    [filteredAll]
  );

  const hourlyPerformance = useMemo(
    () => getHourlyPerformance(filteredCompleted),
    [filteredCompleted]
  );

  const periodHighlights = useMemo(
    () => getPeriodHighlights(salesTrend, topProducts, hourlyPerformance),
    [salesTrend, topProducts, hourlyPerformance]
  );

  const hasMatchingOrders = filteredCompleted.length > 0;
  const hasActiveSecondaryFilters =
    paymentMethod !== "all" || orderType !== "all" || category !== "all";

  const handleResetFilters = () => {
    setPaymentMethod("all");
    setOrderType("all");
    setCategory("all");
  };

  // CSV Export Action
  const handleExportCsv = () => {
    const csvContent = generateReportCsv(
      salesSummary,
      bounds,
      filteredCompleted,
      topProducts,
      paymentBreakdown
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedPreset = dateFilter.preset.toLowerCase().replace(/\s+/g, "-");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `brewpos-sales-report-${sanitizedPreset}-${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Report Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar - hidden on print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col print:w-full print:bg-white">
        {/* Topbar - hidden on print */}
        <div className="print:hidden">
          <Topbar
            title="Reports & Analytics"
            subtitle="Understand sales, payments, products, customers, discounts, VAT, and inventory performance."
          />
        </div>

        {/* Content Area */}
        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8 print:p-0 print:overflow-visible">
          {/* Print-Only Official Document Header */}
          <PrintReportHeader periodLabel={bounds.label} />

          {/* Screen Page Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-[#c98b5b]" size={24} />
                <h2 className="text-2xl font-bold tracking-tight text-[#2b1b12]">
                  Reports & Analytics
                </h2>
              </div>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Understand sales, payments, products, customers, discounts, VAT,
                and inventory performance.
              </p>
            </div>

            {/* Actions: Export & Print */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#2b1b12] shadow-xs transition hover:bg-[#faf7f3]"
                title="Download CSV export for this date range"
              >
                <Download size={15} className="text-[#8c7a6c]" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#432d20]"
                title="Print report layout"
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Filtering Section - hidden on print */}
          <div className="mb-6 space-y-3 print:hidden">
            <DateRangeSelector
              filter={dateFilter}
              onChange={setDateFilter}
            />

            <ReportFilters
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
              onReset={handleResetFilters}
            />
          </div>

          {/* Active Period Label (Visible on screen and print) */}
          <div className="mb-6 flex items-center justify-between border-b border-[#e8dfd4] pb-3 text-xs text-[#8c7a6c]">
            <div>
              <span>Viewing Report for: </span>
              <strong className="text-[#2b1b12]">{bounds.label}</strong>
              {hasActiveSecondaryFilters && (
                <span className="ml-2 rounded-md bg-[#faf7f3] px-2 py-0.5 text-[11px] font-medium text-[#c98b5b]">
                  Filtered
                </span>
              )}
            </div>
            <span>
              {salesSummary.completedOrdersCount} completed sales recorded
            </span>
          </div>

          {!isLoaded ? (
            <div className="space-y-6">
              <SkeletonTable rows={4} columns={4} />
              <SkeletonTable rows={5} columns={4} />
            </div>
          ) : (
            <>
              {/* Section 3: Main KPI Cards */}
              <section className="mb-6">
                <KpiCardGrid summary={salesSummary} />
              </section>

              {/* Empty State vs Full Reports Content */}
              {!hasMatchingOrders ? (
            <div className="space-y-6">
              <ReportEmptyState
                periodLabel={bounds.label}
                hasFilters={hasActiveSecondaryFilters}
                onResetFilters={handleResetFilters}
              />

              {/* Order Status Breakdown is always shown to reveal pending/cancelled orders if any */}
              {salesSummary.allOrdersCount > 0 && (
                <OrderStatusBreakdownCard statuses={orderStatuses} />
              )}

              {/* Current inventory valuation is always relevant */}
              <InventoryAnalyticsCard summary={inventorySummary} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 4: Sales Trend Chart */}
              <section>
                <SalesTrendChart
                  data={salesTrend}
                  periodLabel={bounds.label}
                />
              </section>

              {/* Section 5 & 6: Payment Methods & Order Types */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PaymentBreakdownCard items={paymentBreakdown} />
                <OrderTypeBreakdownCard items={orderTypeBreakdown} />
              </section>

              {/* Section 7: Top Products */}
              <section>
                <TopProductsTable products={topProducts} />
              </section>

              {/* Section 8 & 9: Categories & Customers */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CategoryPerformanceTable categories={categoryPerformance} />
                <CustomerAnalyticsCard analytics={customerAnalytics} />
              </section>

              {/* Section 10 & 11: Discounts & VAT */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DiscountReportCard analytics={discountAnalytics} />
                <VatReportCard vatSummary={vatSummary} />
              </section>

              {/* Section 12: Inventory Analytics */}
              <section>
                <InventoryAnalyticsCard summary={inventorySummary} />
              </section>

              {/* Section 13 & 15: Order Status Breakdown & Period Highlights */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <OrderStatusBreakdownCard statuses={orderStatuses} />
                <PeriodHighlightsCard highlights={periodHighlights} />
              </section>

              {/* Section 14: Hourly Performance (Shows for single day or full period distribution) */}
              <section>
                <HourlyPerformanceChart hourlyData={hourlyPerformance} />
              </section>
            </div>
          )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}
