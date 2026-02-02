import { z } from "zod";
import { query } from "../db.js";

const settingsSchema = z.object({
  taxRate: z.number().min(0).max(1),
  cafeName: z.string().min(2),
  cafeAddress: z.string().min(2),
  currencySymbol: z.string().min(1).max(6),
  currencyPosition: z.enum(["prefix", "suffix"]),
});

export async function getSettings(req, res, next) {
  try {
    const result = await query("SELECT key, value FROM settings");
    const map = result.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return res.json({
      taxRate: Number(map.tax_rate ?? 0.2),
      cafeName: map.cafe_name ?? "Café Premium",
      cafeAddress: map.cafe_address ?? "Adresse non définie",
      currencySymbol: map.currency_symbol ?? "€",
      currencyPosition: map.currency_position ?? "suffix",
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const {
      taxRate,
      cafeName,
      cafeAddress,
      currencySymbol,
      currencyPosition,
    } = settingsSchema.parse(req.body);

    await query(
      `
      INSERT INTO settings (key, value)
      VALUES ('tax_rate', $1), ('cafe_name', $2), ('cafe_address', $3),
             ('currency_symbol', $4), ('currency_position', $5)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `,
      [String(taxRate), cafeName, cafeAddress, currencySymbol, currencyPosition]
    );

    return res.json({
      taxRate,
      cafeName,
      cafeAddress,
      currencySymbol,
      currencyPosition,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}
