const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const geekFeedRoutes = require("./routes/geek_feed");
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/geek-feed", geekFeedRoutes);

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/geek-feed", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "geek-feed.html"));
});

//Rifat
// Route mapping (clean URLs)
app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard/dashboard.html"));
});

app.get("/admin-problems", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/problems/problems.html"));
});

app.get("/admin-discuss", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/discuss/discuss.html"));
});

app.get("/admin-users", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/user list/userList.html"));
});

app.get("/admin-contest", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/contest/contest.html"));
});
//Rifat

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
//   console.log("Requested URL:", req.url);
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 BrainJam Arena server running on http://localhost:${PORT}`);
  console.log(
    `📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`
  );
});
