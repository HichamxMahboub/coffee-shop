import React, { useEffect, useState } from "react";
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
import { formatPrice } from "../utils/formatPrice.js";
import { generatePDFReport } from "../utils/generatePDFReport.js";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [currency, setCurrency] = useState({ symbol: "€", position: "suffix" });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiFetch("/dashboard");
        setData(result);
        const settings = await apiFetch("/settings");
        setCurrency({
          symbol: settings.currencySymbol || "€",
          position: settings.currencyPosition || "suffix",
        });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const settings = await apiFetch("/settings");
      const zReport = await apiFetch("/reports/z");
      const zItems = await apiFetch("/reports/z/items");
      const zIngredients = await apiFetch("/reports/z/ingredients");

      const summary = {
        totalCash: zReport.byPayment?.cash || 0,
        totalCard: zReport.byPayment?.card || 0,
        totalVat: zItems.totalVat || 0,
      };

      generatePDFReport({
        cafeName: settings.cafeName,
        reportDate: zReport.date,
        items: zItems.items || [],
        ingredients: zIngredients.ingredients || [],
        summary,
        currency: {
          symbol: settings.currencySymbol || "€",
          position: settings.currencyPosition || "suffix",
        },
        labels: {
          reportTitle: t("zreport.subtitle"),
          itemsTitle: t("zreport.salesByItem"),
          ingredientsTitle: t("zreport.ingredientsUsed"),
          product: t("zreport.product"),
          ingredient: t("zreport.ingredient"),
          quantity: t("common.quantity"),
          unit: t("common.unit"),
          totalHt: t("zreport.totalHt"),
          totalTtc: t("zreport.totalTtc"),
          summaryTitle: t("zreport.summary"),
          totalCash: t("common.cash"),
          totalCard: t("common.card"),
          totalVat: t("common.tax"),
          date: t("common.date"),
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {t("analytics.title")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{t("analytics.subtitle")}</h2>
      </div>

      <button type="button" className="button-secondary w-fit" onClick={handleGenerateReport}>
        <Download className="mr-2 h-4 w-4" />
        {t("common.generatePdf")}
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm font-semibold">{t("analytics.dailyRevenue")}</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueByDay || []}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Line type="monotone" dataKey="total" stroke="#c28f62" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-semibold">{t("analytics.topSelling")}</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm font-semibold">{t("analytics.rushHours")}</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueByHour || []}>
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Bar dataKey="total" fill="#9c7b52" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-semibold">{t("analytics.revenueByPayment")}</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueByPayment || []}>
                <XAxis dataKey="method" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    formatPrice(value, currency.symbol, currency.position)
                  }
                />
                <Bar dataKey="total" fill="#c28f62" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
