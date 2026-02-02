import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";
import { Download } from "lucide-react";
import { formatPrice } from "../utils/formatPrice.js";
import { generatePDFReport } from "../utils/generatePDFReport.js";
import { useTranslation } from "react-i18next";

export default function ZReport() {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [items, setItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cafeName, setCafeName] = useState("Café");
  const [currency, setCurrency] = useState({ symbol: "€", position: "suffix" });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [zReport, zItems, zIngredients, settings] = await Promise.all([
          apiFetch("/reports/z"),
          apiFetch("/reports/z/items"),
          apiFetch("/reports/z/ingredients"),
          apiFetch("/settings"),
        ]);
        setReport(zReport);
        setItems(zItems.items || []);
        setIngredients(zIngredients.ingredients || []);
        setCafeName(settings.cafeName || "Café");
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

  const handleGenerate = () => {
    if (!report) return;
    generatePDFReport({
      cafeName,
      reportDate: report.date,
      items,
      ingredients,
      summary: {
        totalCash: report.byPayment?.cash || 0,
        totalCard: report.byPayment?.card || 0,
        totalVat: items.reduce((sum, item) => sum + (item.totalTtc - item.totalHt), 0),
      },
      currency,
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
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {t("zreport.title")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{t("zreport.subtitle")}</h2>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {report && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t("common.date")}</p>
                <p className="text-slate-400">{report.date}</p>
              </div>
              <button className="button-secondary no-print" onClick={handleGenerate}>
                <Download className="mr-2 h-4 w-4" />
                {t("common.generatePdf")}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">{t("zreport.totalSales")}</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(report.totalSales, currency.symbol, currency.position)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("zreport.coffeesSold")}</p>
                <p className="text-2xl font-semibold">{report.coffeesSold}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("common.payment")}</p>
                <div className="text-sm text-slate-300">
                  <p>
                    {t("common.cash")}: {formatPrice(report.byPayment.cash || 0, currency.symbol, currency.position)}
                  </p>
                  <p>
                    {t("common.card")}: {formatPrice(report.byPayment.card || 0, currency.symbol, currency.position)}
                  </p>
                  <p>
                    {t("common.mixed")}: {formatPrice(report.byPayment.mixed || 0, currency.symbol, currency.position)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-semibold">{t("zreport.salesByItem")}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2 text-left font-medium">{t("zreport.product")}</th>
                    <th className="py-2 text-right font-medium">{t("common.quantity")}</th>
                    <th className="py-2 text-right font-medium">{t("zreport.totalHt")}</th>
                    <th className="py-2 text-right font-medium">{t("zreport.totalTtc")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.length === 0 ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={4}>
                        {t("common.none")}
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.name}>
                        <td className="py-3 font-semibold text-slate-100">{item.name}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">
                          {formatPrice(item.totalHt, currency.symbol, currency.position)}
                        </td>
                        <td className="py-3 text-right">
                          {formatPrice(item.totalTtc, currency.symbol, currency.position)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-semibold">{t("zreport.ingredientsUsed")}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2 text-left font-medium">{t("zreport.ingredient")}</th>
                    <th className="py-2 text-right font-medium">{t("common.quantity")}</th>
                    <th className="py-2 text-right font-medium">{t("common.unit")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ingredients.length === 0 ? (
                    <tr>
                      <td className="py-4 text-slate-400" colSpan={3}>
                        {t("common.none")}
                      </td>
                    </tr>
                  ) : (
                    ingredients.map((ing) => (
                      <tr key={`${ing.name}-${ing.unit}`}>
                        <td className="py-3 font-semibold text-slate-100">{ing.name}</td>
                        <td className="py-3 text-right">
                          {Number(ing.quantityUsed).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">{ing.unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
