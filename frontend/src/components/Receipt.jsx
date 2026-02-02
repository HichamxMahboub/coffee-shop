import React from "react";

export default function Receipt({
  items,
  discount,
  total,
  cafeName,
  cafeAddress,
  currency,
  className = "",
}) {
  const symbol = currency?.symbol || "€";
  const position = currency?.position || "suffix";
  const format = (value) =>
    position === "prefix"
      ? `${symbol}${Number(value).toFixed(2)}`
      : `${Number(value).toFixed(2)} ${symbol}`;
  return (
    <div className={`receipt rounded-xl border border-slate-800 p-4 text-xs ${className}`}>
      <p className="text-center font-semibold">{cafeName}</p>
      {cafeAddress && <p className="text-center text-slate-400">{cafeAddress}</p>}
      <p className="text-center text-slate-400">Ticket 80mm</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between">
            <div>
              <span>
                {item.name} x{item.quantity}
              </span>
              {item.notes && (
                <p className="text-[10px] text-slate-400">Note : {item.notes}</p>
              )}
            </div>
            <span>{format(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>
      {discount > 0 && (
        <div className="mt-2 flex justify-between">
          <span>Remise</span>
          <span>-{format(discount)}</span>
        </div>
      )}
      <div className="mt-3 flex justify-between font-semibold">
        <span>Total</span>
        <span>{format(total)}</span>
      </div>
      <p className="mt-4 text-center text-slate-400">Merci et à bientôt</p>
    </div>
  );
}
