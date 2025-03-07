const jwt = require("jsonwebtoken");
const db = require("../config/db");

const auth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Fetch user from database using email to get the ID
    const [users] = await db.query(
      "SELECT id, email, role FROM Users WHERE email = ?",
      [decoded.user.email]
    );
    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    req.user = users[0]; // Set req.user with id, email, and role
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(400).json({ message: "Token is not valid" });
  }
};

const restrictTo = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to access this resource",
        });
    }
    next();
  };
};

// New middleware to restrict access to original_price for non-admins
const restrictOriginalPrice = (req, res, next) => {
  if (req.user && req.user.role !== "admin") {
    // Modify the query or response to exclude original_price for non-admins
    if (req.method === "GET" && req.path.includes("/api/items")) {
      const originalQuery = req.query;
      req.query = { ...originalQuery, excludeOriginalPrice: true };
    }
    if (req.method === "GET" && req.path.includes("/api/orders")) {
      // Filter out original_price from order items for non-admins
      req.query = { ...req.query, excludeOriginalPrice: true };
    }
  }
  next();
};

// New middleware to allow both admins and users to access orders
const allowOrdersAccess = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "user")) {
    console.log("User role check failed:", req.user);
    return res
      .status(403)
      .json({ message: "You do not have permission to access this resource" });
  }
  next();
};

module.exports = { auth, restrictTo, restrictOriginalPrice, allowOrdersAccess };
