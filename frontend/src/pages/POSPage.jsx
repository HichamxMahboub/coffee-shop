import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/formatPrice.js";
import { useTranslation } from "react-i18next";

export default function POSPage() {
  const { i18n, t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [settings, setSettings] = useState({
    taxRate: 0.2,
    cafeName: "Café Premium",
    cafeAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    taxAmount,
    total,
    setTaxRate,
    setCurrency,
    currency,
  } = useCart();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch("/settings");
        setSettings(data);
        setTaxRate(data.taxRate || 0.2);
        setCurrency({
          symbol: data.currencySymbol || "€",
          position: data.currencyPosition || "suffix",
        });
      } catch (err) {
        setError(err.message);
      }
    };
    loadSettings();
  }, [setTaxRate, setCurrency]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (i18n.language) params.set("lang", i18n.language);
        const data = await apiFetch(`/products${params.toString() ? `?${params}` : ""}`);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadProducts();
  }, [i18n.language]);

  const categories = useMemo(() => {
    const unique = new Map();
    products.forEach((product) => {
      if (product.category_id) {
        unique.set(product.category_id, product.category_name || "Autre");
      }
    });
    return [{ id: "all", name: "Tous" }, ...Array.from(unique, ([id, name]) => ({ id, name }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => String(product.category_id) === String(activeCategory));
  }, [products, activeCategory]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || null,
        })),
        paymentMethod: "card",
      };
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      clearCart();
      toast.success(t("pos.orderSuccess"));
    } catch (err) {
      toast.error(err.message || t("pos.orderError"));
    } finally {
      setLoading(false);
    }
  };

  const openVariantModal = async (product) => {
    setVariantProduct(product);
    setVariantModalOpen(true);
    setVariantLoading(true);
    try {
      const data = await apiFetch(`/products/${product.id}/variants`);
      setVariants(data);
    } catch (err) {
      toast.error(err.message);
      setVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };

  const closeVariantModal = () => {
    setVariantModalOpen(false);
    setVariantProduct(null);
    setVariants([]);
  };

  const handleVariantSelect = (variant) => {
    if (!variantProduct) return;
    addItem(variantProduct, {
      id: variant.id,
      label: variant.size,
      price: variant.price,
    });
    closeVariantModal();
  };

  const formatVariantLabel = (size) => {
    if (size === "S") return t("pos.variantNormal");
    if (size === "L") return t("pos.variantLarge");
    return size;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {t("pos.title")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{settings.cafeName}</h2>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                String(activeCategory) === String(cat.id)
                  ? "bg-coffee-500 text-white"
                  : "bg-slate-900/70 text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat.id === "all" ? t("pos.categoryAll") : cat.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => openVariantModal(product)}
              className="card p-5 text-left hover:border-coffee-400 transition"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {product.category_name || t("pos.categoryFallback")}
                </p>
                <ShoppingBag className="h-5 w-5 text-coffee-300" />
              </div>
              <p className="mt-3 text-lg font-semibold">{product.name}</p>
              <p className="mt-6 text-2xl font-semibold text-coffee-200">
                {formatPrice(product.price, currency.symbol, currency.position)}
              </p>
            </button>
          ))}
        </div>
      </section>

      <aside className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              {t("pos.cartTitle")}
            </p>
            <p className="text-lg font-semibold">{t("pos.cartSubtitle")}</p>
          </div>
          <button
            type="button"
            className="button-secondary"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            {t("pos.clear")}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">{t("pos.empty")}</p>
          ) : (
            items.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-slate-400">
                      {formatVariantLabel(item.variantLabel)}
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    {formatPrice(item.unitPrice, currency.symbol, currency.position)}
                  </p>
                  <div className="mt-2">
                    <label className="text-[11px] text-slate-500">
                      {t("pos.notesLabel")}
                    </label>
                    <input
                      className="input mt-1 w-full text-xs"
                      placeholder={t("pos.notesPlaceholder")}
                      value={item.notes || ""}
                      onChange={(event) =>
                        updateNotes(item.itemId, event.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-700 p-1"
                    onClick={() =>
                      updateQuantity(item.itemId, Math.max(1, item.quantity - 1))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-slate-700 p-1"
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeItem(item.itemId)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>{t("common.subtotal")}</span>
            <span>{formatPrice(subtotal, currency.symbol, currency.position)}</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-300">
            <span>
              {t("common.tax")} ({Math.round(settings.taxRate * 100)}%)
            </span>
            <span>{formatPrice(taxAmount, currency.symbol, currency.position)}</span>
          </div>
          <div className="mt-3 flex justify-between text-lg font-semibold">
            <span>{t("common.total")}</span>
            <span>{formatPrice(total, currency.symbol, currency.position)}</span>
          </div>
        </div>

        <button
          type="button"
          className="button-primary mt-6 w-full"
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
        >
          {loading ? t("pos.processing") : t("pos.checkout")}
        </button>
      </aside>

      {variantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {t("pos.chooseVariant")}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {variantProduct?.name}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm text-slate-400 hover:text-white"
                onClick={closeVariantModal}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {variantLoading ? (
                <p className="text-sm text-slate-400">...</p>
              ) : variants.length === 0 ? (
                <p className="text-sm text-slate-400">{t("common.none")}</p>
              ) : (
                variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleVariantSelect(variant)}
                    className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold hover:border-coffee-400"
                  >
                    <span>{formatVariantLabel(variant.size)}</span>
                    <span className="text-coffee-200">
                      {formatPrice(variant.price, currency.symbol, currency.position)}
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              className="button-secondary mt-6 w-full"
              onClick={closeVariantModal}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
