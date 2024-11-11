const express = require("express");
const router = express.Router();
const { getExpense } = require("../controllers/expensesOverviewController");

// Route to get calculated expenses
router.get("/", getExpense);

module.exports = router;
