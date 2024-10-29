const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Vendor = require("../models/Vendor");
const sequelize = require("../config/database");

// Add a new product
exports.addProduct = async (req, res) => {
  const {
    product_name,
    size,
    quantity,
    purchase_amount,
    sales_price,
    vendorId,
    serial_numbers,
    soldBy,
    date,
  } = req.body;

  try {
    // Create the product
    const newProduct = await Product.create({
      product_name,
      size,
      quantity,
      purchase_amount,
      sales_price,
      vendorId,
      serial_numbers,
      soldBy,
      date: date && date.trim() !== "" ? new Date(date) : new Date(),
    });

    return res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: Vendor,
          attributes: ["first_name", "last_name", "email", "phone_number"],
        },
      ],
    });

    return res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Vendor,
          attributes: ["first_name", "last_name", "email", "phone_number"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    size,
    quantity,
    purchase_amount,
    sales_price,
    vendorId,
    serial_numbers,
    date,
  } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({
      product_name,
      size,
      quantity,
      purchase_amount,
      sales_price,
      vendorId,
      serial_numbers,
      date,
    });

    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Fetch serial numbers by product name
exports.getSerialNumbersByProductName = async (req, res) => {
  const { product_name } = req.params; // Extract product name from URL parameters

  try {
    // Find all products by name
    const products = await Product.findAll({ where: { product_name } });

    if (products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }

    // Map through all found products to extract serial numbers and productId
    const serialNumbers = products.flatMap((product) => {
      return JSON.parse(product.serial_numbers).map((serial_number) => ({
        serial_number,
        productId: product.id,
      }));
    });

    return res.status(200).json(serialNumbers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getAllVendorProducts = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const products = await Product.findAll({
      where: { vendorId },
      order: [["id", "DESC"]],
      include: [
        {
          model: Vendor,
          as: "Vendor",
          attributes: ["first_name", "last_name", "email", "phone_number"],
        },
      ],
    });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this vendor" });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products for vendor" });
  }
};
