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
  const {
    customerId,
    items,
    total_amount,
    total_paid,
    invoiceNumber,
    date,
    check,
  } = req.body;

  try {
    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Determine sale status based on payment
    let status = check
      ? "borrowed"
      : parseInt(total_paid) === parseInt(total_amount)
      ? "completed"
      : "pending";

    // Create the sale record with the appropriate status
    const sale = await Sale.create({
      invoiceNumber,
      customerId,
      total_amount,
      total_paid,
      status,
      createdAt: date && date.trim() !== "" ? new Date(date) : new Date(),
    });

    for (let item of items) {
      const { productId, serial_number, amount, amount_paid, size } = item;

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
        size,
        createdAt: new Date(date),
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
  try {
    const sales = await SaleItem.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Sale,
          include: [
            {
              model: Customer,
              attributes: ["first_name", "last_name", "email", "phone_number"],
            },
          ],
        },
        {
          model: Product,
          include: [
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

  try {
    const saleItems = await SaleItem.findAll({
      where: { saleId: id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Sale,
          include: [
            {
              model: Customer,
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone_number",
              ],
            },
          ],
        },
        {
          model: Product,
          include: [
            {
              model: Vendor,
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone_number",
              ],
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
  const {
    customerId,
    items,
    total_amount,
    total_paid,
    status,
    invoiceNumber,
    date,
  } = req.body;

  try {
    // Find the sale by its ID
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.status === "returned") {
      return res
        .status(403)
        .json({ message: "Cannot update returned product" });
    }

    // Prepare updated sale data
    const updatedSaleData = {
      customerId,
      total_amount,
      total_paid,
      status,
      invoiceNumber,
    };

    // Update createdAt only if date is provided
    if (date) {
      updatedSaleData.createdAt = new Date(date);
    }

    // Update the sale details
    await sale.update(updatedSaleData);

    // Fetch all existing sale items for the current sale
    const existingSaleItems = await SaleItem.findAll({ where: { saleId: id } });

    // Collect existing sale item serial numbers
    const existingSerialNumbers = existingSaleItems.map(
      (item) => item.serial_number
    );

    // Collect new serial numbers from the request items
    const updatedSerialNumbers = items.map((item) => item.serial_number);

    // Find serial numbers that are in existing items but not in the updated items
    const serialNumbersToRestore = existingSerialNumbers.filter(
      (serial_number) => !updatedSerialNumbers.includes(serial_number)
    );

    // Restore these serial numbers to the respective products
    for (const serial_number of serialNumbersToRestore) {
      const saleItem = existingSaleItems.find(
        (item) => item.serial_number === serial_number
      );
      if (saleItem) {
        const product = await Product.findByPk(saleItem.productId);
        if (product) {
          await product.update({
            serial_numbers: [
              ...JSON.parse(product.serial_numbers),
              serial_number,
            ],
          });
        }
      }
    }

    // Iterate over the sale items and update or create them as necessary
    const saleItemsPromises = items.map(async (item) => {
      const {
        id: saleItemId,
        productId,
        serial_number,
        amount,
        amount_paid,
        size,
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

      // Prepare updated sale item data
      const updatedSaleItemData = {
        productId,
        serial_number,
        amount,
        amount_paid,
        size,
      };

      // Update createdAt only if date is provided
      if (date) {
        updatedSaleItemData.createdAt = new Date(date);
      }

      if (saleItemId) {
        // Check if the SaleItem exists
        const existingSaleItem = await SaleItem.findByPk(saleItemId);
        if (existingSaleItem) {
          // If it exists, update the SaleItem
          return existingSaleItem.update(updatedSaleItemData);
        }
      }

      // If SaleItem does not exist (or saleItemId is not provided), create a new one
      return SaleItem.create({
        saleId: sale.id,
        ...updatedSaleItemData,
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

  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Optionally, delete associated sale items here if needed
    await SaleItem.destroy({ where: { saleId: id } });

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

  try {
    const saleItems = await SaleItem.findAll({
      include: [
        {
          model: Sale,
          where: { customerId },
          include: [
            {
              model: Customer,
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone_number",
              ],
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

  let fetchedProduct = null;
  let fetchedSaleItem = null;

  try {
    // Check if the serial number exists in the product's serial_numbers array
    const products = await Product.findAll({
      include: [
        {
          model: Vendor,
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
          ],
        },
      ],
    });
    if (products) {
      fetchedProduct = products;
    }

    let singleProduct = null;

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
          include: [
            {
              model: Customer,
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone_number",
              ],
            },
          ],
          attributes: ["id", "total_amount", "total_paid", "status"], // Include relevant sale fields
        },
        {
          model: Product,
          include: [Vendor],
          attributes: ["id", "product_name", "sales_price", "serial_numbers"],
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
