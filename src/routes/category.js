const express = require("express");
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();
router.use(enforceMultiTenancy);

// Create a new category
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_category"),

  categoryController.addCategory
);

// Get all categories
router.get(
  "/",
  auth,
  permissionsMiddleware("read_category"),

  categoryController.getCategories
);

// Get a category by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_category"),

  categoryController.getCategoryById
);

// Update a category by ID
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_category"),

  categoryController.updateCategory
);

// Delete a category by ID
router.delete(
  "/:id",
  auth,
  permissionsMiddleware("delete_category"),

  categoryController.deleteCategory
);

module.exports = router;
