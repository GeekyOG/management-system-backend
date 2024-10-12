const Permission = require("../models/Permission");

// Create a new permission
const createPermission = async (req, res) => {
  const businessId = req.businessId;

  try {
    const { name } = req.body;

    const permission = await Permission.create({
      name,
      businessId, // Include businessId when creating a new permission
    });

    res.status(201).json(permission);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const message = error.errors[0].message;
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: "Error creating permission", error });
    }
  }
};

// Get all permissions for the business
const getAllPermissions = async (req, res) => {
  const businessId = req.businessId;

  try {
    const permissions = await Permission.findAll({
      where: { businessId }, // Filter permissions by businessId
    });
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Error fetching permissions" });
  }
};

module.exports = {
  createPermission,
  getAllPermissions,
};
