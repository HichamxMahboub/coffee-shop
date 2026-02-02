import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Modèle inventaire des ingrédients
class Inventory extends Model {}

Inventory.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomIngredient: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nom_ingredient",
    },
    quantiteActuelle: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "quantite_actuelle",
    },
    unite: { type: DataTypes.STRING, allowNull: false },
    seuilAlerte: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "seuil_alerte",
    },
  },
  {
    sequelize,
    tableName: "inventory",
    timestamps: false,
  }
);

export default Inventory;
