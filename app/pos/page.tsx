"use client";

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
} from "lucide-react";
import { useMemo, useState } from "react";

const categories = [
  "All Items",
  "Hot Coffee",
  "Cold Coffee",
  "Tea",
  "Bakery",
  "Desserts",
];

import { products } from "@/data/products";
import type { Product } from "@/data/products";
import CheckoutModal from "@/components/pos/CheckoutModal";
import type { CartItem, OrderType, CompletedOrder } from "@/types/pos";

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("Take Away");
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderCounter, setOrderCounter] = useState(1);
  const [, setCompletedOrders] = useState<CompletedOrder[]>([]);

  const currentOrderNumber = useMemo(() => {
    return `COF-2026-${String(orderCounter).padStart(5, "0")}`;
  }, [orderCounter]);

  const handleCompleteOrder = (order: CompletedOrder) => {
    setCompletedOrders((prev) => [order, ...prev]);
    setOrderCounter((prev) => prev + 1);
  };

  const handleNewOrder = () => {
    setCart([]);
    setDiscountPercent(0);
    setOrderType("Take Away");
    setCustomer("Walk-in Customer");
    setIsCheckoutOpen(false);
  };
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
  }, [selectedCategory, search]);

  const addToCart = (product: Product) => {
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

  const discount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discount;
  const vat = taxableAmount * 0.15;
  const total = taxableAmount + vat;

  return (
    <div className="min-h-screen bg-[#f7f3ed] p-5 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#c98b5b]">BrewPOS</p>

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
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group rounded-2xl border border-[#e8dfd4] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#d2b49b] hover:shadow-[0_8px_24px_rgba(72,48,32,0.07)]"
                >
                  <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-[#efe2d5] text-4xl">
                    ☕
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-[#c98b5b]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 font-semibold text-[#2b1b12]">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-[#6d4730]">
                        ৳{product.price.toFixed(2)}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4ece4] text-[#6d4730] transition group-hover:bg-[#c98b5b] group-hover:text-white">
                        <Plus size={17} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
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

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Dine In",
                    icon: Store,
                  },
                  {
                    label: "Take Away",
                    icon: ShoppingBag,
                  },
                  {
                    label: "Delivery",
                    icon: Truck,
                  },
                ].map((type) => {
                  const Icon = type.icon;

                  return (
                    <button
                      key={type.label}
                      onClick={() =>
                        setOrderType(
                          type.label as "Dine In" | "Take Away" | "Delivery",
                        )
                      }
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
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                  Customer
                </p>

                <UserRound size={16} className="text-[#9b897b]" />
              </div>

              <select
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-sm text-[#2b1b12] outline-none focus:border-[#c98b5b]"
              >
                <option>Walk-in Customer</option>
                <option>Mohammed Omar</option>
                <option>Shihab Hossain</option>
                <option>Tamim Mahdi</option>
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
                            ৳{item.price.toFixed(2)} each
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
                          ৳{(item.price * item.quantity).toFixed(2)}
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
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                      Discount
                    </p>

                    <Percent size={15} className="text-[#9b897b]" />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5, 10, 15].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => setDiscountPercent(percent)}
                        className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                          discountPercent === percent
                            ? "bg-[#c98b5b] text-white"
                            : "bg-[#f4ece4] text-[#6d4730] hover:bg-[#ead8c7]"
                        }`}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-[#66574d]">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>Discount</span>
                  <span>৳{discount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>VAT (15%)</span>
                  <span>৳{vat.toFixed(2)}</span>
                </div>

                <div className="my-3 border-t border-dashed border-[#ddd0c4]" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2b1b12]">Total</span>

                  <span className="text-xl font-bold text-[#6d4730]">
                    ৳{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="mt-5 w-full rounded-xl bg-[#2b1b12] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#40291d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Proceed to Checkout
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
          discountPercent={discountPercent}
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
    </div>
  );
}
