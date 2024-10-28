const { Op } = require("sequelize");
const Sale = require("../models/Sale"); // Assuming Sale is your Sale model
const SaleItem = require("../models/SaleItem");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Helper function to calculate total profit based on time range
const calculateProfit = async (startDate, endDate) => {
  const sales = await SaleItem.findAll({
    include: [
      {
        model: Sale,
        order: [["date", "ASC"]],
        where: {
          status: "completed",
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: Customer,
            attributes: ["first_name", "last_name", "email", "phone_number"],
          },
        ],
      },
      { model: Product },
    ],
  });

  // Calculate the profit by subtracting the cost from amount_paid for each sale item
  const totalProfit = sales.reduce((acc, saleItem) => {
    const profitPerItem =
      saleItem.amount_paid - saleItem.Product.purchase_amount;
    return acc + profitPerItem;
  }, 0);

  return { totalProfit, sales };
};

exports.getProfit = async (req, res) => {
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
        start = convertToUTC(start);
        end = new Date();
        end.setHours(23, 59, 59, 999); // End of the day
        end = convertToUTC(end);
        break;

      case "week":
        start = new Date();
        start.setDate(start.getDate() - start.getDay()); // Start of the week
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setDate(start.getDate() + 6); // End of the week
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
    const totalProfit = await calculateProfit(start, end);

    return res.status(200).json({
      message: "Total profit calculated successfully",
      filter,
      totalProfit,
      startDate: start,
      endDate: end,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getAllPending = async (req, res) => {
  try {
    const sales = await SaleItem.findAll({
      include: [
        {
          model: Sale,
          where: { status: "pending" },
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
        { model: Product },
      ],
    });
    return res.status(200).json({
      sales,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
