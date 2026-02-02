import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Modèle catégorie produit
class Category extends Model {}

Category.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
