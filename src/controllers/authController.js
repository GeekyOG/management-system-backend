const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Register a new user
exports.register = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phoneNumber,
    businessName,
    businessAddress,
    businessEmail,
    businessPhone,
    password,
    roleId,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !phoneNumber ||
    !businessName ||
    !password ||
    !roleId
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Check if the business already exists
    const businessExists = await Business.findOne({
      where: { businessName: businessName },
    });
    if (businessExists) {
      return res
        .status(400)
        .json({ message: "A business with this name already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new business
    const newBusiness = await Business.create({
      businessName: businessName,
      businessAddress: businessAddress,
      email: businessEmail,
      phone: businessPhone,
    });

    // Create the new user, associating it with the businessId
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phoneNumber,
      password: hashedPassword,
      roleId,
      businessId: newBusiness.id, // Associate the user with the business
    });

    // Token for the user including all relevant details
    const token = jwt.sign(
      {
        id: newUser.id,
        businessId: newBusiness.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        roleId: newUser.roleId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User and business registered successfully",
      token,
    });
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
    // Check if the user exists and include the Business association
    const user = await User.findOne({
      where: { email },
      include: [{ model: Business, attributes: ["id", "businessName"] }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Invalidate previous refresh token (log out from other devices)
    user.refreshToken = null;
    await user.save();

    // Create a new access token including user details
    const accessToken = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        email: user.email,
        businessId: user.Business.id,
        firstname: user.firstname,
        lastname: user.lastname,
        phoneNumber: user.phoneNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Create a new refresh token
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Store the refresh token in the database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiration = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days from now
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({
      where: { email },
      where: { businessId: req.businessId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a reset token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30m", // Token expires in 30 minutes
    });

    // Store the token and its expiration in the database
    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    await user.save();

    // Send the reset token to the user's email
    await sendResetEmail(user.email, token);

    return res.status(200).json({
      message: "Reset password email sent. Check your inbox.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Helper function to send the reset email
async function sendResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });
  const PORT = process.env.PORT || 5000;

  const resetUrl = `http://localhost:${PORT}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
}

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id, resetToken: token, businessId: req.businessId },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Check if the token is expired
    if (user.resetTokenExpiration < Date.now()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Password has been reset." });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const user = await User.findOne({
      where: { refreshToken },
      include: [{ model: Business, where: { id: req.businessId } }], // Ensure the business ID matches
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid refresh token." });
    }

    // Check if the refresh token has expired
    if (user.refreshTokenExpiration < new Date()) {
      return res.status(400).json({ message: "Refresh token has expired." });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid refresh token." });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          email: user.email,
          businessId: user.businessId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        message: "Token refreshed",
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Business, where: { id: req.businessId } }],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Invalidate the refresh token
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};
