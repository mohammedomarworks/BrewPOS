"use client";

import React from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import { formatCurrency } from "@/lib/reports";
import type { CustomerAnalyticsSummary } from "@/lib/reports";

interface CustomerAnalyticsCardProps {
  analytics: CustomerAnalyticsSummary;
}

export default function CustomerAnalyticsCard({
  analytics,
}: CustomerAnalyticsCardProps) {
  const {
    totalCustomersServed,
    registeredCustomersCount,
    walkInOrdersCount,
    topCustomers,
  } = analytics;

  return (
    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2b1b12]">Customer Analytics</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Patron loyalty and top contributors to sales
          </p>
        </div>
      </div>

      {/* Highlights: Registered vs Walk-in */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2e6dc] text-[#8a4f28]">
            <Users size={16} />
          </div>
          <div>
            <p className="text-[11px] text-[#8c7a6c]">Unique Patrons</p>
            <p className="text-base font-bold text-[#2b1b12]">
              {totalCustomersServed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3f7a4e]">
            <UserCheck size={16} />
          </div>
          <div>
            <p className="text-[11px] text-[#8c7a6c]">Registered Orders</p>
            <p className="text-base font-bold text-[#2b1b12]">
              {registeredCustomersCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#f0e8df] bg-[#faf7f3] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf2f7] text-[#3b6088]">
            <UserX size={16} />
          </div>
          <div>
            <p className="text-[11px] text-[#8c7a6c]">Walk-in Checkouts</p>
            <p className="text-base font-bold text-[#2b1b12]">
              {walkInOrdersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8c7a6c]">
          Top Customers by Spending
        </h4>

        {topCustomers.length === 0 ? (
          <p className="mt-3 text-xs text-[#a39284]">
            No customer order history in this period.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f0e8df] text-[#8c7a6c]">
                  <th className="pb-2.5 pl-1 font-semibold">Customer</th>
                  <th className="pb-2.5 text-center font-semibold">Orders</th>
                  <th className="pb-2.5 text-right font-semibold">Total Spent</th>
                  <th className="pb-2.5 pr-1 text-right font-semibold">
                    Average Order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe9]">
                {topCustomers.slice(0, 5).map((c, idx) => (
                  <tr key={idx} className="transition hover:bg-[#faf7f3]">
                    <td className="py-2.5 pl-1 font-medium text-[#2b1b12]">
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.isRegistered && (
                          <span className="rounded-full bg-[#edf6ee] px-1.5 py-0.5 text-[9px] font-semibold text-[#3f7a4e]">
                            Member
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-[#6d5b4e]">
                      {c.orders}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#2b1b12]">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-2.5 pr-1 text-right text-[#8c7a6c]">
                      {formatCurrency(c.averageOrder)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
