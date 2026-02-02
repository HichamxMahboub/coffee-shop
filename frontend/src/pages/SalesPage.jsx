import React, { useEffect, useState } from "react";
import { Download, Calendar } from "lucide-react";
import { apiFetch } from "../api/client.js";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  const loadSales = async () => {
    try {
      const query = from && to ? `?from=${from}&to=${to}` : "";
      const data = await apiFetch(`/sales${query}`);
      setSales(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Ventes</p>
        <h2 className="mt-2 text-3xl font-semibold">Historique des transactions</h2>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              className="input"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              className="input"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <button type="button" className="button-secondary" onClick={loadSales}>
            Filtrer
          </button>
          <a
            className="button-primary"
            href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/sales/export`}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <div className="card p-6">
        <div className="space-y-3 text-sm">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
            >
              <div>
                <p className="font-semibold">Commande #{sale.id}</p>
                <p className="text-xs text-slate-400">
                  {new Date(sale.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-coffee-200">{sale.total_amount.toFixed(2)} €</p>
                <p className="text-xs text-slate-400">{sale.cashier || ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
