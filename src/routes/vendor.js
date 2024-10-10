const express = require("express");
const vendorController = require("../controllers/vendorController");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();

// Create a new vendor
router.post(
  "/add",
  auth,
  permissionsMiddleware("create_vendor"),
  vendorController.addVendor
);

// Get all vendors
router.get(
  "/",
  auth,
  permissionsMiddleware("read_vendor"),
  vendorController.getVendors
);

// Get a vendor by ID
router.get(
  "/:id",
  auth,
  permissionsMiddleware("read_vendor"),
  vendorController.getVendorById
);

// Update a vendor by ID
router.put(
  "/:id",
  auth,
  permissionsMiddleware("update_vendor"),
  vendorController.updateVendor
);

// Delete a vendor by ID
router.delete(
  "/:id",
  auth,
  permissionsMiddleware("delete_vendor"),
  vendorController.deleteVendor
);

module.exports = router;
