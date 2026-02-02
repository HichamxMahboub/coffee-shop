import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { apiFetch } from "../api/client.js";

const defaultForm = {
  nom: "",
  quantite: "",
  unite: "grammes",
  seuilAlerte: "0",
};

export default function Inventory() {
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
      nom: form.nom,
      quantite: Number(form.quantite),
      unite: form.unite,
      seuilAlerte: Number(form.seuilAlerte),
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
      nom: ingredient.nom,
      quantite: ingredient.quantite,
      unite: ingredient.unite,
      seuilAlerte: ingredient.seuil_alerte,
    });
  };

  const handleDelete = async (id) => {
    await apiFetch(`/ingredients/${id}`, { method: "DELETE" });
    loadIngredients();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Inventaire</p>
        <h2 className="mt-2 text-3xl font-semibold">Gestion des ingrédients</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <form className="card p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 text-coffee-200">
            <PlusCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">{editingId ? "Modifier" : "Ajouter"}</p>
          </div>
          <input
            className="input w-full"
            name="nom"
            placeholder="Nom de l'ingrédient"
            value={form.nom}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="quantite"
            type="number"
            step="0.001"
            placeholder="Quantité"
            value={form.quantite}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="unite"
            placeholder="Unité (grammes, litres...)"
            value={form.unite}
            onChange={handleChange}
            required
          />
          <input
            className="input w-full"
            name="seuilAlerte"
            type="number"
            step="0.001"
            placeholder="Seuil d'alerte"
            value={form.seuilAlerte}
            onChange={handleChange}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="button-primary w-full">
            {editingId ? "Mettre à jour" : "Créer"}
          </button>
        </form>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Ingrédients</p>
            <button type="button" className="button-secondary" onClick={loadIngredients}>
              Rafraîchir
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {ingredients.map((ingredient) => {
              const isLow = Number(ingredient.quantite) <= Number(ingredient.seuil_alerte);
              return (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{ingredient.nom}</p>
                    <p className="text-xs text-slate-400">
                      {ingredient.quantite} {ingredient.unite}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
