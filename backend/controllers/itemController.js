const db = require("../config/db");

const getItems = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;
  const userRole = req.user.role; // Get user role from auth middleware

  try {
    let query, params;

    if (userRole === "admin") {
      // Admins see all fields
      query = `
        SELECT * FROM Items 
        WHERE name LIKE ? 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?`;
      params = [`%${search}%`, parseInt(limit), parseInt(offset)];
    } else {
      // Users see limited fields
      query = `
        SELECT id, name, retail_price, wholesale_price, category_id, stock_quantity 
        FROM Items 
        WHERE name LIKE ? 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?`;
      params = [`%${search}%`, parseInt(limit), parseInt(offset)];
    }

    const [items] = await db.query(query, params);

    // Get total count for pagination (same for both roles, no need to filter)
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM Items WHERE name LIKE ?",
      [`%${search}%`]
    );
    const totalPages = Math.ceil(total / limit);

    console.log("Items fetched for role", userRole, ":", items);
    res.json({ items, totalPages, currentPage: parseInt(page) });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createItem = async (req, res) => {
  const {
    name,
    original_price,
    retail_price,
    wholesale_price,
    category_id,
    stock_quantity,
  } = req.body;
  const created_by = req.user.id; // Ensure this is set correctly via auth middleware

  if (
    !name ||
    !original_price ||
    !retail_price ||
    !wholesale_price ||
    !category_id ||
    !stock_quantity
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const item = {
    name,
    original_price,
    retail_price,
    wholesale_price,
    category_id,
    stock_quantity,
    created_by,
  };

  try {
    const [result] = await db.query("INSERT INTO Items SET ?", item);
    res.status(201).json({ id: result.insertId, ...item });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(400).json({ message: "Invalid category ID" });
    console.error("Error creating item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getItem = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM Items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    original_price,
    retail_price,
    wholesale_price,
    category_id,
    stock_quantity,
  } = req.body;

  if (
    !name ||
    !original_price ||
    !retail_price ||
    !wholesale_price ||
    !category_id ||
    !stock_quantity
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE Items SET name = ?, original_price = ?, retail_price = ?, wholesale_price = ?, category_id = ?, stock_quantity = ? WHERE id = ?",
      [
        name,
        original_price,
        retail_price,
        wholesale_price,
        category_id,
        stock_quantity,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item updated successfully", id });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(400).json({ message: "Invalid category ID" });
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM Items WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getItems, createItem, getItem, updateItem, deleteItem };
