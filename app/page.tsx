"use client";

import React, { useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import SalesOverview from "@/components/dashboard/SalesOverview";
import TopProducts from "@/components/dashboard/TopProducts";
import { useOrdersStore } from "@/lib/orders";
import {
  getSalesSummary,
  getDateRangeBounds,
  isOrderInDateRange,
  formatCurrency,
} from "@/lib/reports";
import {
  Banknote,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { orders } = useOrdersStore();

  // Completed orders
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "Completed"),
    [orders]
  );

  // Today's orders
  const todayBounds = useMemo(
    () => getDateRangeBounds({ preset: "Today" }),
    []
  );
  const todayOrders = useMemo(
    () => completedOrders.filter((o) => isOrderInDateRange(o, todayBounds)),
    [completedOrders, todayBounds]
  );

  // Yesterday's orders
  const yesterdayBounds = useMemo(
    () => getDateRangeBounds({ preset: "Yesterday" }),
    []
  );
  const yesterdayOrders = useMemo(
    () =>
      completedOrders.filter((o) => isOrderInDateRange(o, yesterdayBounds)),
    [completedOrders, yesterdayBounds]
  );

  // Summaries
  const todaySummary = useMemo(
    () => getSalesSummary(todayOrders, todayOrders),
    [todayOrders]
  );
  const yesterdaySummary = useMemo(
    () => getSalesSummary(yesterdayOrders, yesterdayOrders),
    [yesterdayOrders]
  );

  // Derived comparative metrics vs yesterday
  const salesChange = useMemo(() => {
    if (yesterdaySummary.totalSales === 0) {
      return todaySummary.totalSales > 0 ? "+100%" : "0.0%";
    }
    const diff =
      ((todaySummary.totalSales - yesterdaySummary.totalSales) /
        yesterdaySummary.totalSales) *
      100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  }, [todaySummary.totalSales, yesterdaySummary.totalSales]);

  const ordersChange = useMemo(() => {
    if (yesterdaySummary.totalOrders === 0) {
      return todaySummary.totalOrders > 0 ? "+100%" : "0.0%";
    }
    const diff =
      ((todaySummary.totalOrders - yesterdaySummary.totalOrders) /
        yesterdaySummary.totalOrders) *
      100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  }, [todaySummary.totalOrders, yesterdaySummary.totalOrders]);

  const aovChange = useMemo(() => {
    if (yesterdaySummary.averageOrderValue === 0) {
      return todaySummary.averageOrderValue > 0 ? "+100%" : "0.0%";
    }
    const diff =
      ((todaySummary.averageOrderValue -
        yesterdaySummary.averageOrderValue) /
        yesterdaySummary.averageOrderValue) *
      100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  }, [todaySummary.averageOrderValue, yesterdaySummary.averageOrderValue]);

  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Dashboard"
          subtitle="Welcome back to BrewPOS"
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {/* Page heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#2b1b12]">
                Overview
              </h2>
              <p className="mt-1 text-sm text-[#8c7a6c]">
                Here&apos;s what&apos;s happening in your coffee shop today.
              </p>
            </div>

            <Link
              href="/reports"
              className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-4 py-2.5 text-xs font-semibold text-[#2b1b12] shadow-xs transition hover:bg-[#faf7f3]"
            >
              <span>View Full Analytics</span>
              <ArrowUpRight size={14} className="text-[#c98b5b]" />
            </Link>
          </div>

          {/* Real Statistics derived from live orders */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Today's Sales"
              value={formatCurrency(todaySummary.totalSales)}
              change={salesChange}
              changeType={
                todaySummary.totalSales >= yesterdaySummary.totalSales
                  ? "positive"
                  : "negative"
              }
              description="vs yesterday"
              icon={Banknote}
            />

            <StatCard
              label="Orders"
              value={todaySummary.totalOrders.toLocaleString()}
              change={ordersChange}
              changeType={
                todaySummary.totalOrders >= yesterdaySummary.totalOrders
                  ? "positive"
                  : "negative"
              }
              description="vs yesterday"
              icon={ShoppingBag}
            />

            <StatCard
              label="Customers"
              value={todaySummary.customersServed.toLocaleString()}
              change={`${todaySummary.customersServed} served`}
              changeType="neutral"
              description="today's unique patrons"
              icon={Users}
            />

            <StatCard
              label="Average Order"
              value={formatCurrency(todaySummary.averageOrderValue)}
              change={aovChange}
              changeType={
                todaySummary.averageOrderValue >=
                yesterdaySummary.averageOrderValue
                  ? "positive"
                  : "negative"
              }
              description="vs yesterday"
              icon={TrendingUp}
            />
          </section>

          {/* Main content cards */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <SalesOverview orders={orders} />
            <TopProducts orders={orders} />
          </section>
        </main>
      </div>
    </div>
  );
}
