const Permission = require("../models/Permission");

const createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    const permission = await Permission.create({
      name,
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

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({});
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
