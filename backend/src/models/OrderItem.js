import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Lignes de commande
class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commandeId: {
      type: DataTypes.INTEGER,
      field: "commande_id",
      allowNull: false,
    },
    produitId: {
      type: DataTypes.INTEGER,
      field: "produit_id",
      allowNull: true,
    },
    quantite: { type: DataTypes.INTEGER, allowNull: false },
    prixUnitaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "prix_unitaire",
    },
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: false,
  }
);

export default OrderItem;
