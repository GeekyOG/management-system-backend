const express = require("express");
const saleController = require("../controllers/saleController");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();

// Add a new sale
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_order"),
  saleController.addSale
);

// Get all sales
router.get(
  "/",
  auth,
  permissionsMiddleware("read_order"),
  saleController.getSales
);

// Get a sale by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_order"),
  saleController.getSaleById
);

router.get("/:customerId/customer", saleController.getAllCustomerSales);

// Update a sale
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_order"),
  saleController.updateSale
);

// Update sale status
// router.put("/status/:id", saleController.updateSaleStatus);

// Delete a sale
router.delete(
  "/:id",

  auth,
  permissionsMiddleware("delete_order"),
  saleController.deleteSale
);

module.exports = router;
