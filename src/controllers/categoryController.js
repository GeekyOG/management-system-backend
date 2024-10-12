const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

// Add a new category
exports.addCategory = async (req, res) => {
  const { name } = req.body;
  const businessId = req.businessId;

  if (!name || !businessId) {
    return res
      .status(400)
      .json({ message: "Name and business ID are required." });
  }

  try {
    const category = await Category.create({ name, businessId });
    return res.status(201).json({ message: "Category added", category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  const businessId = req.businessId;

  try {
    const categories = await Category.findAll({
      where: { businessId }, // Filter by businessId
      order: [["id", "DESC"]],
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const category = await Category.findOne({
      where: { id, businessId }, // Filter by businessId
      include: [
        {
          model: Subcategory,
          attributes: ["name"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const businessId = req.businessId;

  try {
    const category = await Category.findOne({ where: { id, businessId } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({ name });

    return res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const businessId = req.businessId;

  try {
    const category = await Category.findOne({ where: { id, businessId } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();

    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
