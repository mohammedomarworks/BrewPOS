import type { CompletedOrder } from "@/types/pos";

interface ReceiptProps {
  order: CompletedOrder;
  variant?: "print-only" | "preview" | "both";
}

export default function Receipt({ order, variant = "print-only" }: ReceiptProps) {
  const isPrintOnly = variant === "print-only";
  const isPreview = variant === "preview";

  // Common inner receipt structure
  const receiptBody = (
    <div className="font-mono text-xs text-neutral-900 leading-relaxed">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-base font-bold tracking-tight">BrewPOS Coffee Shop</h1>
        <p className="text-[10px] text-neutral-500">Premium Artisanal Coffee</p>
        <p className="text-[10px] text-neutral-500">Dhanmondi, Dhaka</p>
        <div className="my-2 border-b border-dashed border-neutral-400" />
        <p className="font-bold text-sm tracking-wide">ORDER #{order.orderNumber}</p>
        <p className="text-[10px] text-neutral-600">{order.createdAt}</p>
        <p className="text-[10px] text-neutral-600">
          Type: <span className="font-semibold">{order.orderType}</span> | Customer:{" "}
          <span className="font-semibold">{order.customer}</span>
        </p>
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
              ৳{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-2 border-b border-dashed border-neutral-400" />

      {/* Financials */}
      <div className="space-y-0.5 text-right">
        <div className="flex justify-between">
          <span className="text-neutral-600">Subtotal:</span>
          <span>৳{order.subtotal.toFixed(2)}</span>
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
            <span>-৳{order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>VAT (15%):</span>
          <span>৳{order.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-dotted border-neutral-300">
          <span>TOTAL:</span>
          <span>৳{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="my-2 border-b border-dashed border-neutral-400" />

      {/* Payment Information */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-neutral-600">Payment Method:</span>
          <span className="font-semibold uppercase">{order.payment.method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Paid Amount:</span>
          <span className="font-semibold">৳{order.payment.amountReceived.toFixed(2)}</span>
        </div>
        {order.payment.method === "cash" && (
          <div className="flex justify-between font-bold">
            <span>Change Returned:</span>
            <span>৳{order.payment.change.toFixed(2)}</span>
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

      {/* Footer */}
      <div className="mt-4 text-center text-[10px] text-neutral-500">
        <p>Thank you for choosing BrewPOS!</p>
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
