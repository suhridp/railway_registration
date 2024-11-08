const express = require("express");
const router = express.Router();
const {
  register,
  login,
  searchTrains,
  bookTicket,
  viewTicket,
  cancelTicket,
} = require("../controllers/customerController");

// Customer registration and login
router.post("/register", register);
router.post("/login", login);

// Search trains and book tickets
router.post("/search-trains", searchTrains);
router.post("/book-ticket", bookTicket);

// View and cancel ticket
router.get("/view-ticket/:id", viewTicket);
router.post("/cancel-ticket/:id", cancelTicket);

module.exports = router;
