const Customer = require("../models/Customer");

// Add a new customer
exports.addCustomer = async (req, res) => {
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    const customer = await Customer.create({
      first_name,
      last_name,
      email,
      phone_number,
    });
    return res
      .status(201)
      .json({ message: "Customer added successfully", customer });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({ order: [["id", "DESC"]] });
    return res.status(200).json(customers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json(customer);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update customer by ID
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.update({ first_name, last_name, email, phone_number });

    return res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete customer by ID
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.destroy();

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
