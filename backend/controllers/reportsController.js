const db = require("../config/db");

const getSalesReport = async (req, res) => {
  const { period = "monthly" } = req.query; // Default to monthly, can be 'yearly'
  let query, params;

  switch (period) {
    case "yearly":
      query = `
        SELECT YEAR(created_at) AS year, SUM(total_price) AS total_sales, COUNT(*) AS order_count 
        FROM Orders 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND is_refunded = FALSE 
        GROUP BY YEAR(created_at) 
        ORDER BY year DESC`;
      params = [];
      break;
    default: // monthly
      query = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total_price) AS total_sales, COUNT(*) AS order_count 
        FROM Orders 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND is_refunded = FALSE 
        GROUP BY month 
        ORDER BY month DESC`;
      params = [];
  }

  try {
    const [results] = await db.query(query, params);
    console.log("Sales report fetched:", results);
    res.json(results);
  } catch (err) {
    console.error("Error fetching sales report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getSalesDetails = async (req, res) => {
  const { period, date } = req.query; // e.g., period='monthly', date='2024-03' or period='yearly', date='2024'
  let startDate, endDate;

  if (period === "yearly") {
    startDate = `${date}-01-01`;
    endDate = `${date}-12-31 23:59:59`;
  } else {
    // monthly
    startDate = `${date}-01 00:00:00`;
    endDate = `${date}-31 23:59:59`; // Simplified; adjust for actual month length if needed
  }

  try {
    // Sales by item (only keeping itemSales as per request)
    const [itemSales] = await db.query(
      `
      SELECT i.name AS item_name, COUNT(DISTINCT o.id) AS order_count, SUM(oi.quantity) AS total_quantity, SUM(oi.price * oi.quantity) AS total_sales 
      FROM Orders o 
      JOIN OrderItems oi ON o.id = oi.order_id 
      JOIN Items i ON oi.item_id = i.id 
      WHERE o.created_at BETWEEN ? AND ? AND o.is_refunded = FALSE 
      GROUP BY i.id, i.name 
      ORDER BY total_sales DESC`,
      [startDate, endDate]
    );

    // Ensure total_sales is a number
    const formattedItemSales = itemSales.map((sale) => ({
      ...sale,
      total_sales: parseFloat(sale.total_sales) || 0, // Convert to number, default to 0 if null/undefined
    }));

    console.log("Sales details fetched:", { itemSales: formattedItemSales });
    res.json({ itemSales: formattedItemSales });
  } catch (err) {
    console.error("Error fetching sales details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getSalesReport, getSalesDetails };
