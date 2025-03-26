const mysql = require("mysql2/promise"); // Promise-based MySQL driver
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "261103", // Replace with your MySQL password
  database: process.env.DB_NAME || "pony", // Your database name
  port: 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }, // Optional, for remote MySQL connections
  connectTimeout: 10000, // 10 seconds timeout
});

module.exports = pool;
