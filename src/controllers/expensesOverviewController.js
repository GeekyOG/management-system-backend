const Expenses = require("../models/Expenses");
const { Op } = require("sequelize");

// Get expenses for the current day

const calculateExpense = async (startDate, endDate) => {
  const expenses = await Expenses.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  // Calculate the profit by subtracting the cost from amount_paid for each sale item
  const totalExpense = expenses.reduce((acc, item) => {
    const expense = item.amount;
    return parseInt(acc) + parseInt(expense);
  }, 0);

  return { totalExpense, expenses };
};

exports.getExpense = async (req, res) => {
  const { filter, startDate, endDate } = req.query;

  try {
    let start, end;

    const convertToUTC = (date) => {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    };

    // Determine date range based on the filter
    switch (filter) {
      case "day":
        start = new Date();
        start.setHours(0, 0, 0, 0); // Start of the day
        end.setDate(start.getDate() - 1);
        end = new Date();
        end.setHours(23, 59, 59, 999); // End of the day

        break;

      case "week":
        start = new Date();
        start.setDate(start.getDate() - start.getDay()); // Start of the week
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setDate(start.getDate() + 6); // End of the week
        end.setHours(23, 59, 59, 999);
        break;

      case "month":
        start = new Date();
        start.setMonth(start.getMonth(), 1); // Start of the month
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // End of the month
        end.setHours(23, 59, 59, 999);
        break;

      case "previousMonth":
        start = new Date();
        start.setMonth(start.getMonth() - 1, 1); // Start of the previous month
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        // end.setDate(end.getDate() - 1); // End of the previous month
        end.setHours(23, 59, 59, 999);
        break;

      case "quarter":
        const currentMonth = new Date().getMonth() + 1;
        const quarter = Math.ceil(currentMonth / 3);
        start = new Date(new Date().getFullYear(), (quarter - 1) * 3, 1);
        end = new Date(new Date().getFullYear(), quarter * 3, 0);
        break;

      case "year":
        start = new Date(new Date().getFullYear(), 0, 1); // Start of the year
        end = new Date(new Date().getFullYear(), 11, 31); // End of the year
        break;

      case "all-time":
        start = new Date(0); // Since UNIX epoch (January 1, 1970)
        end = new Date(); // Current date
        break;

      default:
        // If no filter or "custom" filter, use custom date range
        if (!startDate || !endDate) {
          return res.status(400).json({
            message: "Please provide a valid date range or filter option.",
          });
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
    }

    // Calculate profit within the date range
    const totalExpense = await calculateExpense(start, end);

    return res.status(200).json({
      message: "Total Expense calculated successfully",
      filter,
      totalExpense,
      startDate: start,
      endDate: end,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
