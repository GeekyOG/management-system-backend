const express = require("express");
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();

// Create a new product
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_product"),

  productController.addProduct
);

// Get all products
router.get(
  "/",
  auth,
  permissionsMiddleware("read_product"),

  productController.getProducts
);

// Get a product by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_product"),

  productController.getProductById
);

// Update a product by ID
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_product"),

  productController.updateProduct
);

// Delete a product by ID
router.delete(
  "/:id",
  auth,
  permissionsMiddleware("delete_product"),

  productController.deleteProduct
);

router.get(
  "/serial-numbers/:product_name",
  auth,
  permissionsMiddleware("read_product"),

  productController.getSerialNumbersByProductName
);
module.exports = router;
