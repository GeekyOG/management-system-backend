const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Get the token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (userId, role, etc.) from the token to the request

    // Check if the user's refresh token in the database matches the current session
    const user = await User.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If the user's refresh token is invalid (i.e., logged in from another device), reject the request
    const refreshToken = req.header("x-refresh-token"); // Pass refresh token via custom header
    if (refreshToken !== user.refreshToken) {
      return res
        .status(403)
        .json({ msg: "Invalid session. Logged in from another device." });
    }

    next(); // Proceed to the next middleware or controller
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Middleware to enforce multi-tenancy
const enforceMultiTenancy = (req, res, next) => {
  // Extract businessId from the JWT token
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Set businessId in query or body automatically for CRUD operations
    req.businessId = decodedToken.businessId;

    if (req.method === "GET" || req.method === "DELETE") {
      req.query.businessId = req.businessId;
    } else if (["POST", "PUT", "PATCH"].includes(req.method)) {
      req.body.businessId = req.businessId;
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
