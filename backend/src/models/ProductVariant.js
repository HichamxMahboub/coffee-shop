import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: {
      type: DataTypes.INTEGER,
      field: "product_id",
      allowNull: false,
    },
    size: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, field: "is_active", defaultValue: true },
  },
  {
    sequelize,
    tableName: "product_variants",
    timestamps: false,
  }
);

export default ProductVariant;
