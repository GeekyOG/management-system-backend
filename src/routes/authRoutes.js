const express = require("express");
const userController = require("../controllers/authController");

const router = express.Router();
router.use(enforceMultiTenancy);

// Register route
router.post("/register", userController.register);

// Login route
router.post("/login", userController.login);

// Forgot password route
router.post("/forgot-password", userController.forgotPassword);

// Reset password route
router.post("/reset-password", userController.resetPassword);

// Update user and business details route
router.put("/update-profile", authMiddleware, userController.updateProfile);
module.exports = router;
