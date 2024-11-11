const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/product");
const vendorRoutes = require("./routes/vendor");
const categoryRoutes = require("./routes/category");
const subcategoryRoutes = require("./routes/subcategory");
const customerRoutes = require("./routes/customer");
const salesRoutes = require("./routes/sale");
const countRoutes = require("./routes/count");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const profitRoutes = require("./routes/profitRoutes");
const expenseRoutes = require("./routes/expenses");
const expenseOverview = require("./routes/expensesOverviewRoute");
const sequelize = require("./config/database");

const {
  Role,
  Permission,
  RoleHasPermission,
  Product,
  Vendor,
  Category,
  Subcategory,
} = require("./models/associations");

// Use models as needed in your app

require("dotenv").config();
const cors = require("cors");

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());

app.use(cors());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/counts", countRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/profits", profitRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/calculate-expenses", expenseOverview);

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error syncing tables: ", err));
