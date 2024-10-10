// models/Sale.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Customer = require("./Customer");

class Sale extends Model {}

Sale.init(
  {
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
    },

    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_paid: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("completed", "pending", "returned", "borrowed"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Sale",
  }
);

module.exports = Sale;
