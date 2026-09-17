"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Coffee,
  Users,
  Package,
  Tag,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "POS",
    icon: ShoppingCart,
    href: "/pos",
  },
  {
    label: "Orders",
    icon: ClipboardList,
    href: "/orders",
  },
  {
    label: "Menu",
    icon: Coffee,
    href: "/menu",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/inventory",
  },
  {
    label: "Discounts",
    icon: Tag,
  },
  {
    label: "Reports",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isItemActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[#e8dfd4] bg-[#2b1b12] text-white lg:flex">
      {/* Brand */}
      <div className="border-b border-white/10 px-6 py-6">
        <div className="text-2xl font-bold tracking-wide">BrewPOS</div>
        <p className="mt-1 text-xs text-[#cbb8a8]">
          Coffee Shop Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9e8979]">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            const className = `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              active
                ? "bg-[#c98b5b] text-white font-medium"
                : "text-[#d5c7bb] hover:bg-white/5 hover:text-white"
            }`;

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className={className}>
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                className={className}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="border-t border-white/10 px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#d5c7bb] transition hover:bg-white/5 hover:text-white">
          <Settings size={19} strokeWidth={1.8} />
          <span>Settings</span>
          <ChevronDown size={15} className="ml-auto" />
        </button>

        <div className="mt-4 rounded-xl bg-white/5 p-3">
          <p className="text-xs text-[#9e8979]">Logged in as</p>
          <p className="mt-1 text-sm font-medium">Admin</p>
        </div>
      </div>
    </aside>
  );
}