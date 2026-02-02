export function formatPrice(amount, currencySymbol, currencyPosition = "suffix") {
  const value = Number(amount ?? 0).toFixed(2);
  return currencyPosition === "prefix" ? `${currencySymbol}${value}` : `${value} ${currencySymbol}`;
}
