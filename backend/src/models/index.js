import sequelize from "./sequelize.js";
import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import Inventory from "./Inventory.js";
import ProductIngredient from "./ProductIngredient.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

// Associations principales
Category.hasMany(Product, { foreignKey: "categorie_id" });
Product.belongsTo(Category, { foreignKey: "categorie_id" });

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
  Order,
  OrderItem,
};
