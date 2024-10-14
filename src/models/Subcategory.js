const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

class Subcategory extends Model {}

Subcategory.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Subcategory",
  }
);

module.exports = Subcategory;
