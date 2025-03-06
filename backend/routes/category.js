const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
} = require("../controllers/categoryController");
const { auth, restrictTo } = require("../middleware/auth");

// Get categories with pagination and filtering (GET)
router.get("/", auth, restrictTo("admin"), getCategories);

// Create category (POST)
router.post("/", auth, restrictTo("admin"), createCategory);

// Get category by ID (GET)
router.get("/:id", auth, restrictTo("admin"), getCategory);

// Update category (PUT)
router.put("/:id", auth, restrictTo("admin"), updateCategory);

module.exports = router;
