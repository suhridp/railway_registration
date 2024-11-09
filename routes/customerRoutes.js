const express = require("express");
const router = express.Router();
const userController = require("../controllers/customerController");

// User registration
router.post("/customer-register", userController.registerUser);

// User login
router.post("/customer-login", userController.loginUser);

// User logout
router.post("/logout", userController.logoutUser);

// Get user profile
router.get("/customer-profile/:userId", userController.getUserProfile);

// Search trains
router.get("/customer-search-trains", userController.searchTrains);

module.exports = router;
