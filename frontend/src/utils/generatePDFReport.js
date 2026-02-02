import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPrice } from "./formatPrice.js";

export function generatePDFReport({
  cafeName,
  reportDate,
  items,
  ingredients = [],
  summary,
  currency,
  labels = {},
}) {
  const doc = new jsPDF();
  const symbol = currency?.symbol || "€";
  const position = currency?.position || "suffix";
  const {
    reportTitle = "Rapport Z (Clôture)",
    itemsTitle = "Ventes par article",
    ingredientsTitle = "Ingrédients déstockés",
    product = "Produit",
    ingredient = "Ingrédient",
    quantity = "Quantité",
    unit = "Unité",
    totalHt = "Total HT",
    totalTtc = "Total TTC",
    summaryTitle = "Résumé financier",
    totalCash = "Total Cash",
    totalCard = "Total Carte",
    totalVat = "Total TVA",
    date = "Date",
  } = labels;

  doc.setFontSize(18);
  doc.text(cafeName || "Café", 14, 18);
  doc.setFontSize(11);
  doc.text(`${date}: ${reportDate}`, 14, 26);
  doc.text(reportTitle, 14, 32);

  doc.setFontSize(12);
  doc.text(itemsTitle, 14, 40);

  autoTable(doc, {
    startY: 46,
    head: [[product, quantity, totalHt, totalTtc]],
    body: items.map((row) => [
      row.name,
      String(row.quantity),
      formatPrice(row.totalHt, symbol, position),
      formatPrice(row.totalTtc, symbol, position),
    ]),
  });

  let nextY = doc.lastAutoTable.finalY + 8;

  if (ingredients.length > 0) {
    doc.setFontSize(12);
    doc.text(ingredientsTitle, 14, nextY);
    autoTable(doc, {
      startY: nextY + 6,
      head: [[ingredient, quantity, unit]],
      body: ingredients.map((row) => [
        row.name,
        Number(row.quantityUsed).toFixed(2),
        row.unit,
      ]),
    });
    nextY = doc.lastAutoTable.finalY + 8;
  }

  doc.setFontSize(12);
  doc.text(summaryTitle, 14, nextY);
  doc.setFontSize(10);
  doc.text(
    `${totalCash}: ${formatPrice(summary.totalCash, symbol, position)}`,
    14,
    nextY + 8
  );
  doc.text(
    `${totalCard}: ${formatPrice(summary.totalCard, symbol, position)}`,
    14,
    nextY + 14
  );
  doc.text(
    `${totalVat}: ${formatPrice(summary.totalVat, symbol, position)}`,
    14,
    nextY + 20
  );

  doc.save(`z-report-${reportDate}.pdf`);
}
