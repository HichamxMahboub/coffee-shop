import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { apiFetch } from "../api/client.js";
import { useTranslation } from "react-i18next";

const defaultForm = {
  name: "",
  stockQuantity: "",
  unit: "g",
  alertThreshold: "0",
};

export default function Inventory() {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadIngredients = async () => {
    try {
      const data = await apiFetch("/ingredients");
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      stockQuantity: Number(form.stockQuantity),
      unit: form.unit,
      alertThreshold: Number(form.alertThreshold),
    };

    try {
      if (editingId) {
        await apiFetch(`/ingredients/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/ingredients", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(defaultForm);
      setEditingId(null);
      loadIngredients();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (ingredient) => {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      stockQuantity: ingredient.stock_quantity,
      unit: ingredient.unit,
      alertThreshold: ingredient.alert_threshold,
    });
  };

  const handleDelete = async (id) => {
    await apiFetch(`/ingredients/${id}`, { method: "DELETE" });
    loadIngredients();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {t("inventory.title")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{t("inventory.subtitle")}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <form className="card p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 text-coffee-200">
            <PlusCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">
              {editingId ? t("inventory.formEdit") : t("inventory.formAdd")}
            </p>
          </div>
          <input
            className="input w-full"
            name="name"
            placeholder={t("inventory.namePlaceholder")}
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="stockQuantity"
            type="number"
            step="0.001"
            placeholder={t("inventory.quantityPlaceholder")}
            value={form.stockQuantity}
            onChange={handleChange}
            required
          />
          <select
            className="input w-full"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            required
          >
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="unit">unit</option>
          </select>
          <input
            className="input w-full"
            name="alertThreshold"
            type="number"
            step="0.001"
            placeholder={t("inventory.alertThreshold")}
            value={form.alertThreshold}
            onChange={handleChange}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="button-primary w-full">
            {editingId ? t("inventory.update") : t("inventory.create")}
          </button>
        </form>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t("inventory.listTitle")}</p>
            <button type="button" className="button-secondary" onClick={loadIngredients}>
              {t("common.refresh")}
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {ingredients.map((ingredient) => {
              const isLow =
                Number(ingredient.stock_quantity) <= Number(ingredient.alert_threshold);
              return (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{ingredient.name}</p>
                    <p className="text-xs text-slate-400">
                      {ingredient.stock_quantity} {ingredient.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLow ? (
                      <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300">
                        {t("inventory.stockLow")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                        {t("inventory.ok")}
                      </span>
                    )}
                    {isLow && <AlertTriangle className="h-4 w-4 text-amber-300" />}
                    <button type="button" onClick={() => startEdit(ingredient)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(ingredient.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
