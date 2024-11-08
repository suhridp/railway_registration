// trainRoutes.js
const express = require("express");
const router = express.Router();
const Train = require("../models/train");

// Add a new train
router.post("/add", async (req, res) => {
  try {
    const { number, name, startStation, endStation, stoppages } = req.body;
    const train = new Train({
      number,
      name,
      startStation,
      endStation,
      stoppages,
    });
    await train.save();
    res.status(201).json({ message: "Train added successfully", train });
  } catch (error) {
    res.status(500).json({ error: "Failed to add train" });
  }
});

// Get all trains
router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trains" });
  }
});

// Get trains by start and end station
router.get("/search", async (req, res) => {
  try {
    const { startStation, endStation } = req.query;
    const trains = await Train.find({
      startStation,
      endStation,
    });
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: "Failed to search for trains" });
  }
});

// Update a train by ID
router.put("/update/:id", async (req, res) => {
  try {
    const trainId = req.params.id;
    const { number, name, startStation, endStation, stoppages } = req.body;
    const train = await Train.findByIdAndUpdate(
      trainId,
      { number, name, startStation, endStation, stoppages },
      { new: true }
    );
    if (!train) return res.status(404).json({ error: "Train not found" });
    res.json({ message: "Train updated successfully", train });
  } catch (error) {
    res.status(500).json({ error: "Failed to update train" });
  }
});

// Delete a train by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const trainId = req.params.id;
    const train = await Train.findByIdAndDelete(trainId);
    if (!train) return res.status(404).json({ error: "Train not found" });
    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete train" });
  }
});

module.exports = router;
