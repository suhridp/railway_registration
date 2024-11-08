const Admin = require("../models/admin");
const Train = require("../models/train");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Utility function to handle common response formats
const handleResponse = (res, status, message, data = null) => {
  const response = { message };
  if (data) response.data = data;
  return res.status(status).json(response);
};

// Register Admin
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return handleResponse(res, 400, "Admin already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    handleResponse(res, 201, "Admin registered successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error registering admin");
  }
};

// Login Admin
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    handleResponse(res, 200, "Login successful", { token });
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error logging in");
  }
};

// Add Train
exports.addTrain = async (req, res) => {
  const { trainNumber, name, startStation, endStation, stoppages } = req.body;
  try {
    const newTrain = new Train({
      trainNumber,
      name,
      startStation,
      endStation,
      stoppages,
    });

    await newTrain.save();
    handleResponse(res, 201, "Train added successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error adding train");
  }
};

// Remove Train
exports.removeTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) {
      return handleResponse(res, 404, "Train not found");
    }

    handleResponse(res, 200, "Train removed successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error removing train");
  }
};

// Manage Stoppages
exports.manageStoppages = async (req, res) => {
  const { stoppages } = req.body;
  try {
    const train = await Train.findById(req.params.trainId);
    if (!train) {
      return handleResponse(res, 404, "Train not found");
    }

    train.stoppages = stoppages;
    await train.save();

    handleResponse(res, 200, "Stoppages updated successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error updating stoppages");
  }
};

// Update Seat Availability
exports.updateSeatAvailability = async (req, res) => {
  const { seatsAvailable } = req.body;
  try {
    const train = await Train.findById(req.params.trainId);
    if (!train) {
      return handleResponse(res, 404, "Train not found");
    }

    train.seatsAvailable = seatsAvailable;
    await train.save();

    handleResponse(res, 200, "Seat availability updated successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error updating seat availability");
  }
};
