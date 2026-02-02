import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(0.2);
  const [currency, setCurrency] = useState({
    symbol: "€",
    position: "suffix",
  });

  const buildItemId = (productId, productVariantId) =>
    `${productId}:${productVariantId ?? "base"}`;

  const addItem = (product, variant) => {
    const productVariantId = variant?.id ?? null;
    const itemId = buildItemId(product.id, productVariantId);
    setItems((prev) => {
      const existing = prev.find((item) => item.itemId === itemId);
      if (existing) {
        return prev.map((item) =>
          item.itemId === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          itemId,
          productId: product.id,
          productVariantId,
          name: product.name,
          variantLabel: variant?.label || null,
          unitPrice: variant?.price ?? product.price,
          quantity: 1,
        },
      ];
    });
  };

  const resolveItemId = (productId, productVariantId) => {
    if (productVariantId !== undefined && productVariantId !== null) {
      return buildItemId(productId, productVariantId);
    }
    const matches = items.filter((item) => item.productId === productId);
    return matches.length === 1 ? matches[0].itemId : null;
  };

  const removeItem = (productId, productVariantId) => {
    const itemId =
      productId && !String(productId).includes(":")
        ? resolveItemId(productId, productVariantId)
        : productId;
    if (!itemId) return;
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const updateQuantity = (productId, quantity, productVariantId) => {
    const itemId =
      productId && !String(productId).includes(":")
        ? resolveItemId(productId, productVariantId)
        : productId;
    if (!itemId) return;
    setItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, quantity } : item))
    );
  };

  const updateNotes = (productId, notes, productVariantId) => {
    const itemId =
      productId && !String(productId).includes(":")
        ? resolveItemId(productId, productVariantId)
        : productId;
    if (!itemId) return;
    setItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, notes } : item))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateNotes,
      clearCart,
      subtotal,
      taxAmount,
      total,
      taxRate,
      setTaxRate,
      currency,
      setCurrency,
    }),
    [items, subtotal, taxAmount, total, taxRate, currency]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
