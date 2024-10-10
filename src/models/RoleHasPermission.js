const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Role = require("./Role");
const Permission = require("./Permission");

const RoleHasPermission = sequelize.define(
  "RoleHasPermission",
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role, // You can refer to the model name here instead of the import to avoid circular dependency
        key: "id",
      },
      onDelete: "CASCADE",
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: "id",
      },
      onDelete: "CASCADE",
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "RoleHasPermissions",
  }
);

module.exports = RoleHasPermission;
