const express = require("express");
const router = express.Router();
const {
  getOrders,
  createOrder,
  refundOrder,
  getReceipt,
} = require("../controllers/orderController");
const { auth, restrictTo } = require("../middleware/auth");

// Get orders with pagination and filtering (GET)
router.get("/", auth, getOrders);

// Create order (POST)
router.post("/", auth, createOrder);

// Refund order (POST)
router.post("/refund/:id", auth, restrictTo("admin"), refundOrder);

// Get receipt (GET)
router.get("/receipt/:id", auth, getReceipt);

module.exports = router;
