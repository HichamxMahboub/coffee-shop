import React, { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Trash2, ReceiptText, UserCircle } from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const { items, addItem, removeItem, updateQuantity, subtotal, taxAmount, total, clearCart } =
    useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/products${query ? `?q=${query}` : ""}`);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [query]);

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

  const filtered = useMemo(() => products, [products]);

  const handleCheckout = async () => {
    setLoading(true);
    setOrderStatus("");
    try {
      const payload = {
        items,
        paymentMethod: "card",
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
      };
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      clearCart();
      setOrderStatus("Commande enregistrée !");
    } catch (err) {
      setOrderStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === String(selectedCustomerId)
  );
  const discount = selectedCustomer?.points > 50 ? 5 : 0;
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
                {customer.nom} • {customer.points} pts
              </option>
            ))}
          </select>
          {selectedCustomer && selectedCustomer.points > 50 && (
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
              <p className="mt-4 text-coffee-200">{product.price.toFixed(2)} €</p>
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
                  <p className="text-xs text-slate-400">{item.unitPrice.toFixed(2)} €</p>
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
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-300">
            <span>TVA (20%)</span>
            <span>{taxAmount.toFixed(2)} €</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between text-coffee-200">
              <span>Remise fidélité</span>
              <span>-{discount.toFixed(2)} €</span>
            </div>
          )}
          <div className="mt-3 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{totalAfterDiscount.toFixed(2)} €</span>
          </div>
        </div>

        {orderStatus && <p className="mt-4 text-xs text-coffee-200">{orderStatus}</p>}

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

        <div className="receipt mt-6 rounded-xl border border-slate-800 p-4 text-xs">
          <p className="text-center font-semibold">Café Premium</p>
          <p className="text-center text-slate-400">Ticket 80mm</p>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{(item.unitPrice * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between">
              <span>Remise</span>
              <span>-{discount.toFixed(2)} €</span>
            </div>
          )}
          <div className="mt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{totalAfterDiscount.toFixed(2)} €</span>
          </div>
          <p className="mt-4 text-center text-slate-400">Merci et à bientôt</p>
        </div>
      </aside>
    </div>
  );
}
