import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

// Modèle produit
class Product extends Model {}

Product.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    categorieId: {
      type: DataTypes.INTEGER,
      field: "categorie_id",
      allowNull: true,
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, field: "is_active", defaultValue: true },
    imageUrl: { type: DataTypes.TEXT, field: "image_url", allowNull: true },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false,
  }
);

export default Product;
