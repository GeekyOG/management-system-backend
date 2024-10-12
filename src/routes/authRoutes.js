const express = require("express");
const userController = require("../controllers/authController");

const router = express.Router();

// Register route
router.post("/register", userController.register);

// Login route
router.post("/login", userController.login);

// Forgot password route
router.post("/forgot-password", userController.forgotPassword);

// Reset password route
router.post("/reset-password", userController.resetPassword);

module.exports = router;
