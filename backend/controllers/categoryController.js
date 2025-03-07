const db = require("../config/db");

const getCategories = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT * FROM Categories 
      WHERE name LIKE ? 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?`;
    const params = [`%${search}%`, parseInt(limit), parseInt(offset)];

    const [categories] = await db.query(query, params);

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM Categories WHERE name LIKE ?",
      [`%${search}%`]
    );
    const totalPages = Math.ceil(total / limit);

    console.log("Categories fetched:", categories);
    res.json({ categories, totalPages, currentPage: parseInt(page) });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    // Log the incoming request to debug
    console.log("Creating category with name:", name, "by user:", req.user.id);

    const [result] = await db.query(
      "INSERT INTO Categories (name, created_by) VALUES (?, ?)",
      [name, req.user.id]
    );
    res
      .status(201)
      .json({ id: result.insertId, name, created_by: req.user.id });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM Categories WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE Categories SET name = ? WHERE id = ?",
      [name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category updated successfully", id });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getCategories, createCategory, getCategory, updateCategory };
