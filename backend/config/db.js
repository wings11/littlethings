const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || sql309.infinityfree.com,
  user: process.env.DB_USER || if0_38487499,
  password: process.env.DB_PASSWORD || pU4dfArkwB9g2,
  database: process.env.DB_NAME || if0_38487499_littlethings,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }, // Optional, for remote MySQL connections
});

module.exports = pool;
