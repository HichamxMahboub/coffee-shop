import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Modèle commande
class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utilisateurId: {
      type: DataTypes.INTEGER,
      field: "utilisateur_id",
      allowNull: true,
    },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    typePaiement: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "type_paiement",
    },
    dateCreation: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "date_creation",
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: false,
  }
);

export default Order;
