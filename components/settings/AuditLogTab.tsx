"use client";

import React, { useState } from "react";
import { History, Search, Trash2, Clock } from "lucide-react";
import { useAuditStore } from "@/lib/audit-store";

export default function AuditLogTab() {
  const { logs, clearAuditLogs } = useAuditStore();
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the audit history log?")) {
      clearAuditLogs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2b1b12]">Activity & Audit Trail</h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Chronological record of administrative operations, policy changes, and user adjustments.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-[#e5dbd0] bg-white px-3 py-2 text-xs font-semibold text-[#c23b3b] hover:bg-[#fbeaea]"
          >
            <Trash2 size={13} />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b897b]"
        />
        <input
          type="text"
          placeholder="Filter audit events by actor, action, or target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
        />
      </div>

      {/* Audit Log Timeline Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
        {filteredLogs.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center text-center p-6">
            <History size={28} className="text-[#cbb8a8]" />
            <p className="mt-2 text-xs font-medium text-[#8c7a6c]">
              No audit log entries found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f0e8df] bg-[#faf7f3] text-[#8c7a6c]">
                  <th className="py-3.5 pl-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 font-semibold">Actor</th>
                  <th className="py-3.5 font-semibold">Action</th>
                  <th className="py-3.5 font-semibold">Target</th>
                  <th className="py-3.5 pr-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe9]">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-[#faf7f3]">
                    <td className="py-3.5 pl-4 text-[#8c7a6c] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock size={12} className="text-[#c98b5b]" />
                        <span>
                          {new Date(entry.timestamp).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-medium text-[#2b1b12]">
                      {entry.actor}
                    </td>

                    <td className="py-3.5">
                      <span className="rounded-md bg-[#faf7f3] border border-[#f0e8df] px-2 py-0.5 text-[11px] font-semibold text-[#6d5b4e]">
                        {entry.action}
                      </span>
                    </td>

                    <td className="py-3.5 font-semibold text-[#2b1b12]">
                      {entry.target}
                    </td>

                    <td className="py-3.5 pr-4 text-[#8c7a6c] max-w-xs truncate">
                      {entry.details}
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
