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

  const businessId = req.businessId;

  try {
    // Create the product with businessId
    const newProduct = await Product.create({
      product_name,
      categoryId,
      subcategoryId,
      quantity,
      purchase_amount,
      sales_price,
      vendorId,
      serial_numbers,
      businessId, // Include businessId
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

// Get all products for a specific business
exports.getProducts = async (req, res) => {
  const businessId = req.businessId;

  try {
    const products = await Product.findAll({
      where: { businessId }, // Filter by businessId
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

// Get a single product by ID for a specific business
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const product = await Product.findOne({
      where: { id, businessId }, // Filter by id and businessId
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

// Update a product for a specific business
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

  const businessId = req.businessId;

  try {
    const product = await Product.findOne({
      where: { id, businessId }, // Filter by id and businessId
    });

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

// Delete a product for a specific business
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const product = await Product.findOne({
      where: { id, businessId }, // Filter by id and businessId
    });

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

// Fetch serial numbers by product name for a specific business
exports.getSerialNumbersByProductName = async (req, res) => {
  const { product_name } = req.params; // Extract product name from URL parameters
  const businessId = req.businessId;

  try {
    // Find all products by name and businessId
    const products = await Product.findAll({
      where: { product_name, businessId }, // Filter by product name and businessId
    });

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

// Get all products for a specific vendor
exports.getAllVendorProducts = async (req, res) => {
  const { vendorId } = req.params;
  const businessId = req.businessId;

  try {
    const products = await Product.findAll({
      where: { vendorId, businessId }, // Filter by vendorId and businessId
      order: [["id", "DESC"]],
      include: [
        { model: Category, attributes: ["name"] },
        { model: Subcategory, attributes: ["name"] },
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
