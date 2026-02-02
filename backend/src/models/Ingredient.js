import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

class Ingredient extends Model {}

Ingredient.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    stockQuantity: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "stock_quantity",
    },
    alertThreshold: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "alert_threshold",
    },
  },
  {
    sequelize,
    tableName: "ingredients",
    timestamps: false,
  }
);

export default Ingredient;
