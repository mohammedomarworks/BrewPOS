"use client";

import { useState, useMemo } from "react";
import {
  X,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Printer,
  PlusCircle,
  AlertCircle,
  Copy,
  Check,
  Store,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ReceiptText,
} from "lucide-react";
import type { CartItem, OrderType, PaymentMethod, CompletedOrder } from "@/types/pos";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: OrderType;
  customer: string;
  discountPercent: number;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vat: number;
  total: number;
  onCompleteOrder: (order: CompletedOrder) => void;
  onNewOrder: () => void;
  orderNumber: string;
}

function renderOrderIcon(type: OrderType) {
  switch (type) {
    case "Dine In":
      return <Store size={20} />;
    case "Take Away":
      return <ShoppingBag size={20} />;
    case "Delivery":
      return <Truck size={20} />;
    default:
      return <ShoppingBag size={20} />;
  }
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  orderType,
  customer,
  discountPercent,
  subtotal,
  discount,
  taxableAmount,
  vat,
  total,
  onCompleteOrder,
  onNewOrder,
  orderNumber,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [mobileProvider, setMobileProvider] = useState<string>("bKash");
  const [mobileRef, setMobileRef] = useState<string>(() => {
    return `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [copiedOrderNo, setCopiedOrderNo] = useState<boolean>(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);

  // Cash calculation
  const numericReceived = parseFloat(amountReceived) || 0;
  const isCashSufficient = numericReceived >= total;
  const cashChange = isCashSufficient ? numericReceived - total : 0;
  const remainingCashNeeded = total - numericReceived;

  // Smart quick-tender denominations
  const quickTenders = useMemo(() => {
    const exact = total;
    const baseDenominations = [100, 200, 500, 1000, 2000];
    const suggestions: number[] = [exact];

    const nextHundred = Math.ceil(total / 100) * 100;
    if (nextHundred > total && !suggestions.includes(nextHundred)) {
      suggestions.push(nextHundred);
    }

    baseDenominations.forEach((denom) => {
      if (denom > total && !suggestions.includes(denom)) {
        suggestions.push(denom);
      }
    });

    return suggestions.slice(0, 4);
  }, [total]);

  if (!isOpen) return null;

  const handleCopyOrderNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderNo(true);
    setTimeout(() => setCopiedOrderNo(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "cash" && !isCashSufficient) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const order: CompletedOrder = {
        orderNumber,
        items: [...cart],
        subtotal,
        discountPercent,
        discount,
        taxableAmount,
        vat,
        total,
        customer,
        orderType,
        payment: {
          method: paymentMethod,
          amountReceived: paymentMethod === "cash" ? numericReceived : total,
          change: paymentMethod === "cash" ? cashChange : 0,
          transactionRef:
            paymentMethod === "mobile"
              ? `${mobileProvider}: ${mobileRef || "N/A"}`
              : undefined,
          cardLast4: paymentMethod === "card" ? "4242" : undefined,
        },
        createdAt: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      setCompletedOrder(order);
      onCompleteOrder(order);
      setIsProcessing(false);
      setStep("success");
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity print:bg-white print:p-0">
      {/* Print receipt container (hidden on screen, visible during window.print) */}
      {completedOrder && (
        <div className="hidden print:block print:w-full print:max-w-xs print:p-4 print:font-mono print:text-xs print:text-black">
          <div className="text-center">
            <h1 className="text-lg font-bold">BrewPOS Coffee Shop</h1>
            <p className="text-[10px] text-gray-500">Premium Artisanal Coffee</p>
            <p className="text-[10px] text-gray-500">Dhanmondi, Dhaka</p>
            <div className="my-2 border-b border-dashed border-gray-400" />
            <p className="font-semibold">ORDER #{completedOrder.orderNumber}</p>
            <p className="text-[10px]">{completedOrder.createdAt}</p>
            <p className="text-[10px]">
              Type: {completedOrder.orderType} | Customer: {completedOrder.customer}
            </p>
            <div className="my-2 border-b border-dashed border-gray-400" />
          </div>

          <div className="space-y-1">
            {completedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>৳{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="my-2 border-b border-dashed border-gray-400" />

          <div className="space-y-0.5 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>৳{completedOrder.subtotal.toFixed(2)}</span>
            </div>
            {completedOrder.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount ({completedOrder.discountPercent}%):</span>
                <span>-৳{completedOrder.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT (15%):</span>
              <span>৳{completedOrder.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>৳{completedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-2 border-b border-dashed border-gray-400" />

          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="uppercase">{completedOrder.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>৳{completedOrder.payment.amountReceived.toFixed(2)}</span>
            </div>
            {completedOrder.payment.method === "cash" && (
              <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span>৳{completedOrder.payment.change.toFixed(2)}</span>
              </div>
            )}
            {completedOrder.payment.transactionRef && (
              <div className="flex justify-between">
                <span>Ref:</span>
                <span>{completedOrder.payment.transactionRef}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-[10px] text-gray-500">
            <p>Thank you for choosing BrewPOS!</p>
            <p>Please come again.</p>
          </div>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white shadow-2xl transition-all print:hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#eee5dc] bg-[#faf7f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1b12] text-white">
              {renderOrderIcon(orderType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#2b1b12]">
                  {step === "checkout" ? "Complete Checkout" : "Order Completed"}
                </h2>
                <span className="rounded-md bg-[#efe2d5] px-2 py-0.5 text-xs font-semibold text-[#6d4730]">
                  {orderNumber}
                </span>
              </div>
              <p className="text-xs text-[#8c7a6c]">
                {orderType} &bull; {customer}
              </p>
            </div>
          </div>

          {step === "checkout" && (
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dbd0] bg-white text-[#8c7a6c] transition hover:bg-[#f4ece4] hover:text-[#2b1b12]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* STEP 1: CHECKOUT & PAYMENT FLOW */}
        {step === "checkout" && (
          <div className="grid max-h-[82vh] overflow-y-auto md:grid-cols-[1fr_1.2fr]">
            {/* Left: Order Summary Panel */}
            <div className="border-b border-[#eee5dc] bg-[#faf7f3]/50 p-6 md:border-b-0 md:border-r">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                  Order Items ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <span className="text-xs font-medium text-[#c98b5b]">
                  {customer}
                </span>
              </div>

              {/* Items List */}
              <div className="mt-4 max-h-56 space-y-2.5 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-[#efe6dc] bg-white p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f4ece4] text-xs font-semibold text-[#6d4730]">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-medium text-[#2b1b12] line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#9b897b]">
                          ৳{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#6d4730]">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="mt-6 space-y-2 border-t border-[#eee5dc] pt-4 text-xs">
                <div className="flex justify-between text-[#66574d]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2b1b12]">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-[#c98b5b]">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-semibold">-৳{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8c7a6c]">
                  <span>Taxable Amount</span>
                  <span>৳{taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#66574d]">
                  <span>VAT (15%)</span>
                  <span className="font-medium text-[#2b1b12]">
                    ৳{vat.toFixed(2)}
                  </span>
                </div>

                <div className="my-3 border-t border-dashed border-[#ddd0c4]" />

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[#2b1b12]">
                    Grand Total
                  </span>
                  <span className="text-2xl font-extrabold text-[#6d4730]">
                    ৳{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Payment Method & Execution Panel */}
            <div className="flex flex-col justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                  Select Payment Method
                </p>

                {/* 3 Payment Methods */}
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {[
                    { id: "cash", label: "Cash", icon: Banknote },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "mobile", label: "Mobile", icon: Smartphone },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition ${
                          isSelected
                            ? "border-[#2b1b12] bg-[#2b1b12] text-white shadow-md shadow-[#2b1b12]/15"
                            : "border-[#e8dfd4] bg-white text-[#66574d] hover:border-[#c98b5b] hover:bg-[#faf7f3]"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                            isSelected
                              ? "bg-[#c98b5b] text-white"
                              : "bg-[#f4ece4] text-[#6d4730] group-hover:bg-[#ead8c7]"
                          }`}
                        >
                          <Icon size={19} />
                        </div>
                        <span className="text-xs font-semibold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* METHOD 1: CASH */}
                {paymentMethod === "cash" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#2b1b12]">
                          Amount Received
                        </label>
                        <span className="text-xs text-[#8c7a6c]">
                          Total due: ৳{total.toFixed(2)}
                        </span>
                      </div>

                      <div className="relative mt-2">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#9b897b]">
                          ৳
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          autoFocus
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(e.target.value)}
                          placeholder={total.toFixed(2)}
                          className="h-12 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-9 pr-4 text-lg font-bold text-[#2b1b12] outline-none transition placeholder:text-[#a99a8e] focus:border-[#c98b5b] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Quick tender suggestions */}
                    <div>
                      <p className="mb-2 text-[11px] font-medium text-[#8c7a6c]">
                        Quick Tender:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickTenders.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setAmountReceived(amount.toFixed(2))}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                              amountReceived === amount.toFixed(2)
                                ? "border-[#c98b5b] bg-[#c98b5b] text-white"
                                : "border-[#e5dbd0] bg-white text-[#6d4730] hover:bg-[#f4ece4]"
                            }`}
                          >
                            ৳{amount.toFixed(2)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Change & Validation feedback */}
                    <div className="rounded-2xl border border-[#eee5dc] bg-[#faf7f3] p-4">
                      {amountReceived.trim() === "" ? (
                        <div className="flex items-center gap-2 text-xs text-[#8c7a6c]">
                          <AlertCircle size={15} className="text-[#c98b5b]" />
                          <span>Enter amount received to calculate customer change</span>
                        </div>
                      ) : !isCashSufficient ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 font-medium text-red-600">
                            <AlertCircle size={16} />
                            <span>Insufficient Cash Received</span>
                          </div>
                          <p className="text-red-500">
                            Short by:{" "}
                            <span className="font-bold">
                              ৳{remainingCashNeeded.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-[#8c7a6c]">
                              Change to Return
                            </span>
                            <p className="text-xs text-emerald-600">
                              Amount tender accepted
                            </p>
                          </div>
                          <span className="text-2xl font-extrabold text-emerald-600">
                            ৳{cashChange.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* METHOD 2: CARD */}
                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    {/* Simulated card graphic */}
                    <div className="rounded-2xl border border-[#e8dfd4] bg-gradient-to-br from-[#2b1b12] to-[#40291d] p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wider text-[#cbb8a8]">
                          BREWPOS TERMINAL
                        </span>
                        <ShieldCheck size={20} className="text-[#c98b5b]" />
                      </div>

                      <div className="my-5 flex items-center gap-3">
                        <div className="h-6 w-9 rounded-md bg-[#c98b5b]/70" />
                        <span className="font-mono text-sm tracking-widest text-[#ead8c7]">
                          •••• •••• •••• 4242
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-[#a39284]">
                            Cardholder
                          </p>
                          <p className="text-xs font-semibold">{customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-[#a39284]">
                            Charge Amount
                          </p>
                          <p className="text-lg font-bold text-[#c98b5b]">
                            ৳{total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-xs text-[#8c7a6c]">
                      <p className="font-medium text-[#2b1b12]">
                        💳 Simulated Payment Gateway
                      </p>
                      <p className="mt-0.5">
                        Card reader ready for contactless tap, swipe, or chip. Click confirm to simulate payment.
                      </p>
                    </div>
                  </div>
                )}

                {/* METHOD 3: MOBILE PAYMENT */}
                {paymentMethod === "mobile" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#2b1b12]">
                        Mobile Wallet Provider
                      </label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {["bKash", "Nagad", "Rocket", "Upay"].map((provider) => (
                          <button
                            key={provider}
                            type="button"
                            onClick={() => setMobileProvider(provider)}
                            className={`rounded-xl border py-2 text-xs font-medium transition ${
                              mobileProvider === provider
                                ? "border-[#c98b5b] bg-[#c98b5b] font-semibold text-white"
                                : "border-[#e5dbd0] bg-[#faf7f3] text-[#6d4730] hover:bg-[#f4ece4]"
                            }`}
                          >
                            {provider}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#2b1b12]">
                          Transaction / Reference ID
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileRef(
                              `TRX-${Math.floor(100000 + Math.random() * 900000)}`
                            )
                          }
                          className="flex items-center gap-1 text-[11px] font-medium text-[#c98b5b] hover:underline"
                        >
                          <RotateCcw size={11} /> Generate New
                        </button>
                      </div>

                      <input
                        type="text"
                        value={mobileRef}
                        onChange={(e) => setMobileRef(e.target.value)}
                        placeholder="e.g. TRX-938210"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-sm font-mono text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                      />
                    </div>

                    <div className="rounded-xl border border-[#e5dbd0] bg-[#faf7f3] p-3 text-xs text-[#8c7a6c]">
                      <div className="flex items-center justify-between">
                        <span>Simulated Merchant:</span>
                        <span className="font-semibold text-[#2b1b12]">
                          BrewPOS - {mobileProvider}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span>Payable Amount:</span>
                        <span className="font-bold text-[#6d4730]">
                          ৳{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation Action Button */}
              <div className="mt-6 border-t border-[#eee5dc] pt-5">
                <button
                  type="button"
                  disabled={
                    isProcessing ||
                    (paymentMethod === "cash" && !isCashSufficient)
                  }
                  onClick={handleConfirmPayment}
                  className="relative flex h-12 w-full items-center justify-center rounded-xl bg-[#2b1b12] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#40291d] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing Payment...
                    </span>
                  ) : paymentMethod === "cash" ? (
                    `Complete Cash Payment (৳${total.toFixed(2)})`
                  ) : paymentMethod === "card" ? (
                    `Confirm Card Payment (৳${total.toFixed(2)})`
                  ) : (
                    `Confirm ${mobileProvider} Payment (৳${total.toFixed(2)})`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: POST-PAYMENT SUCCESS STATE */}
        {step === "success" && completedOrder && (
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircle2 size={38} strokeWidth={2.2} />
            </div>

            <h3 className="mt-4 text-2xl font-bold text-[#2b1b12]">
              Payment Successful!
            </h3>
            <p className="mt-1 text-sm text-[#8c7a6c]">
              Order has been processed and recorded successfully.
            </p>

            {/* Order Number Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e8dfd4] bg-[#faf7f3] px-4 py-2">
              <span className="text-xs font-medium text-[#8c7a6c]">Order No:</span>
              <span className="font-mono text-sm font-bold text-[#2b1b12]">
                {completedOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopyOrderNumber(completedOrder.orderNumber)}
                className="ml-1 text-[#9b897b] transition hover:text-[#2b1b12]"
                title="Copy Order Number"
              >
                {copiedOrderNo ? (
                  <Check size={15} className="text-emerald-600" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
            </div>

            {/* Summary Details Grid */}
            <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-[#e8dfd4] bg-[#faf7f3]/60 p-5 text-left text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8c7a6c]">Customer</p>
                  <p className="font-semibold text-[#2b1b12]">
                    {completedOrder.customer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8c7a6c]">Order Type</p>
                  <p className="font-semibold text-[#2b1b12]">
                    {completedOrder.orderType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8c7a6c]">Payment Method</p>
                  <p className="font-semibold capitalize text-[#2b1b12]">
                    {completedOrder.payment.method === "mobile"
                      ? "Mobile Payment"
                      : completedOrder.payment.method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8c7a6c]">Total Paid</p>
                  <p className="text-base font-bold text-[#6d4730]">
                    ৳{completedOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Show Cash Details if cash */}
              {completedOrder.payment.method === "cash" && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-800">
                  <div>
                    <span className="text-emerald-600">Amount Tendered: </span>
                    <span className="font-semibold">
                      ৳{completedOrder.payment.amountReceived.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Change Returned: </span>
                    <span className="font-bold text-sm text-emerald-700">
                      ৳{completedOrder.payment.change.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Show Mobile reference if mobile */}
              {completedOrder.payment.transactionRef && (
                <div className="mt-3 rounded-lg border border-[#e5dbd0] bg-white px-3 py-2 text-xs text-[#8c7a6c]">
                  <span className="font-medium text-[#2b1b12]">Reference: </span>
                  <span className="font-mono text-[#6d4730]">
                    {completedOrder.payment.transactionRef}
                  </span>
                </div>
              )}

              {/* Toggle Receipt Preview */}
              <div className="mt-4 border-t border-[#eee5dc] pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c98b5b] hover:text-[#2b1b12]"
                >
                  <ReceiptText size={14} />
                  {showReceiptPreview ? "Hide Receipt Breakdown" : "View Receipt Breakdown"}
                </button>
              </div>

              {showReceiptPreview && (
                <div className="mt-3 space-y-2 rounded-xl border border-dashed border-[#ddd0c4] bg-white p-3.5 text-xs">
                  <div className="space-y-1.5 border-b border-gray-100 pb-2">
                    {completedOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-[#2b1b12]">
                        <span>{it.quantity}x {it.name}</span>
                        <span>৳{(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 pt-1 text-[#8c7a6c]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>৳{completedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {completedOrder.discount > 0 && (
                      <div className="flex justify-between text-[#c98b5b]">
                        <span>Discount ({completedOrder.discountPercent}%)</span>
                        <span>-৳{completedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>VAT (15%)</span>
                      <span>৳{completedOrder.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#2b1b12]">
                      <span>Total Paid</span>
                      <span>৳{completedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post-Payment Actions */}
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e5dbd0] bg-white px-5 py-3 text-sm font-semibold text-[#66574d] transition hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <Printer size={17} />
                Print Receipt
              </button>

              <button
                type="button"
                onClick={onNewOrder}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2b1b12] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#40291d]"
              >
                <PlusCircle size={17} />
                New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
