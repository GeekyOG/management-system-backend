const express = require("express");
const subcategoryController = require("../controllers/subcategoryController");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();

// Create a new subcategory
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_subcategory"),
  subcategoryController.addSubcategory
);

// Get all subcategories
router.get(
  "/",
  auth,
  permissionsMiddleware("read_subcategory"),
  subcategoryController.getSubcategories
);

// Get a subcategory by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_subcategory"),
  subcategoryController.getSubcategoryById
);

// Update a subcategory by ID
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_subcategory"),
  subcategoryController.updateSubcategory
);

// Delete a subcategory by ID
router.delete(
  "/:id",
  auth,
  permissionsMiddleware("delete_subcategory"),
  subcategoryController.deleteSubcategory
);

module.exports = router;
