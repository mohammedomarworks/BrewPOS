"use client";

import { Search, Bell, ChevronDown, CalendarDays } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-[#e8dfd4] bg-white px-5 md:px-8">
      {" "}
      {/* Left */}
      <div>
        <h1 className="text-xl font-semibold text-[#2b1b12]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#8c7a6c]">Welcome back to BrewPOS</p>
      </div>
      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
          />

          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-60 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
          />
        </div>

        {/* Date */}
        <button className="hidden items-center gap-2 rounded-xl border border-[#e5dbd0] px-3 py-2.5 text-sm text-[#66574d] transition hover:bg-[#faf7f3] md:flex">
          <CalendarDays size={17} />
          <span>September 16, 2026</span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#66574d] transition hover:bg-[#faf7f3]">
          <Bell size={18} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c98b5b]" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#faf7f3]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c98b5b] text-sm font-semibold text-white">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-[#2b1b12]">Admin</p>
            <p className="text-xs text-[#9b897b]">Administrator</p>
          </div>

          <ChevronDown size={16} className="text-[#8c7a6c]" />
        </button>
      </div>
    </header>
  );
}
