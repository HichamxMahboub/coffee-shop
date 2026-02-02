import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize.js";

class Setting extends Model {}

Setting.init(
  {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "settings",
    timestamps: false,
  }
);

export default Setting;
