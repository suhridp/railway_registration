const express = require("express");
const router = express.Router();
const {
  register,
  login,
  addTrain,
  removeTrain,
  manageStoppages,
  updateSeatAvailability,
} = require("../controllers/adminController");

// Admin registration and login
router.post("/register", register);
router.post("/login", login);

// Train management
router.post("/add-train", addTrain);
router.delete("/remove-train/:id", removeTrain);

// Manage stoppage stations and seats
router.put("/manage-stoppages/:trainId", manageStoppages);
router.put("/update-seat-availability/:trainId", updateSeatAvailability);

module.exports = router;
