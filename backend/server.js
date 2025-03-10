const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(
  cors({
    origin: "https://littlethings-frontend.onrender.com" || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/item");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");
const reportsRoutes = require("./routes/reports");

// Use routes correctly
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportsRoutes);

// Catch-all route for SPA (AFTER API routes)
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
