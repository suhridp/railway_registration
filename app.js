const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/customer");
const Admin = require("./models/admin");
const Train = require("./models/train");

const stationRoutes = require("./routes/stationRoutes");
const trainRoutes = require("./routes/trainRoutes");

const app = express();
const PORT = 3000;
const path = require("path");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.set("views", path.join(__dirname, "views"));

// Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/railwayDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/customer-register", (req, res) => {
  res.render("customer-register");
});
app.get("/customer-login", (req, res) => {
  res.render("customer-login");
});
app.get("/customer-booked-tickets", (req, res) => {
  res.render("customer-booked-tickets");
});
app.get("/customer-booking", (req, res) => {
  res.render("customer-booking");
});
app.get("/customer-cancellation", (req, res) => {
  res.render("customer-cancellation");
});

// Admin Register Page

app.get("/admin-register", (req, res) => {
  res.render("admin-register");
});
app.get("/invalid-credentials", (req, res) => {
  res.render("invalid-credentials");
});

// Admin Login Page
app.get("/admin-login", (req, res) => {
  res.render("admin-login");
});
app.get("/admin-manage-seats", (req, res) => {
  res.render("admin-manage-seats");
});
app.get("/admin-manage-trains", (req, res) => {
  res.render("admin-manage-trains");
});
app.get("/admin-manage-stoppage", (req, res) => {
  res.render("admin-manage-stoppage");
});

// Train Search Page
app.get("/customer-search-trains", (req, res) => {
  res.render("customr-search-trains");
});

// Customer Registration (POST)
app.post("/customer-register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.redirect("customer-login"); // Redirect to login page after successful registration
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
      // Set the token in a cookie
      res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("customer-booked-tickets"); // Redirect to profile or dashboard after login
    } else {
      res.redirect("invalid-credentials"); // Redirect to profile or dashboard after login

      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Admin Registration (POST)
app.post("/admin-register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();
    res.redirect("admin-login"); // Redirect to admin login after successful registration
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
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
      // Set the token in a cookie
      res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("admin-manage-trains"); // Redirect to admin profile or dashboard after login
    } else {
      res.redirect("invalid-credentials"); // Redirect to profile or dashboard after login

      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

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
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
