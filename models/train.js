// models/Train.js
const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  endStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  stoppages: [
    {
      station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
      arrivalTime: String,
      departureTime: String,
      sequence: Number, // Used for ordering the stations
    },
  ],
  seatsAvailable: {
    type: Number,
    required: true,
  },
  dailyRun: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Train", trainSchema);
