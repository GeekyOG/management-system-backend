const express = require("express");
const router = express.Router();
const { createRole, getAllRoles } = require("../controllers/roleController");
const auth = require("../middleware/authMiddleware");

const permissionsMiddleware = require("../middleware/permissionsMiddleware");

// Create a new role
router.post("/", auth, permissionsMiddleware("create_role"), createRole);

// Get all roles
router.get("/", auth, permissionsMiddleware("read_role"), getAllRoles);

module.exports = router;
