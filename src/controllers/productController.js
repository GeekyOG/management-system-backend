const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Vendor = require("../models/Vendor");

// Add a new product
exports.addProduct = async (req, res) => {
  const {
    product_name,
    categoryId,
    subcategoryId,
    quantity,
    purchase_amount,
    sales_price,
    vendorId,
    serial_numbers,
  } = req.body;

  try {
    // Create the product
    const newProduct = await Product.create({
      product_name,
      categoryId,
      subcategoryId,
      quantity,
      purchase_amount,
      sales_price,
      vendorId,
      serial_numbers,
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
        { model: Category, attributes: ["name"] },
        { model: Subcategory, attributes: ["name"] },
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
        { model: Category, attributes: ["name"] },
        { model: Subcategory, attributes: ["name"] },
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
    categoryId,
    subcategoryId,
    quantity,
    purchase_amount,
    sales_price,
    vendorId,
    serial_numbers,
  } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({
      product_name,
      categoryId,
      subcategoryId,
      quantity,
      purchase_amount,
      sales_price,
      vendorId,
      serial_numbers,
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
    // Find the product by name
    const product = await Product.findOne({ where: { product_name } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Extract serial numbers and productId
    const serialNumbers = JSON.parse(product.serial_numbers).map(
      (serial_number) => ({
        serial_number,
        productId: product.id,
      })
    );

    return res.status(200).json(serialNumbers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
