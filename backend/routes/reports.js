const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getSalesDetails,
} = require("../controllers/reportsController");
const { auth, restrictTo } = require("../middleware/auth");

// Get sales report (GET)
router.get("/sales", auth, restrictTo("admin"), getSalesReport);

// Get sales details (GET)
router.get("/sales/details", auth, restrictTo("admin"), getSalesDetails);

module.exports = router;
