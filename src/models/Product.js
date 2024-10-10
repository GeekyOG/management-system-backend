const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = sequelize.define("Product", {
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
    allowNull: false,
  },
  serial_numbers: {
    type: DataTypes.JSON, // Store array of serial numbers as JSON
    allowNull: false,
  },
});

module.exports = Product;
