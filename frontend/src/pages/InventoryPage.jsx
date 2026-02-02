import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { apiFetch } from "../api/client.js";

const defaultForm = {
  name: "",
  price: "",
  stock: "",
  categoryId: "",
  lowStockThreshold: "5",
};

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      const data = await apiFetch("/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(defaultForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id || "",
      lowStockThreshold: product.low_stock_threshold || 5,
    });
  };

  const handleDelete = async (id) => {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Inventaire</p>
        <h2 className="mt-2 text-3xl font-semibold">Gestion des produits</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <form className="card p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 text-coffee-200">
            <PlusCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">{editingId ? "Modifier" : "Ajouter"}</p>
          </div>
          <input
            className="input w-full"
            name="name"
            placeholder="Nom du produit"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="price"
            type="number"
            step="0.01"
            placeholder="Prix"
            value={form.price}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="categoryId"
            placeholder="ID catégorie"
            value={form.categoryId}
            onChange={handleChange}
          />
          <input
            className="input w-full"
            name="lowStockThreshold"
            type="number"
            placeholder="Seuil stock bas"
            value={form.lowStockThreshold}
            onChange={handleChange}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="button-primary w-full">
            {editingId ? "Mettre à jour" : "Créer"}
          </button>
        </form>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Produits</p>
            <button type="button" className="button-secondary" onClick={loadProducts}>
              Rafraîchir
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-slate-400">
                    {product.category_name || "Café"} • Stock {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-coffee-200">{product.price.toFixed(2)} €</span>
                  <button type="button" onClick={() => startEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
