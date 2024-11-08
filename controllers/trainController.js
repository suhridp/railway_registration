// controllers/trainController.js
const Train = require("../models/Train");
const Station = require("../models/Station");

// Get all trains
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find().populate(
      "startStation endStation stoppages.station"
    );
    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trains" });
  }
};

// Add a new train
exports.addTrain = async (req, res) => {
  const {
    trainNumber,
    name,
    startStation,
    endStation,
    stoppages,
    seatsAvailable,
  } = req.body;
  try {
    const startStationObj = await Station.findById(startStation);
    const endStationObj = await Station.findById(endStation);

    if (!startStationObj || !endStationObj) {
      return res.status(400).json({ message: "Invalid start or end station" });
    }

    const train = new Train({
      trainNumber,
      name,
      startStation: startStationObj._id,
      endStation: endStationObj._id,
      stoppages: stoppages.map((stop) => ({
        station: stop.station,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        sequence: stop.sequence,
      })),
      seatsAvailable,
    });

    await train.save();
    res.json({ message: "Train added successfully", train });
  } catch (error) {
    res.status(500).json({ message: "Error adding train", error });
  }
};

// Delete a train by ID
exports.deleteTrain = async (req, res) => {
  const { id } = req.params;
  try {
    await Train.findByIdAndDelete(id);
    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting train", error });
  }
};

// Update train details
exports.updateTrain = async (req, res) => {
  const { id } = req.params;
  const { name, startStation, endStation, stoppages, seatsAvailable } =
    req.body;
  try {
    const train = await Train.findByIdAndUpdate(
      id,
      { name, startStation, endStation, stoppages, seatsAvailable },
      { new: true }
    ).populate("startStation endStation stoppages.station");
    res.json({ message: "Train updated successfully", train });
  } catch (error) {
    res.status(500).json({ message: "Error updating train", error });
  }
};

// Check seat availability for a train
exports.checkSeatAvailability = async (req, res) => {
  const { trainId } = req.params;
  try {
    const train = await Train.findById(trainId);
    if (!train) return res.status(404).json({ message: "Train not found" });

    res.json({ seatsAvailable: train.seatsAvailable });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking seat availability", error });
  }
};
