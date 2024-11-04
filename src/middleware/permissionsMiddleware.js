const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RoleHasPermission = require("../models/RoleHasPermission");

module.exports = function (requiredPermission) {
  return async (req, res, next) => {
    // Check if the token exists in the request
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Get the user from the database with their role and associated permissions
      const user = await User.findByPk(req.user.userId, {
        include: [
          {
            model: Role,
            include: [{ model: Permission, as: "Permissions" }], // Correct alias 'Permissions' here
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the required permission exists for the role
      const hasPermission = user.Role.Permissions.some(
        (perm) => perm.name === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // If the user has the required permission, proceed to the next middleware
      next();
    } catch (err) {
      console.log(err);
      return res.status(403).json({ message: "Token is not valid" });
    }
  };
};
