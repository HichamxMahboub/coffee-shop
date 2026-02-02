import sequelize from "./sequelize.js";
import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import Inventory from "./Inventory.js";
import ProductIngredient from "./ProductIngredient.js";
import ProductVariant from "./ProductVariant.js";
import Ingredient from "./Ingredient.js";
import RecipeItem from "./RecipeItem.js";
import Setting from "./Setting.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

// Associations principales
Category.hasMany(Product, { foreignKey: "categorie_id" });
Product.belongsTo(Category, { foreignKey: "categorie_id" });

Product.hasMany(ProductVariant, { foreignKey: "product_id" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id" });

ProductVariant.belongsToMany(Ingredient, {
  through: RecipeItem,
  foreignKey: "product_variant_id",
  otherKey: "ingredient_id",
});
Ingredient.belongsToMany(ProductVariant, {
  through: RecipeItem,
  foreignKey: "ingredient_id",
  otherKey: "product_variant_id",
});

RecipeItem.belongsTo(ProductVariant, { foreignKey: "product_variant_id" });
RecipeItem.belongsTo(Ingredient, { foreignKey: "ingredient_id" });

Product.belongsToMany(Inventory, {
  through: ProductIngredient,
  foreignKey: "product_id",
  otherKey: "ingredient_id",
});
Inventory.belongsToMany(Product, {
  through: ProductIngredient,
  foreignKey: "ingredient_id",
  otherKey: "product_id",
});

User.hasMany(Order, { foreignKey: "utilisateur_id" });
Order.belongsTo(User, { foreignKey: "utilisateur_id" });

Order.hasMany(OrderItem, { foreignKey: "commande_id" });
OrderItem.belongsTo(Order, { foreignKey: "commande_id" });

Product.hasMany(OrderItem, { foreignKey: "produit_id" });
OrderItem.belongsTo(Product, { foreignKey: "produit_id" });

export {
  sequelize,
  User,
  Category,
  Product,
  Inventory,
  ProductIngredient,
  ProductVariant,
  Ingredient,
  RecipeItem,
  Setting,
  Order,
  OrderItem,
};
