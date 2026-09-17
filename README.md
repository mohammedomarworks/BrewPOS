# BrewPOS — Coffee Shop POS & Management System

BrewPOS is a modern, high-performance Point of Sale (POS) and Coffee Shop Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide React**. Designed for specialty artisanal coffee shops, it delivers lightning-fast order processing, synchronized inventory tracking, customer loyalty analytics, and complete administrative control.

---

## 🌟 Modules & Features

### 1. 📊 Executive Dashboard (`/`)
- Real-time revenue metrics, daily sales totals, and transaction counts.
- Dynamic comparison vs. yesterday (sales trend %, orders %, average order value %).
- Interactive sales overview charts and top-selling product spotlights.

### 2. ☕ Point of Sale (`/pos`)
- Responsive three-pane terminal (Category Sidebar, Product Grid, Order Cart).
- Dine In, Take Away, and Delivery order routing.
- Quick customer lookup and inline new-customer registration.
- Dynamic coupon code & promotion validation with automated savings computation.
- Financial calculation engine enforcing statutory 15% VAT and subtotal precision.
- Multi-channel tender simulation (Cash with change calculator, Card with terminal simulation, Mobile Wallets like bKash/Nagad).
- Modal receipt preview and thermal receipt printing layout (`window.print()`).

### 3. 📋 Order Management (`/orders`)
- Comprehensive order ledger with search and filtering by order status, date range, payment method, and order type.
- Order Details Modal with itemized breakdown, tax/discount calculation, and thermal receipt reproduction.
- Live order status workflow transitions (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Completed` / `Cancelled`).

### 4. 🏷️ Menu & Category Management (`/menu`)
- Full CRUD for products with automated SKU generation and unique SKU validation.
- Category management with product foreign-key safeguards preventing accidental deletions.
- Instant availability toggling and popular/new product badges.

### 5. 👥 Customer Profiles & CRM (`/customers`)
- Customer directory with loyalty spending metrics, visit counts, and lifetime value.
- Duplicate customer prevention on phone numbers and email addresses.
- Customer Details Drawer showing complete transaction history and per-customer receipts.
- Safe deletion protection preventing deletion of customers with existing order history.

### 6. 📦 Inventory & Bill of Materials (BOM) Recipes (`/inventory`)
- Real-time raw material tracking across weights (g, kg), liquids (ml, L), and units (pcs).
- Threshold tracking (`Healthy`, `Low Stock`, `Out of Stock`) with visual alerts.
- Automated Bill of Materials (BOM) recipe engine linking raw ingredients to menu items.
- **Automatic inventory deduction**: Completing orders automatically deducts ingredients and logs detailed consumption audit records.
- Manual adjustments (Wastage, Spills, Physical Counts) and supplier stock receiving workflows.

### 7. 🏷️ Discounts & Promotions (`/discounts`)
- Percentage discounts and fixed-amount discounts.
- Flexible targeting: Entire Order, Specific Products, or Specific Categories.
- Minimum order spend rules and maximum redemption counters.
- Promotion validity date ranges (Active, Scheduled, Expired, Inactive).

### 8. 📈 Sales Reports & Analytics (`/reports`)
- Date range filtering (Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Custom).
- Interactive KPI cards for gross sales, net sales, VAT collected, discount given, and average order value.
- Revenue trends, hourly distribution, payment method breakdown, order type analytics, top-selling items, and category performance.
- One-click CSV export and print-ready executive summary view.

### 9. ⚙️ Admin Settings & RBAC (`/settings`)
- Business profile configuration (Store name, tagline, address, BIN/VAT number, receipts footer).
- Tax & Currency settings: dynamic currency symbol (`৳`, `$`, `€`, `£`, etc.) and configurable statutory VAT rate (default 15%).
- POS & Receipt preferences (default order types, payment gateways, receipt header toggles).
- User & Role Management with Role-Based Access Control (Admin, Manager, Cashier, Staff).
- Full administrative audit log recording system and business parameter updates.

---

## 🏗️ Architecture & Shared Data Architecture

- **Hydration-Safe Client Stores**: Built using React's `useSyncExternalStore` ensuring zero hydration mismatches between SSR and client renders.
- **Multi-Tab Synchronization**: Reactive broadcast events (`brewpos:*-updated`) and native `storage` event listeners keep tabs in sync without manual refreshes.
- **Money Precision**: All currency calculations are executed in cents/paise and formatted via `Math.round(value * 100) / 100` to prevent floating-point inaccuracy.
- **Zero Hardcoded Currency**: Every price tag, modal, invoice, and report card dynamically pulls the active currency symbol from the central settings store.
- **Graceful Loading & Empty States**: Warm cream/espresso `SkeletonTable` components display during hydration, avoiding jarring flashes.
- **Accessible & Keyboard Friendly**: Modal dialogs feature proper ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) and global `Escape` key dismissal.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/mohammedomarworks/BrewPOS.git
cd brewpos

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Assurance & Build Commands

```bash
# Type-check TypeScript codebase
npx tsc --noEmit

# Lint for syntax and style standards
npm run lint

# Production compilation
npm run build
```

---

## ☕ Technologies

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Storage**: React 19 `useSyncExternalStore` + `localStorage`
