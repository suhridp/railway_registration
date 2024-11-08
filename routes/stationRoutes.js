// stationsRoute.js
const express = require("express");
const router = express.Router();
const Station = require("../models/station");

// Add a new station
router.post("/add", async (req, res) => {
  try {
    const { name, location } = req.body;
    const station = new Station({ name, location });
    await station.save();
    res.status(201).json({ message: "Station added successfully", station });
  } catch (error) {
    res.status(500).json({ error: "Failed to add station" });
  }
});

// Get all stations
router.get("/", async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// Update a station by ID
router.put("/update/:id", async (req, res) => {
  try {
    const stationId = req.params.id;
    const { name, location } = req.body;
    const station = await Station.findByIdAndUpdate(
      stationId,
      { name, location },
      { new: true }
    );
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json({ message: "Station updated successfully", station });
  } catch (error) {
    res.status(500).json({ error: "Failed to update station" });
  }
});

// Delete a station by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const stationId = req.params.id;
    const station = await Station.findByIdAndDelete(stationId);
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json({ message: "Station deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete station" });
  }
});

module.exports = router;
