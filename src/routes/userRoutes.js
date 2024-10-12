const express = require("express");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");
const auth = require("../middleware/authMiddleware");

const {
  getAllUsers,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const router = express.Router();
router.use(enforceMultiTenancy);

router.get("/users", auth, permissionsMiddleware("read_user"), getAllUsers);

router.post("/users", auth, permissionsMiddleware("create_user"), createUser);

router.get("/users/:id", auth, permissionsMiddleware("read_user"), getUserById);

router.put(
  "/users/:id",
  auth,
  permissionsMiddleware("update_user"),
  updateUser
);

router.delete(
  "/users/:id",
  auth,
  permissionsMiddleware("delete_user"),
  deleteUser
);

module.exports = router;
