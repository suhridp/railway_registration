const User = require("../models/customer");
const Train = require("../models/train");
const Ticket = require("../models/ticket");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Utility function for consistent response handling
const handleResponse = (res, status, message, data = null) => {
  const response = { message };
  if (data) response.data = data;
  return res.status(status).json(response);
};

// Customer Registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleResponse(res, 400, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    handleResponse(res, 201, "User registered successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error registering user");
  }
};

// Customer Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    handleResponse(res, 200, "Login successful", { token });
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error logging in");
  }
};

// Search Trains
exports.searchTrains = async (req, res) => {
  const { startStation, endStation, date } = req.body;
  try {
    const trains = await Train.find({
      "schedule.station": { $all: [startStation, endStation] },
    });

    if (!trains.length) {
      return handleResponse(res, 404, "No trains found for the given route");
    }

    handleResponse(res, 200, "Trains fetched successfully", trains);
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error fetching trains");
  }
};

// Book Ticket
exports.bookTicket = async (req, res) => {
  const { userId, trainId, date, passengers } = req.body;
  try {
    const ticket = new Ticket({
      user: userId,
      train: trainId,
      date,
      passengers,
    });

    await ticket.save();
    handleResponse(res, 201, "Ticket booked successfully", ticket);
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error booking ticket");
  }
};

// View Ticket
exports.viewTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("train")
      .populate("user");

    if (!ticket) {
      return handleResponse(res, 404, "Ticket not found");
    }

    handleResponse(res, 200, "Ticket retrieved successfully", ticket);
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error retrieving ticket");
  }
};

// Cancel Ticket
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return handleResponse(res, 404, "Ticket not found");
    }

    ticket.status = "cancelled";
    await ticket.save();
    handleResponse(res, 200, "Ticket cancelled successfully");
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, "Error cancelling ticket");
  }
};
