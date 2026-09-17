"use client";

import type { CompletedOrder } from "@/types/pos";
import { useSettingsStore } from "@/lib/settings-store";

interface ReceiptProps {
  order: CompletedOrder;
  variant?: "print-only" | "preview" | "both";
  cashierName?: string;
}

export default function Receipt({
  order,
  variant = "print-only",
  cashierName,
}: ReceiptProps) {
  const isPrintOnly = variant === "print-only";
  const isPreview = variant === "preview";
  const { settings } = useSettingsStore();

  const business = settings.business;
  const receiptConfig = settings.receipt;
  const sym = settings.taxCurrency.currencySymbol || "৳";

  // Calculate order-specific VAT percentage rate based on its stored values
  const effectiveVatPercent =
    order.taxableAmount > 0
      ? Math.round((order.vat / order.taxableAmount) * 100)
      : settings.taxCurrency.vatRate;

  // Common inner receipt structure
  const receiptBody = (
    <div className="font-mono text-xs text-neutral-900 leading-relaxed">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-base font-bold tracking-tight">
          {business.name || "BrewPOS Coffee Shop"}
        </h1>
        {business.tagline && (
          <p className="text-[10px] text-neutral-500">{business.tagline}</p>
        )}
        {receiptConfig.showAddress && business.address && (
          <p className="text-[10px] text-neutral-500">{business.address}</p>
        )}
        {receiptConfig.showPhone && business.phone && (
          <p className="text-[10px] text-neutral-500">Tel: {business.phone}</p>
        )}
        {receiptConfig.showVatNumber && business.vatNumber && (
          <p className="text-[10px] text-neutral-500">BIN: {business.vatNumber}</p>
        )}

        <div className="my-2 border-b border-dashed border-neutral-400" />
        <p className="font-bold text-sm tracking-wide">ORDER #{order.orderNumber}</p>
        <p className="text-[10px] text-neutral-600">{order.createdAt}</p>

        <div className="text-[10px] text-neutral-600">
          {receiptConfig.showOrderType && (
            <span>
              Type: <span className="font-semibold">{order.orderType}</span>
            </span>
          )}
          {receiptConfig.showCustomer && order.customer && (
            <span>
              {" "}
              | Customer:{" "}
              <span className="font-semibold">{order.customer}</span>
            </span>
          )}
          {receiptConfig.showCashier && (
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Cashier: {cashierName || "Counter 1"}
            </p>
          )}
        </div>
        <div className="my-2 border-b border-dashed border-neutral-400" />
      </div>

      {/* Items */}
      <div className="space-y-1 py-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-baseline gap-2">
            <span className="line-clamp-1">
              {item.quantity}x {item.name}
            </span>
            <span className="shrink-0 font-medium">
              {sym}{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-2 border-b border-dashed border-neutral-400" />

      {/* Financials */}
      <div className="space-y-0.5 text-right">
        <div className="flex justify-between">
          <span className="text-neutral-600">Subtotal:</span>
          <span>
            {sym}{order.subtotal.toFixed(2)}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-neutral-700">
            <span>
              Discount{" "}
              {order.discountCode
                ? `(${order.discountCode})`
                : order.discountPercent > 0
                ? `(${order.discountPercent}%)`
                : ""}:
            </span>
            <span>
              -{sym}{order.discount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>VAT ({effectiveVatPercent}%):</span>
          <span>
            {sym}{order.vat.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-dotted border-neutral-300">
          <span>TOTAL:</span>
          <span>
            {sym}{order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {receiptConfig.showPaymentMethod && (
        <>
          <div className="my-2 border-b border-dashed border-neutral-400" />

          {/* Payment Information */}
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-neutral-600">Payment Method:</span>
              <span className="font-semibold uppercase">{order.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Paid Amount:</span>
              <span className="font-semibold">
                {sym}{order.payment.amountReceived.toFixed(2)}
              </span>
            </div>
            {order.payment.method === "cash" && (
              <div className="flex justify-between font-bold">
                <span>Change Returned:</span>
                <span>
                  {sym}{order.payment.change.toFixed(2)}
                </span>
              </div>
            )}
            {order.payment.cardLast4 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Card:</span>
                <span>•••• {order.payment.cardLast4}</span>
              </div>
            )}
            {order.payment.transactionRef && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Ref:</span>
                <span className="font-mono">{order.payment.transactionRef}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-4 text-center text-[10px] text-neutral-500">
        <p>{receiptConfig.footerMessage || "Thank you for choosing BrewPOS!"}</p>
        <p>Please come again.</p>
      </div>
    </div>
  );

  if (isPrintOnly) {
    return (
      <div className="hidden print:block print:w-full print:max-w-xs print:p-4 print:bg-white print:text-black">
        {receiptBody}
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="mx-auto w-full max-w-xs rounded-xl border border-[#e8dfd4] bg-white p-5 shadow-sm">
        {receiptBody}
      </div>
    );
  }

  // both
  return (
    <>
      <div className="hidden print:block print:w-full print:max-w-xs print:p-4 print:bg-white print:text-black">
        {receiptBody}
      </div>
      <div className="mx-auto w-full max-w-xs rounded-xl border border-[#e8dfd4] bg-white p-5 shadow-sm print:hidden">
        {receiptBody}
      </div>
    </>
  );
}
