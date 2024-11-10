const express = require("express");
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expensesController");

// Route to create a new expense
router.post("/", createExpense);

// Route to get all expenses
router.get("/", getAllExpenses);

// Route to get a single expense by ID
router.get("/:id", getExpenseById);

// Route to update an expense by ID
router.put("/:id", updateExpense);

// Route to delete an expense by ID
router.delete("/:id", deleteExpense);

module.exports = router;
