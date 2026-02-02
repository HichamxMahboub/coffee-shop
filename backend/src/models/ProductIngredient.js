import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Table de liaison produit -> ingrédients
class ProductIngredient extends Model {}

ProductIngredient.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      field: "product_id",
      primaryKey: true,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      field: "ingredient_id",
      primaryKey: true,
    },
    quantiteParUnite: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      field: "quantite_par_unite",
    },
  },
  {
    sequelize,
    tableName: "product_ingredients",
    timestamps: false,
  }
);

export default ProductIngredient;
