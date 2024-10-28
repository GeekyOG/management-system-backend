const express = require("express");
const countController = require("../controllers/counts");
const auth = require("../middleware/authMiddleware");
const permissionsMiddleware = require("../middleware/permissionsMiddleware");

const router = express.Router();

router.get(
  "/",
  auth,
  permissionsMiddleware("view_counts"),
  countController.getTotals
);

router.get(
  "/financial-summary",
  auth,
  permissionsMiddleware("view_counts"),
  countController.getFinancialSummary
);

module.exports = router;
