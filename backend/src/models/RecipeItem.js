import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

class RecipeItem extends Model {}

RecipeItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productVariantId: {
      type: DataTypes.INTEGER,
      field: "product_variant_id",
      allowNull: false,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      field: "ingredient_id",
      allowNull: false,
    },
    quantityNeeded: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "quantity_needed",
    },
  },
  {
    sequelize,
    tableName: "recipe_items",
    timestamps: false,
  }
);

export default RecipeItem;
