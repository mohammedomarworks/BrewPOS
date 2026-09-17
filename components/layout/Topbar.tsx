"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useUsersStore } from "@/lib/user-store";
import { useSettingsStore } from "@/lib/settings-store";
import { menuItems } from "@/components/layout/Sidebar";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({
  title = "Dashboard",
  subtitle = "Welcome back to BrewPOS",
}: TopbarProps) {
  const pathname = usePathname();
  const { activeUser } = useUsersStore();
  const { settings } = useSettingsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formattedDate = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date());
      } catch {
        return "September 16, 2026";
      }
    },
    () => "September 16, 2026"
  );

  const isItemActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="flex h-20 items-center justify-between border-b border-[#e8dfd4] bg-white px-4 md:px-8">
        {/* Left: Hamburger (mobile) & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#66574d] hover:bg-[#faf7f3] lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-[#2b1b12]">{title}</h1>
            <p className="mt-0.5 text-xs text-[#8c7a6c] md:text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
            />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              className="h-10 w-44 md:w-60 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-sm text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
            />
          </div>

          {/* Date */}
          <button
            type="button"
            aria-label="Current date"
            className="hidden items-center gap-2 rounded-xl border border-[#e5dbd0] px-3 py-2.5 text-sm text-[#66574d] transition hover:bg-[#faf7f3] md:flex"
          >
            <CalendarDays size={17} />
            <span>{formattedDate}</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dbd0] text-[#66574d] transition hover:bg-[#faf7f3]"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c98b5b]" />
          </button>

          {/* Profile */}
          <Link
            href="/settings"
            aria-label={`User profile for ${activeUser?.name || "Admin"}`}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#faf7f3]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c98b5b] text-sm font-semibold text-white shadow-sm">
              {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-[#2b1b12] leading-tight">
                {activeUser?.name || "Admin"}
              </p>
              <p className="text-xs text-[#9b897b] leading-tight">
                {activeUser?.role || "Administrator"}
              </p>
            </div>

            <ChevronDown size={15} className="hidden text-[#8c7a6c] sm:block" />
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="relative flex w-4/5 max-w-xs flex-col bg-[#2b1b12] text-white shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <h2 className="text-xl font-bold tracking-wide text-white">
                  {settings.business.name || "BrewPOS"}
                </h2>
                <p className="text-xs text-[#cbb8a8]">
                  {settings.business.tagline || "Coffee Shop Management"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-[#d5c7bb] hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9e8979]">
                Menu
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-[#c98b5b] text-white"
                        : "text-[#d5c7bb] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    pathname.startsWith("/settings")
                      ? "bg-[#c98b5b] text-white"
                      : "text-[#d5c7bb] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </div>
            </nav>

            {/* Active User Footer */}
            <div className="border-t border-white/10 p-4">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-[#9e8979]">Logged in as</p>
                <p className="mt-0.5 text-sm font-medium text-white truncate">
                  {activeUser?.name || "Admin"} ({activeUser?.role || "Staff"})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
