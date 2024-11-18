const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = sequelize.define(
  "Product",
  {
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sales_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serial_numbers: {
      type: DataTypes.JSON, // Store array of serial numbers as JSON
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
    timestamps: true,
  }
);

module.exports = Product;
