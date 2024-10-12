const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const SaleItem = require("../models/SaleItem");
const { Sequelize } = require("sequelize");
// Get total counts for sales, products, and customers
exports.getTotals = async (req, res) => {
  try {
    // Count the total number of sales, products, and customers
    const totalSales = await Sale.count();
    const totalProducts = await Product.count();
    const totalCustomers = await Customer.count();

    return res.status(200).json({
      totalSales,
      totalProducts,
      totalCustomers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    // Total expenses: Total spent on buying products
    const totalExpensesResult = await Product.findAll({
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.literal("purchase_amount * quantity")),
          "totalExpenses",
        ],
      ],
      raw: true,
    });

    const totalExpenses = totalExpensesResult[0].totalExpenses || 0;

    // Total worth of store

    const totalWorthResult = await Product.findAll({
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("purchase_amount * JSON_LENGTH(serial_numbers)")
          ),
          "totalWorth",
        ],
      ],
      raw: true,
    });

    const totalWorth = totalWorthResult[0].totalWorth || 0;

    // Total profit: Sum of (sales_price - purchase_price) for sold products
    const totalProfitResult = await SaleItem.findAll({
      include: [
        { model: Product, attributes: ["purchase_amount", "sales_price"] },
        { model: Sale, where: { status: "completed" } },
      ],
    });

    const totalProfit = totalProfitResult.reduce((acc, saleItem) => {
      const profitPerItem = saleItem.amount - saleItem.Product.purchase_amount;
      return acc + profitPerItem;
    }, 0);

    // Total pending payments: Total amount of pending payments (difference between total_amount and total_paid for pending sales)
    const totalPendingPaymentsResult = await Sale.sum("total_amount", {
      where: { status: "pending" },
    });
    const totalPaidResult = await Sale.sum("total_paid", {
      where: { status: "pending" },
    });
    const totalPendingPayments = totalPaidResult;
    // (totalPendingPaymentsResult || 0) - (totalPaidResult || 0);

    // Send the summary back
    return res.status(200).json({
      total_profit: totalProfit,
      total_expenses: totalExpenses,
      total_pending_payments: totalPendingPayments,
      total_worth: totalWorth,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
