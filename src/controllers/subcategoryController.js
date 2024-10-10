const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category");

// Add a new subcategory
exports.addSubcategory = async (req, res) => {
  const { name, categoryId } = req.body;

  try {
    const subcategory = await Subcategory.create({ name, categoryId });
    return res.status(201).json({ message: "Subcategory added", subcategory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.findAll({
      order: [["id", "DESC"]],
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(subcategories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const subcategory = await Subcategory.findByPk(id, {
      include: [{ model: Category, attributes: ["name"] }],
    });

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    return res.status(200).json(subcategory);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update a subcategory by ID
exports.updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId } = req.body;

  try {
    const subcategory = await Subcategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    await subcategory.update({ name, categoryId });

    return res
      .status(200)
      .json({ message: "Subcategory updated", subcategory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete a subcategory by ID
exports.deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    const subcategory = await Subcategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    await subcategory.destroy();

    return res.status(200).json({ message: "Subcategory deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
