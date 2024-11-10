const Expenses = require("../models/Expenses");

// Create a new expense
const createExpense = async (req, res) => {
  try {
    const { spentOn, amount, addedBy, date } = req.body;
    const expense = await Expenses.create({
      spentOn,
      amount,
      addedBy,
      date,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error });
  }
};

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expenses.findAll();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving expenses", error });
  }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expenses.findByPk(id);
    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving expense", error });
  }
};

// Update an expense by ID
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { spentOn, amount, addedBy, date } = req.body;
    const expense = await Expenses.findByPk(id);

    if (expense) {
      expense.spentOn = spentOn || expense.spentOn;
      expense.amount = amount || expense.amount;
      expense.addedBy = addedBy || expense.addedBy;
      expense.date = date || expense.date;
      await expense.save();

      res.status(200).json(expense);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
};

// Delete an expense by ID
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expenses.findByPk(id);

    if (expense) {
      await expense.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
