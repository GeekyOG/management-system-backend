const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Vendor extends Model {}

Vendor.init(
  {
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Vendor",
  }
);

module.exports = Vendor;
