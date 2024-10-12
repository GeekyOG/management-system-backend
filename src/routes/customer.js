const express = require("express");
const customerController = require("../controllers/customerController");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();
const auth = require("../middleware/authMiddleware");
router.use(enforceMultiTenancy);

// Add a new customer
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_customer"),

  customerController.addCustomer
);

// Get all customers
router.get(
  "/",
  auth,
  permissionsMiddleware("read_customer"),

  customerController.getCustomers
);

// Get a customer by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_customer"),

  customerController.getCustomerById
);

// Update a customer
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_customer"),

  customerController.updateCustomer
);

// Delete a customer
router.delete(
  "/:id",
  auth,
  permissionsMiddleware("delete_customer"),

  customerController.deleteCustomer
);

module.exports = router;
