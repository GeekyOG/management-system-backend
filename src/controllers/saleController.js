const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Vendor = require("../models/Vendor");
const { Op } = require("sequelize");

// Add a new sale
exports.addSale = async (req, res) => {
  const { customerId, items, total_amount, total_paid } = req.body;
  const businessId = req.businessId;

  try {
    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Determine sale status based on payment
    let status = total_paid === total_amount ? "completed" : "pending";

    // Create the sale record with the appropriate status
    const sale = await Sale.create({
      customerId,
      total_amount,
      total_paid,
      status,
      businessId,
    });

    for (let item of items) {
      const { productId, serial_number, amount, amount_paid } = item;

      // Find the product
      const product = await Product.findByPk(productId);

      if (!product || !product.serial_numbers.includes(serial_number)) {
        return res
          .status(400)
          .json({ message: "Invalid product or serial number" });
      }

      // Remove the serial number from product and decrease quantity
      const updatedSerialNumbers = JSON.parse(product.serial_numbers).filter(
        (sn) => sn !== serial_number
      );

      // Update product
      await product.update({
        serial_numbers: updatedSerialNumbers,
      });

      // Add the sale item
      await SaleItem.create({
        saleId: sale.id,
        productId,
        serial_number,
        amount,
        amount_paid,
        businessId,
      });
    }

    return res.status(201).json({ message: "Sale added successfully", sale });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all sales
exports.getSales = async (req, res) => {
  const businessId = req.businessId;
  try {
    const sales = await SaleItem.findAll({
      where: { businessId },
      order: [["id", "DESC"]],
      include: [
        {
          model: Sale,
          where: { businessId },
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
        {
          model: Product,
          where: { businessId },
          include: [
            { model: Category, attributes: ["name"] },
            { model: Subcategory, attributes: ["name"] },
            {
              model: Vendor,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
      ],
      group: ["SaleId"],
    });

    return res.status(200).json(sales);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a sale by ID
exports.getSaleById = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const saleItems = await SaleItem.findAll({
      where: { saleId: id, businessId },
      include: [
        {
          model: Sale,
          where: { businessId },
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
        {
          model: Product,
          where: { businessId },
          include: [
            { model: Category, attributes: ["name"] },
            { model: Subcategory, attributes: ["name"] },
            {
              model: Vendor,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
      ],
    });

    if (!saleItems || saleItems.length === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.status(200).json(saleItems);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update a sale
exports.updateSale = async (req, res) => {
  const { id } = req.params; // saleId
  const { customerId, items, total_amount, total_paid, status } = req.body;
  const businessId = req.businessId;

  try {
    // Find the sale by its ID
    const sale = await Sale.findByPk({ where: { id, businessId } });
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.status === "returned") {
      return res
        .status(403)
        .json({ message: "Cannot update returned product" });
    }

    // Update the sale details
    await sale.update({ customerId, total_amount, total_paid, status });

    // Fetch all existing sale items for the current sale
    const existingSaleItems = await SaleItem.findAll({
      where: { saleId: id, businessId },
    });

    // Iterate over the sale items and update or create them as necessary
    const saleItemsPromises = items.map(async (item) => {
      const {
        id: saleItemId,
        productId,
        serial_number,
        amount,
        amount_paid,
      } = item;

      // If the status is "returned", restore serial numbers to the product
      if (status === "returned") {
        const product = await Product.findByPk(productId);
        if (product) {
          await product.update({
            serial_numbers: [
              ...JSON.parse(product.serial_numbers),
              serial_number,
            ],
          });
        }
      }

      if (saleItemId) {
        // Check if the SaleItem exists
        const existingSaleItem = await SaleItem.findByPk(saleItemId);
        if (existingSaleItem) {
          // If it exists, update the SaleItem
          return existingSaleItem.update({
            productId,
            serial_number,
            amount,
            amount_paid,
            businessId,
          });
        }
      }

      // If SaleItem does not exist (or saleItemId is not provided), create a new one
      return SaleItem.create({
        saleId: sale.id,
        productId,
        serial_number,
        amount,
        amount_paid,
        businessId,
      });
    });

    // Collect the IDs of items provided in the request
    const updatedItemIds = items.map((item) => item.id).filter(Boolean); // Filter out undefined/null values

    // Identify SaleItems that are not in the updated list and delete them
    const itemsToDelete = existingSaleItems.filter(
      (existingItem) => !updatedItemIds.includes(existingItem.id)
    );

    const deletePromises = itemsToDelete.map((itemToDelete) =>
      SaleItem.destroy({ where: { id: itemToDelete.id } })
    );

    // Wait for all sale items to be updated/created and old ones to be deleted
    await Promise.all([...saleItemsPromises, ...deletePromises]);

    return res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const sale = await Sale.findByPk({ where: { id, businessId } });
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Optionally, delete associated sale items here if needed
    await SaleItem.destroy({ where: { saleId: id, businessId } });

    await sale.destroy();

    return res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getAllCustomerSales = async (req, res) => {
  const { customerId } = req.params;
  const businessId = req.businessId;

  try {
    const saleItems = await SaleItem.findAll({
      include: [
        {
          model: Sale,
          where: { customerId, businessId }, // Include businessId in the query
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
          attributes: ["id", "total_amount", "total_paid", "status"], // Include relevant sale fields
        },
        {
          model: Product,
          attributes: ["product_name", "sales_price", "serial_numbers"],
        },
      ],
    });

    if (!saleItems.length) {
      return res
        .status(404)
        .json({ message: "No sale items found for this customer" });
    }

    res.json(saleItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sale items for customer" });
  }
};

// Search for a product containing the serial number
exports.findProductBySerialNumber = async (req, res) => {
  const { serialNumber } = req.params;
  const businessId = req.businessId;

  let fetchedProduct = null;
  let fetchedSaleItem = null;

  try {
    // Check if the serial number exists in the product's serial_numbers array
    const products = await Product.findAll({
      where: { businessId }, // Ensure products belong to the correct business
      include: [
        { model: Category, attributes: ["name"] },
        { model: Subcategory, attributes: ["name"] },
        {
          model: Vendor,
          attributes: ["first_name", "last_name", "email", "phone_number"],
        },
      ],
    });

    if (products) {
      const matchingProduct = products.find((product) => {
        // Parse the serial_numbers and check if the serialNumber exists
        const serialNumbers = JSON.parse(product.serial_numbers);
        return serialNumbers.includes(serialNumber);
      });

      // If a matching product is found, return its full details
      if (matchingProduct) {
        singleProduct = matchingProduct;
      }
    }

    // Check if the serial number exists in SaleItem's serial_number field
    const saleItem = await SaleItem.findOne({
      where: {
        serial_number: serialNumber, // Search by exact serial number
      },
      include: [
        {
          model: Sale,
          where: { businessId }, // Ensure sale is from the correct business
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
          attributes: ["id", "total_amount", "total_paid", "status"], // Include relevant sale fields
        },
        {
          model: Product,
          include: [Vendor],
          attributes: ["product_name", "sales_price", "serial_numbers"],
        },
      ],
    });

    if (saleItem) {
      fetchedSaleItem = saleItem;
    }

    // If neither product nor sale item is found, return a 404
    if (!fetchedProduct && !fetchedSaleItem) {
      return res.status(404).json({
        message: "No product or sale item found with that serial number.",
      });
    }

    // Return both product and saleItem (whichever is found)
    return res.status(200).json({
      product: singleProduct,
      saleItem: fetchedSaleItem,
    });
  } catch (error) {
    console.error("Error searching for product or sale item:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
