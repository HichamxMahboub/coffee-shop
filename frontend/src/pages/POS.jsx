import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  ReceiptText,
  UserCircle,
  Pencil,
} from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";
import Receipt from "../components/Receipt.jsx";
import { formatPrice } from "../utils/formatPrice.js";
import { useTranslation } from "react-i18next";

export default function POS() {
  const { i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [settings, setSettings] = useState({
    taxRate: 0.2,
    cafeName: "Café Premium",
    cafeAddress: "",
  });
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    subtotal,
    taxAmount,
    total,
    clearCart,
    setTaxRate,
    setCurrency,
    currency,
  } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (i18n.language) params.set("lang", i18n.language);
        const data = await apiFetch(`/products${params.toString() ? `?${params}` : ""}`);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [query, i18n.language]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await apiFetch("/customers");
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadCustomers();
  }, []);

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
  }, [setTaxRate]);

  const filtered = useMemo(() => products, [products]);

  const handleCheckout = async () => {
    setLoading(true);
    setOrderStatus("");
    try {
      const payload = {
        items,
        paymentMethod,
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
        cashAmount: cashAmount ? Number(cashAmount) : null,
        cardAmount: cardAmount ? Number(cardAmount) : null,
      };
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      clearCart();
      setCashAmount("");
      setCardAmount("");
      setPaymentMethod("card");
      setOrderStatus("Commande enregistrée !");
      toast.success("Vente confirmée");
    } catch (err) {
      setOrderStatus(err.message);
      if (err.message?.toLowerCase().includes("stock")) {
        toast.error(err.message);
      } else {
        toast.error("Échec de la vente");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === String(selectedCustomerId)
  );
  const discount = selectedCustomer?.loyalty_points > 50 ? 5 : 0;
  const totalAfterDiscount = Math.max(0, total - discount);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">POS</p>
          <h2 className="mt-2 text-3xl font-semibold">Point de vente</h2>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="input w-full"
              placeholder="Rechercher un produit"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 text-coffee-300">
            <UserCircle />
            <p className="text-sm font-semibold">Client fidélité</p>
          </div>
          <select
            className="input mt-3 w-full"
            value={selectedCustomerId}
            onChange={(event) => setSelectedCustomerId(event.target.value)}
          >
            <option value="">Aucun client</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} • {customer.loyalty_points} pts
              </option>
            ))}
          </select>
          {selectedCustomer && selectedCustomer.loyalty_points > 50 && (
            <p className="mt-2 text-xs text-coffee-200">
              Remise automatique de 5€ appliquée
            </p>
          )}
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addItem(product)}
              className="card p-4 text-left hover:border-coffee-400 transition"
            >
              <p className="text-sm text-slate-400">{product.category_name || "Café"}</p>
              <p className="mt-2 text-lg font-semibold">{product.name}</p>
              <p className="mt-4 text-coffee-200">
                {formatPrice(product.price, currency.symbol, currency.position)}
              </p>
              {product.image_url && (
                <p className="mt-2 text-xs text-slate-400">Image: {product.image_url}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      <aside className="card p-6">
        <div className="flex items-center gap-3 text-coffee-300">
          <ShoppingCart />
          <p className="text-sm font-semibold">Panier</p>
        </div>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun article ajouté</p>
          ) : (
            items.map((item) => (
              <div key={item.itemId || item.productId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatPrice(item.unitPrice, currency.symbol, currency.position)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-400">Note : {item.notes}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    className="input w-16 text-center"
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.itemId || item.productId, Number(event.target.value))
                    }
                  />
                    <button
                      type="button"
                      onClick={() => {
                        const next = window.prompt(
                          "Notes pour cet article",
                          item.notes || ""
                        );
                        if (next !== null) {
                          updateNotes(item.itemId || item.productId, next.trim());
                        }
                      }}
                      title="Ajouter une note"
                    >
                      <Pencil className="h-4 w-4 text-slate-300" />
                    </button>
                  <button type="button" onClick={() => removeItem(item.itemId || item.productId)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal, currency.symbol, currency.position)}</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-300">
            <span>TVA (20%)</span>
            <span>{formatPrice(taxAmount, currency.symbol, currency.position)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between text-coffee-200">
              <span>Remise fidélité</span>
              <span>-{formatPrice(discount, currency.symbol, currency.position)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(totalAfterDiscount, currency.symbol, currency.position)}</span>
          </div>
        </div>

        {orderStatus && <p className="mt-4 text-xs text-coffee-200">{orderStatus}</p>}

        <div className="mt-6 space-y-3 text-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">Paiement</p>
          <select
            className="input w-full"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Carte</option>
            <option value="mixed">Mixte</option>
          </select>

          {paymentMethod === "mixed" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="Montant cash"
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value)}
              />
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="Montant carte"
                value={cardAmount}
                onChange={(event) => setCardAmount(event.target.value)}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className="button-primary mt-6 w-full"
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
        >
          <ReceiptText className="mr-2 h-4 w-4" />
          {loading ? "Traitement..." : "Encaisser"}
        </button>

        <button
          type="button"
          className="button-secondary mt-3 w-full no-print"
          onClick={handlePrintReceipt}
          disabled={items.length === 0}
        >
          Imprimer le ticket
        </button>

        <Receipt
          className="receipt-screen mt-6"
          items={items}
          discount={discount}
          total={totalAfterDiscount}
          cafeName={settings.cafeName}
          cafeAddress={settings.cafeAddress}
          currency={currency}
        />
        <Receipt
          className="print-only"
          items={items}
          discount={discount}
          total={totalAfterDiscount}
          cafeName={settings.cafeName}
          cafeAddress={settings.cafeAddress}
          currency={currency}
        />
      </aside>
    </div>
  );
}
