// models/Expenses.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Expenses extends Model {}

Expenses.init(
  {
    spentOn: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    addedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Samuel Udi",
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },

  {
    sequelize,
    modelName: "Expenses",
  }
);

module.exports = Expenses;
