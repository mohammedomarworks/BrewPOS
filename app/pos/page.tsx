"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Store,
  ShoppingBag,
  Truck,
  UserRound,
  Percent,
  ClipboardList,
  LayoutDashboard,
  Coffee,
  Users,
  Boxes,
  AlertTriangle,
  Tag,
  Banknote,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { Product } from "@/data/products";
import CheckoutModal from "@/components/pos/CheckoutModal";
import QuickCustomerModal from "@/components/pos/QuickCustomerModal";
import type { CartItem, OrderType } from "@/types/pos";
import type { Discount } from "@/types/discount";
import { getNextOrderNumber } from "@/lib/orders";
import { useProductsStore, useCategoriesStore } from "@/lib/products";
import { useCustomersStore } from "@/lib/customers";
import { useInventoryStore } from "@/lib/inventory-store";
import { checkProductStock, checkCartStock } from "@/lib/recipes";
import {
  useDiscountsStore,
  calculateDiscount,
  getDiscountStatus,
} from "@/lib/discounts";
import { useSettingsStore } from "@/lib/settings-store";

export default function POSPage() {
  const { settings } = useSettingsStore();
  const sym = settings.taxCurrency.currencySymbol;
  const vatRate = settings.taxCurrency.vatRate;

  const { products } = useProductsStore();
  const { categories: categoryList } = useCategoriesStore();
  const { customers, addCustomer } = useCustomersStore();
  const { ingredients } = useInventoryStore();
  const { discounts } = useDiscountsStore();

  const [currentTime] = useState(() => Date.now());

  const categories = useMemo(() => {
    const activeList = categoryList.filter((c) => c.active).map((c) => c.name);
    return ["All Items", ...activeList];
  }, [categoryList]);

  const activeCustomers = useMemo(() => {
    return customers.filter((c) => c.status === "Active");
  }, [customers]);

  // Available order types based on admin settings
  const availableOrderTypes = useMemo(() => {
    const types: { label: OrderType; icon: typeof Store }[] = [];
    if (settings.pos.enableDineIn) types.push({ label: "Dine In", icon: Store });
    if (settings.pos.enableTakeAway) types.push({ label: "Take Away", icon: ShoppingBag });
    if (settings.pos.enableDelivery) types.push({ label: "Delivery", icon: Truck });
    return types.length > 0
      ? types
      : [{ label: "Take Away" as OrderType, icon: ShoppingBag }];
  }, [settings.pos]);

  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(() => {
    return (settings.pos.defaultOrderType as OrderType) || "Take Away";
  });
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [customer, setCustomer] = useState("Walk-in Customer");

  // Dynamic Discount State
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState(() =>
    getNextOrderNumber(settings.orders.orderPrefix)
  );

  const cartStock = useMemo(
    () => checkCartStock(cart, ingredients),
    [cart, ingredients]
  );

  const handleOpenCheckout = () => {
    if (!cartStock.canFulfill) return;
    setCurrentOrderNumber(getNextOrderNumber(settings.orders.orderPrefix));
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = () => {
    setCurrentOrderNumber(getNextOrderNumber(settings.orders.orderPrefix));
  };

  const handleNewOrder = () => {
    setCart([]);
    setAppliedDiscount(null);
    setCouponInput("");
    setCouponError(null);
    setShowOffers(false);
    setOrderType((settings.pos.defaultOrderType as OrderType) || "Take Away");
    setCustomerId(undefined);
    setCustomer("Walk-in Customer");
    setIsCheckoutOpen(false);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (codeToApply || couponInput).trim();
    if (!targetCode) return;
    const found = discounts.find(
      (d) => d.code.toUpperCase() === targetCode.toUpperCase()
    );
    if (!found) {
      setCouponError(`Coupon "${targetCode.toUpperCase()}" not found.`);
      return;
    }
    const res = calculateDiscount(cart, found, customerId, currentTime, vatRate);
    if (!res.valid) {
      setCouponError(res.reason || "This coupon cannot be applied.");
      return;
    }
    setAppliedDiscount(found);
    setCouponInput("");
    setCouponError(null);
    setShowOffers(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setCouponError(null);
  };

  const activeOffers = useMemo(() => {
    return discounts.filter(
      (d) => getDiscountStatus(d, currentTime) === "Active"
    );
  }, [discounts, currentTime]);
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All Items" ||
        product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const addToCart = (product: Product) => {
    const stockCheck = checkProductStock(product.id, 1, ingredients);
    if (product.available === false || !stockCheck.canFulfill) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: number) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const discountResult = useMemo(
    () => calculateDiscount(cart, appliedDiscount, customerId, currentTime, vatRate),
    [cart, appliedDiscount, customerId, currentTime, vatRate]
  );

  const discount = discountResult.discountAmount;
  const taxableAmount = discountResult.taxableAmount;
  const vat = discountResult.vat;
  const total = discountResult.total;
  const discountPercent =
    appliedDiscount?.type === "Percentage"
      ? appliedDiscount.value
      : subtotal > 0
      ? Math.round((discount / subtotal) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f7f3ed] p-5 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>
              <span className="text-xs text-[#b8a798]">&bull;</span>
              <div className="flex items-center gap-1.5 text-xs text-[#8c7a6c]">
                <Link
                  href="/"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <LayoutDashboard size={13} />
                  Dashboard
                </Link>
                <span className="text-[#cbb8a8]">/</span>
                <Link
                  href="/menu"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <Coffee size={13} />
                  Menu
                </Link>
                <span className="text-[#cbb8a8]">/</span>
                <Link
                  href="/orders"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <ClipboardList size={13} />
                  Orders
                </Link>
                <span className="text-[#cbb8a8]">/</span>
                <Link
                  href="/customers"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <Users size={13} />
                  Customers
                </Link>
                <span className="text-[#cbb8a8]">/</span>
                <Link
                  href="/inventory"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <Boxes size={13} />
                  Inventory
                </Link>
                <span className="text-[#cbb8a8]">/</span>
                <Link
                  href="/discounts"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                >
                  <Tag size={13} />
                  Discounts
                </Link>
              </div>
            </div>

            <h1 className="mt-1 text-2xl font-semibold text-[#2b1b12]">
              Point of Sale
            </h1>

            <p className="mt-1 text-sm text-[#8c7a6c]">
              Create and process customer orders.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b897b]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-[#e5dbd0] bg-white pl-10 pr-4 text-sm text-[#2b1b12] outline-none placeholder:text-[#a99a8e] focus:border-[#c98b5b]"
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_390px]">
          {/* Categories */}
          <aside className="rounded-2xl border border-[#e8dfd4] bg-white p-4">
            <h2 className="mb-4 px-2 text-sm font-semibold text-[#2b1b12]">
              Categories
            </h2>

            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                    selectedCategory === category
                      ? "bg-[#2b1b12] text-white"
                      : "text-[#66574d] hover:bg-[#faf7f3]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          {/* Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2b1b12]">
                  Products
                </h2>

                <p className="text-sm text-[#8c7a6c]">
                  {filteredProducts.length} items available
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const stockCheck = checkProductStock(product.id, 1, ingredients);
                const isAvailable = product.available !== false && stockCheck.canFulfill;

                return (
                  <button
                    key={product.id}
                    disabled={!isAvailable}
                    onClick={() => addToCart(product)}
                    className={`group rounded-2xl border border-[#e8dfd4] bg-white p-4 text-left transition ${
                      isAvailable
                        ? "hover:-translate-y-0.5 hover:border-[#d2b49b] hover:shadow-[0_8px_24px_rgba(72,48,32,0.07)] cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {settings.pos.showProductImages && (
                      <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl bg-[#efe2d5] text-4xl">
                        {product.image || "☕"}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/55 p-2 text-center text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[1px]">
                            <span>
                              {product.available === false
                                ? "Unavailable"
                                : "Out of Stock"}
                            </span>
                            {product.available !== false && !stockCheck.canFulfill && stockCheck.missingIngredients[0] && (
                              <span className="mt-1 text-[10px] font-normal lowercase tracking-normal text-amber-200">
                                Low {stockCheck.missingIngredients[0].ingredientName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={settings.pos.showProductImages ? "mt-4" : "mt-1"}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#c98b5b]">
                          {product.category}
                        </p>
                        {product.popular && (
                          <span className="text-[10px] font-semibold text-amber-600">
                            ⭐ Popular
                          </span>
                        )}
                        {product.isNew && (
                          <span className="text-[10px] font-semibold text-blue-600">
                            🏷️ New
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 font-semibold text-[#2b1b12]">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-[#6d4730]">
                          {sym}{product.price.toFixed(2)}
                        </span>

                        {isAvailable ? (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730] transition group-hover:bg-[#c98b5b] group-hover:text-white">
                            <Plus size={17} />
                          </span>
                        ) : product.available === false ? (
                          <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                            Unavailable
                          </span>
                        ) : (
                          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d8cabc] bg-white p-12 text-center">
                <p className="font-medium text-[#2b1b12]">No products found</p>

                <p className="mt-1 text-sm text-[#8c7a6c]">
                  Try another category or search term.
                </p>
              </div>
            )}
          </section>

          {/* Cart */}
          <aside className="flex min-h-[600px] flex-col rounded-2xl border border-[#e8dfd4] bg-white p-5">
            <div className="mb-5 border-b border-[#eee5dc] pb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                Order Type
              </p>

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(1, availableOrderTypes.length)}, minmax(0, 1fr))`,
                }}
              >
                {availableOrderTypes.map((type) => {
                  const Icon = type.icon;

                  return (
                    <button
                      key={type.label}
                      onClick={() => setOrderType(type.label)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition ${
                        orderType === type.label
                          ? "bg-[#2b1b12] text-white"
                          : "border border-[#e5dbd0] bg-white text-[#66574d] hover:bg-[#faf7f3]"
                      }`}
                    >
                      <Icon size={17} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mb-5 border-b border-[#eee5dc] pb-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserRound size={15} className="text-[#9b897b]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                    Customer
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-[#e5dbd0] bg-white px-2 py-1 text-[11px] font-semibold text-[#c98b5b] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
                >
                  <Plus size={12} />
                  <span>New Customer</span>
                </button>
              </div>

              <select
                value={customerId || ""}
                onChange={(event) => {
                  const val = event.target.value;
                  if (!val) {
                    setCustomerId(undefined);
                    setCustomer("Walk-in Customer");
                  } else {
                    const found = activeCustomers.find((c) => c.id === val);
                    if (found) {
                      setCustomerId(found.id);
                      setCustomer(found.name);
                    }
                  }
                }}
                className="h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none focus:border-[#c98b5b] cursor-pointer"
              >
                <option value="">Walk-in Customer</option>
                {activeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-[#eee5dc] pb-4">
              <div>
                <h2 className="font-semibold text-[#2b1b12]">Current Order</h2>

                <p className="mt-1 text-xs text-[#8c7a6c]">
                  {orderType} · {customer}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730]">
                <ShoppingCart size={18} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {cart.length === 0 ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9f8068]">
                    <ShoppingCart size={24} />
                  </div>

                  <p className="mt-4 font-medium text-[#2b1b12]">
                    Your cart is empty
                  </p>

                  <p className="mt-1 max-w-[220px] text-sm text-[#8c7a6c]">
                    Select products from the menu to start an order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-xl bg-[#faf7f3] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#2b1b12]">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[#8c7a6c]">
                            {sym}{item.price.toFixed(2)} each
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#a39284] transition hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ddd0c4] bg-white text-[#66574d]"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-5 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ddd0c4] bg-white text-[#66574d]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#6d4730]">
                          {sym}{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-[#eee5dc] pt-4">
              <div className="space-y-2 text-sm">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-[#9b897b]" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                        Discounts & Offers
                      </p>
                    </div>
                    {!appliedDiscount && activeOffers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowOffers(!showOffers)}
                        className="text-[11px] font-semibold text-[#c98b5b] hover:underline"
                      >
                        {showOffers ? "Hide Offers" : `Offers (${activeOffers.length})`}
                      </button>
                    )}
                  </div>

                  {appliedDiscount ? (
                    <div className="rounded-xl border border-[#c98b5b]/40 bg-[#fbf5ee] p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b1b12] text-white">
                            {appliedDiscount.type === "Percentage" ? (
                              <Percent size={13} />
                            ) : (
                              <Banknote size={13} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-[#2b1b12]">
                                {appliedDiscount.code}
                              </span>
                              <span className="rounded bg-[#efe2d5] px-1.5 py-0.2 text-[10px] font-bold text-[#6d4730]">
                                {appliedDiscount.type === "Percentage"
                                  ? `${appliedDiscount.value}% OFF`
                                  : `${sym}${appliedDiscount.value} Flat`}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8c7a6c] line-clamp-1">
                              {appliedDiscount.name}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDiscount}
                          title="Remove discount"
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-[#e5dbd0] bg-white text-[#8c7a6c] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            if (couponError) setCouponError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter coupon code..."
                          className="h-9 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 font-mono text-xs uppercase text-[#2b1b12] outline-none placeholder:font-sans placeholder:normal-case focus:border-[#c98b5b] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={!couponInput.trim()}
                          className="rounded-xl bg-[#2b1b12] px-3.5 text-xs font-semibold text-white transition hover:bg-[#40291d] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] font-medium text-red-600">
                          {couponError}
                        </p>
                      )}

                      {showOffers && (
                        <div className="mt-2 max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-[#eee5dc] bg-[#faf7f3] p-2 text-xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b897b]">
                            Active Promotions
                          </p>
                          {activeOffers.map((o) => (
                            <div
                              key={o.id}
                              onClick={() => handleApplyCoupon(o.code)}
                              className="flex items-center justify-between rounded-lg border border-[#e5dbd0] bg-white p-2 transition cursor-pointer hover:border-[#c98b5b] hover:bg-[#faf7f3]"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-[#6d4730]">
                                    {o.code}
                                  </span>
                                  <span className="text-[10px] font-semibold text-amber-700">
                                    {o.type === "Percentage"
                                      ? `${o.value}% OFF`
                                      : `${sym}${o.value} OFF`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#8c7a6c] line-clamp-1">
                                  {o.name}
                                  {o.minimumOrderAmount
                                    ? ` • Min ${sym}${o.minimumOrderAmount}`
                                    : ""}
                                </p>
                              </div>
                              <span className="rounded bg-[#f4ece4] px-1.5 py-0.5 text-[10px] font-bold text-[#6d4730]">
                                Apply
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-[#66574d]">
                  <span>Subtotal</span>
                  <span>{sym}{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>Discount</span>
                  <span>{sym}{discount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>VAT ({vatRate}%)</span>
                  <span>{sym}{vat.toFixed(2)}</span>
                </div>

                <div className="my-3 border-t border-dashed border-[#ddd0c4]" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2b1b12]">Total</span>

                  <span className="text-xl font-bold text-[#6d4730]">
                    {sym}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cart Stock Warning */}
              {cart.length > 0 && !cartStock.canFulfill && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                  <div className="flex items-center gap-1.5 font-semibold text-red-900">
                    <AlertTriangle size={14} />
                    <span>Insufficient Ingredient Stock</span>
                  </div>
                  <p className="mt-1 text-[11px] text-red-700">
                    Some items in your cart exceed available inventory. Adjust quantities before checking out.
                  </p>
                </div>
              )}

              <button
                disabled={cart.length === 0 || !cartStock.canFulfill}
                onClick={handleOpenCheckout}
                className="mt-5 w-full rounded-xl bg-[#2b1b12] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#40291d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {!cartStock.canFulfill && cart.length > 0
                  ? "Stock Insufficient for Cart"
                  : "Proceed to Checkout"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          orderType={orderType}
          customer={customer}
          customerId={customerId}
          discountPercent={discountPercent}
          appliedDiscount={appliedDiscount || undefined}
          subtotal={subtotal}
          discount={discount}
          taxableAmount={taxableAmount}
          vat={vat}
          total={total}
          orderNumber={currentOrderNumber}
          onCompleteOrder={handleCompleteOrder}
          onNewOrder={handleNewOrder}
        />
      )}

      {/* Quick Add Customer Modal */}
      {isQuickCustomerOpen && (
        <QuickCustomerModal
          isOpen={isQuickCustomerOpen}
          onClose={() => setIsQuickCustomerOpen(false)}
          onSaveCustomer={addCustomer}
          onCustomerCreated={(newCust) => {
            setCustomerId(newCust.id);
            setCustomer(newCust.name);
          }}
        />
      )}
    </div>
  );
}
