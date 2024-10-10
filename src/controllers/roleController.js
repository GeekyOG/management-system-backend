const Permission = require("../models/Permission");
const Role = require("../models/Role");
const RoleHasPermission = require("../models/RoleHasPermission");

// Create a new role with associated permissions
const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;

    // Create the role
    const role = await Role.create({ name });

    // If there are permissions provided, associate them with the role
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });

      // Associate the found permissions with the role
      await role.setPermissions(permissions);
    }

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Error creating role" });
  }
};

// Get all roles with their associated permissions
const getAllRoles = async (req, res) => {
  try {
    // Fetch all roles including associated permissions
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: "Permissions", // Use the correct alias defined in the association
          through: {
            model: RoleHasPermission,
            attributes: [], // Exclude junction table attributes
          },
        },
      ],
    });

    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Error fetching roles" });
  }
};

module.exports = {
  createRole,
  getAllRoles,
};
