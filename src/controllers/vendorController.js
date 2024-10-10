const Vendor = require("../models/Vendor");

// Add a new vendor
exports.addVendor = async (req, res) => {
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    const vendor = await Vendor.create({
      first_name,
      last_name,
      email,
      phone_number,
    });
    return res
      .status(201)
      .json({ message: "Vendor added successfully", vendor });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({ order: [["id", "DESC"]] });
    return res.status(200).json(vendors);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a single vendor by ID
exports.getVendorById = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.status(200).json(vendor);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update a vendor by ID
exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await vendor.update({ first_name, last_name, email, phone_number });

    return res
      .status(200)
      .json({ message: "Vendor updated successfully", vendor });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete a vendor by ID
exports.deleteVendor = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await vendor.destroy();

    return res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
