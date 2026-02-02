import React, { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, ShoppingBasket } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { apiFetch } from "../api/client.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiFetch("/dashboard");
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Tableau de bord</p>
        <h2 className="mt-2 text-3xl font-semibold">Résumé du jour</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3 text-coffee-300">
            <TrendingUp />
            <p className="text-sm font-semibold">Ventes du jour</p>
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {data ? `${data.todaySales.toFixed(2)} €` : "—"}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 text-coffee-300">
            <ShoppingBasket />
            <p className="text-sm font-semibold">Commandes</p>
          </div>
          <p className="mt-4 text-3xl font-semibold">{data ? data.todayOrders : "—"}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 text-amber-300">
            <AlertTriangle />
            <p className="text-sm font-semibold">Alertes stock bas</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {data?.lowStock?.length ? (
              data.lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-amber-300">
                    {item.stock} {item.unit}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Aucune alerte</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm font-semibold">CA par jour</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueByDay || []}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#c28f62" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-semibold">Top 5 ventes</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topProducts || []}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#a6703f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
