const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Business = sequelize.define(
  "Business",
  {
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Business;
