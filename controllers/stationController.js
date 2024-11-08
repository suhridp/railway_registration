// controllers/stationController.js
const Station = require("../models/Station");

// Get all stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stations" });
  }
};

// Add a new station
exports.addStation = async (req, res) => {
  const { name, code, location } = req.body;
  try {
    const station = new Station({ name, code, location });
    await station.save();
    res.json({ message: "Station added successfully", station });
  } catch (error) {
    res.status(500).json({ message: "Error adding station", error });
  }
};

// Delete a station by ID
exports.deleteStation = async (req, res) => {
  const { id } = req.params;
  try {
    await Station.findByIdAndDelete(id);
    res.json({ message: "Station deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting station", error });
  }
};

// Update station details
exports.updateStation = async (req, res) => {
  const { id } = req.params;
  const { name, code, location } = req.body;
  try {
    const station = await Station.findByIdAndUpdate(
      id,
      { name, code, location },
      { new: true }
    );
    res.json({ message: "Station updated successfully", station });
  } catch (error) {
    res.status(500).json({ message: "Error updating station", error });
  }
};
