const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

exports.addTrain = async (req, res) => {
  const { trainNumber, name, startStation, endStation, seatsAvailable } =
    req.body;
  try {
    const newTrain = new Train({
      trainNumber,
      name,
      startStation,
      endStation,
      seatsAvailable,
    });
    await newTrain.save();
    res.status(201).json({ message: "Train added successfully", newTrain });
  } catch (error) {
    res.status(500).json({ message: "Error adding train" });
  }
};

exports.deleteTrain = async (req, res) => {
  const { trainId } = req.body;
  try {
    const train = await Train.findByIdAndDelete(trainId);
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.status(200).json({ message: "Train removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing train" });
  }
};

exports.manageSeats = async (req, res) => {
  const { trainId, seatsToAdd } = req.body;
  try {
    const train = await Train.findById(trainId);
    if (!train) return res.status(404).json({ message: "Train not found" });
    train.seatsAvailable += seatsToAdd;
    await train.save();
    res.status(200).json({ message: "Seats updated successfully", train });
  } catch (error) {
    res.status(500).json({ message: "Error updating seats" });
  }
};
