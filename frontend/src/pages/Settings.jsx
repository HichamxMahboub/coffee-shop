import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { apiFetch } from "../api/client.js";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";

export default function Settings() {
  const { t } = useTranslation();
  const { setTaxRate, setCurrency } = useCart();
  const [form, setForm] = useState({
    cafeName: "",
    cafeAddress: "",
    taxRate: 0.2,
    currencySymbol: "€",
    currencyPosition: "suffix",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/settings");
        setForm(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "taxRate" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setTaxRate(form.taxRate);
      setCurrency({
        symbol: form.currencySymbol,
        position: form.currencyPosition,
      });
      toast.success(t("settings.saved"));
    } catch (err) {
      setError(err.message);
      toast.error(t("settings.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {t("nav.settings")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{t("settings.title")}</h2>
      </div>

      <form className="card p-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="input w-full"
          name="cafeName"
          placeholder={t("settings.cafeName")}
          value={form.cafeName}
          onChange={handleChange}
          required
        />
        <input
          className="input w-full"
          name="cafeAddress"
          placeholder={t("settings.cafeAddress")}
          value={form.cafeAddress}
          onChange={handleChange}
          required
        />
        <input
          className="input w-full"
          name="taxRate"
          type="number"
          step="0.01"
          min="0"
          max="1"
          placeholder={t("settings.taxRate")}
          value={form.taxRate}
          onChange={handleChange}
          required
        />
        <input
          className="input w-full"
          name="currencySymbol"
          placeholder={t("settings.currencySymbol")}
          value={form.currencySymbol}
          onChange={handleChange}
          required
        />
        <select
          className="input w-full"
          name="currencyPosition"
          value={form.currencyPosition}
          onChange={handleChange}
          required
        >
          <option value="prefix">{t("settings.currencyPosition")} - prefix</option>
          <option value="suffix">{t("settings.currencyPosition")} - suffix</option>
        </select>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" className="button-primary" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? t("common.saveInProgress") : t("settings.save")}
        </button>
      </form>
    </div>
  );
}
