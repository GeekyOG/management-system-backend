// models/SaleItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Sale = require("./Sale"); // Ensure this import is correct
const Product = require("./Product"); // Ensure this import is correct

const SaleItem = sequelize.define(
  "SaleItem",
  {
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sale, // This should be the correct model reference
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product, // This should be the correct model reference
        key: "id",
      },
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = SaleItem;
