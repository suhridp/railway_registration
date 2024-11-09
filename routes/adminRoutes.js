const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin registration
router.post("/admin-register", adminController.registerAdmin);

// Admin login
router.post("/admin-login", adminController.loginAdmin);

// Add a train (Admin only)
router.post("/admin-manage-train", adminController.addTrain);

// Manage seats for a train
router.put("/admin-manage-seats/:trainId", adminController.manageSeats);

module.exports = router;
