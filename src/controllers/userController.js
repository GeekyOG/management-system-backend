const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

// CREATE a new user
const createUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone_number,
      business_name,
      password,
      roleId,
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone_number ||
      !password ||
      !roleId
    ) {
      return res.status(400).json({
        error:
          "Firstname, lastname, email, phone number, password, and roleId are required fields.",
      });
    }

    // Check if the user already exists by email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phone_number,
      business_name,
      password: hashedPassword,
      roleId,
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// READ all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role }], // Include role information
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

// READ one user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id },
      include: [{ model: Role }], // Include role information
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

// UPDATE a user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstname,
      lastname,
      email,
      phone_number,
      business_name,
      password,
      roleId,
    } = req.body;

    // Find user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user details
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.business_name = business_name || user.business_name;
    user.roleId = roleId || user.roleId;

    // If password is provided, hash the new password
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

// DELETE a user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
