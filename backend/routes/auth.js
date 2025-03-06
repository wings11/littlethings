const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { auth, restrictTo } = require("../middleware/auth");

// Register (POST)
router.post("/register", register);

// Login (POST)
router.post("/login", login);

module.exports = router;
