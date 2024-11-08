const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

// Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/railwayDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/pages/customer/register", (req, res) => {
  res.render("pages/customer/register");
});
app.get("/pages/customer/login", (req, res) => {
  res.render("pages/customer/login");
});
app.get("/pages/customer/booked-tickets", (req, res) => {
  res.render("pages/customer/booked-tickets");
});
app.get("/pages/customer/booking", (req, res) => {
  res.render("pages/customer/booking");
});
app.get("/pages/customer/cancellation", (req, res) => {
  res.render("pages/customer/cancellation");
});

// Admin Register Page
app.get("/pages/admin/register", (req, res) => {
  res.render("pages/admin/register");
});

// Admin Login Page
app.get("/pages/admin/login", (req, res) => {
  res.render("pages/admin/login");
});
app.get("/pages/admin/manage-seats", (req, res) => {
  res.render("pages/admin/manage-seats");
});
app.get("/pages/admin/manage-trains", (req, res) => {
  res.render("pages/admin/manage-trains");
});
app.get("/pages/admin/manage-stoppage", (req, res) => {
  res.render("pages/admin/manage-stoppage");
});

// Train Search Page
app.get("/pages/customer/search-trains", (req, res) => {
  res.render("pages/customer/search-trains");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
