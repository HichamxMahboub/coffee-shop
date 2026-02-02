import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client.js";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function Barista() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const loadOrders = async () => {
    try {
      const data = await apiFetch("/barista/pending");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const formatDuration = (start) => {
    const diff = Math.max(0, Math.floor((now - new Date(start).getTime()) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const notifyReady = async (orderId) => {
    try {
      await apiFetch("/notifications/ready", {
        method: "POST",
        body: JSON.stringify({ orderId, status: "completed" }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markServed = async (orderId) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      toast.success(t("barista.servedToast"));
      await notifyReady(orderId);
      loadOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {t("barista.title")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{t("barista.subtitle")}</h2>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.length === 0 ? (
          <div className="card p-6 text-sm text-slate-400">{t("barista.empty")}</div>
        ) : (
          sortedOrders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {t("barista.orderLabel")} #{order.id}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Timer</p>
                  <p className="text-lg font-semibold text-coffee-200">
                    {formatDuration(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`}>
                    <p className="font-semibold">
                      {item.quantity} × {item.name}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-400">
                        {t("barista.noteLabel")}: {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="button-primary mt-4 w-full"
                onClick={() => markServed(order.id)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("barista.markServed")}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
