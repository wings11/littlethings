const express = require("express");
const router = express.Router();
const {
  getItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { auth, restrictTo } = require("../middleware/auth");

// Get items with pagination and filtering (GET) - Allow both admins and users
router.get("/", auth, getItems); // Remove restrictTo('admin') to allow users

// Create item (POST) - Only admins
router.post("/", auth, restrictTo("admin"), createItem);

// Get item by ID (GET) - Only admins
router.get("/:id", auth, restrictTo("admin"), getItem);

// Update item (PUT) - Only admins
router.put("/:id", auth, restrictTo("admin"), updateItem);

// Delete item (DELETE) - Only admins
router.delete("/:id", auth, restrictTo("admin"), deleteItem);

module.exports = router;
