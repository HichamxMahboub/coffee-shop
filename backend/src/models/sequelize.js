import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Connexion Sequelize à PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;
