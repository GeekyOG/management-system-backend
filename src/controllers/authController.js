const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Register a new user
exports.register = async (req, res) => {
  const { firstname, lastname, email, phone_number, business_name, password } =
    req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !phone_number ||
    !business_name ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phone_number,
      business_name,
      password: hashedPassword,
    });

    // Create a token for the user
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Create a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        businessName: user.businessName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};
