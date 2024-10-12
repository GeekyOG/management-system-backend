const Role = require("./Role");
const Permission = require("./Permission");
const RoleHasPermission = require("./RoleHasPermission");
const Product = require("./Product");
const Category = require("./Category");
const Subcategory = require("./Subcategory");
const Vendor = require("./Vendor");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const Customer = require("./Customer");
const Business = require("./Business");
const User = require("./User");

// Defining associations
Role.hasMany(RoleHasPermission, { foreignKey: "roleId" });
Role.belongsToMany(Permission, {
  through: RoleHasPermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "Permissions", // Use the alias 'Permissions'
});

Permission.belongsToMany(Role, {
  through: RoleHasPermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "Roles", // Use the alias 'Roles'
});
Permission.hasMany(RoleHasPermission, { foreignKey: "permissionId" });
RoleHasPermission.belongsTo(Role, { foreignKey: "roleId" });
RoleHasPermission.belongsTo(Permission, { foreignKey: "permissionId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });
Product.belongsTo(Subcategory, { foreignKey: "subcategoryId" });
Product.belongsTo(Vendor, { foreignKey: "vendorId" });
Sale.belongsTo(Customer, { foreignKey: "customerId" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });
Subcategory.belongsTo(Category, { foreignKey: "categoryId" });
User.belongsTo(Role, { foreignKey: "roleId" });
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Business, { foreignKey: "businessId" });
Business.hasMany(User, { foreignKey: "businessId" });
// Export models for use in other parts of the app
module.exports = {
  Role,
  Permission,
  RoleHasPermission,
  Product,
  Category,
  Subcategory,
  Vendor,
  Sale,
  Business,
};
