const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const User = require("./models/customer");
const Admin = require("./models/admin");
const Train = require("./models/train");

const stationRoutes = require("./routes/stationRoutes");
const trainRoutes = require("./routes/trainRoutes");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/railwayDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/stations", stationRoutes);
app.use("/trains", trainRoutes);

// Public routes
app.get("/", (req, res) => res.render("index"));
app.get("/customer-register", (req, res) => res.render("customer-register"));
app.get("/customer-login", (req, res) => res.render("customer-login"));
app.get("/admin-register", (req, res) => res.render("admin-register"));
app.get("/admin-login", (req, res) => res.render("admin-login"));
app.get("/invalid-credentials", (req, res) =>
  res.render("invalid-credentials")
);
app.get("/error-page", (req, res) => res.render("error-page"));
app.get("/customer-search-trains", (req, res) =>
  res.render("customer-search-trains")
);
app.post("/search-results", async (req, res) => {
  const { startStation, endStation } = req.query;

  if (!startStation || !endStation) {
    return res.render("customer-search-trains", {
      error: "Both start and end stations must be provided.",
      startStation: startStation || "", // Pass the start station if available
      endStation: endStation || "", // Pass the end station if available
    });
  }

  try {
    // Replace this with your database query logic
    const trains = await Train.find({
      startStation: startStation,
      endStation: endStation,
    });

    // Render the search result page with the trains data
    res.render("search-results", {
      startStation,
      endStation,
      trains, // Pass trains data to the view
    });
  } catch (error) {
    console.error(error);
    res.render("customer-search-trains", {
      error: "An error occurred while searching for trains.",
      startStation,
      endStation,
    });
  }
});
// Customer-only routes
app.get("/customer-booked-tickets", isLoggedIn, (req, res) =>
  res.render("customer-booked-tickets")
);
app.get("/customer-booking", isLoggedIn, (req, res) =>
  res.render("customer-booking")
);
app.get("/customer-cancellation", isLoggedIn, (req, res) =>
  res.render("customer-cancellation")
);
app.get("/search-result", (req, res) => res.render("search-result"));

// Admin-only routes
app.get("/admin-manage-seats", isLoggedIn, (req, res) =>
  res.render("admin-manage-seats")
);
app.get("/admin-manage-trains", isLoggedIn, (req, res) =>
  res.render("admin-manage-trains")
);
app.get("/admin-manage-stoppage", isLoggedIn, (req, res) =>
  res.render("admin-manage-stoppage")
);

// Customer Registration (POST)
app.post("/customer-register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.redirect("customer-login");
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Customer Login (POST)
app.post("/customer-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 });
      return res.redirect("customer-booked-tickets", { user });
    } else {
      return res.redirect("invalid-credentials");
    }
  } catch (error) {
    return res.redirect("error-page");
  }
});

// Admin Registration (POST)
app.post("/admin-register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).send("Admin already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword });
    res.redirect("admin-login");
  } catch (error) {
    return res.redirect("error-page");
  }
});

// Admin Login (POST)
app.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 });
      return res.redirect("admin-manage-trains");
    } else {
      return res.redirect("invalid-credentials");
    }
  } catch (error) {
    return res.redirect("error-page");
  }
});

// Logout
app.get("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/");
});

// Middleware to verify login
function isLoggedIn(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) return res.redirect("/");
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    return res.redirect("/");
  }
}

// Book Ticket (POST)
app.post("/customer-book-ticket", async (req, res) => {
  const { userId, trainId, date, passengers } = req.body;
  try {
    const ticket = new Ticket({
      user: userId,
      train: trainId,
      date,
      passengers,
    });
    await ticket.save();
    res.json({ message: "Ticket booked successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: "Error booking ticket" });
  }
});

// Cancel Ticket (POST)
app.post("/customer-cancel-ticket", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.body.ticketId);
    if (ticket) {
      ticket.status = "cancelled";
      await ticket.save();
      res.json({ message: "Ticket cancelled successfully" });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error cancelling ticket" });
  }
});

// Add Train (POST) - Admin Only
app.post("/admin-add-train", async (req, res) => {
  const { trainNumber, name, startStation, endStation, stoppages } = req.body;
  try {
    const newTrain = new Train({
      trainNumber,
      name,
      startStation,
      endStation,
      stoppages,
    });
    await newTrain.save();
    res.status(201).json({ message: "Train added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding train" });
  }
}); // Route to add a new train
app.post("/add-trains", async (req, res) => {
  const { trainNumber, name, startStation, endStation, stoppages } = req.body;

  // Validate incoming data
  if (!trainNumber || !name || !startStation || !endStation) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if the train already exists by trainNumber
    const existingTrain = await Train.findOne({ trainNumber });
    if (existingTrain) {
      return res
        .status(400)
        .json({ message: "Train with this number already exists." });
    }

    // Create new train document
    const newTrain = new Train({
      trainNumber,
      name,
      startStation,
      endStation,
      stoppages, // Optional, you can send this as an array of stoppages if needed
      dailyRun: dailyRun !== undefined ? dailyRun : true, // Default to true if not provided
    });

    // Save the new train
    await newTrain.save();

    return res
      .status(201)
      .json({ message: "Train added successfully", newTrain });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
});

// Route to remove a train
app.post("/remove-trains", async (req, res) => {
  const { trainId } = req.body;

  if (!trainId) {
    return res.status(400).json({ message: "Train ID is required." });
  }

  try {
    // Find and remove the train by trainId
    const train = await Train.findByIdAndDelete(trainId);

    if (!train) {
      return res.status(404).json({ message: "Train not found." });
    }

    return res.status(200).json({ message: "Train removed successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
});

app.post("/update-seats", async (req, res) => {
  const { trainId, seatsToAdd } = req.body; // Expecting 'trainId' and 'seatsToAdd' in the request body

  if (!trainId || typeof seatsToAdd !== "number") {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Find the train by ID and update its available seats
    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Update the available seats by adding the specified amount
    train.seatsAvailable += seatsToAdd;

    // Save the updated train document
    await train.save();

    return res.status(200).json({
      message: `Seats updated successfully. Available seats: ${train.seatsAvailable}`,
      train,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
