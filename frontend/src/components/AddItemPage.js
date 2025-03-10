import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddItemPage() {
  const [formData, setFormData] = useState({
    name: "",
    original_price: "",
    retail_price: "",
    wholesale_price: "",
    category_id: "",
    stock_quantity: "",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories with token:", token);
        const response = await axios.get(
          "http://localhost:5000/api/categories",
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Categories response:", response.data);
        setCategories(response.data.categories || response.data); // Handle both paginated and non-paginated responses
      } catch (err) {
        console.error(
          "Error fetching categories:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      console.log("Creating item with data:", formData, "and token:", token);
      const response = await axios.post(
        "http://localhost:5000/api/items",
        formData,
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Item created:", response.data);
      navigate("/admin/add-items"); // Redirect back to the items list
      setError("");
    } catch (err) {
      console.error(
        "Error creating item:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to create item");
    }
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Add New Item
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm max-w-md">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Item Name"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <input
          type="number"
          value={formData.original_price}
          onChange={(e) =>
            setFormData({ ...formData, original_price: e.target.value })
          }
          placeholder="Original Price"
          step="0.01"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <input
          type="number"
          value={formData.retail_price}
          onChange={(e) =>
            setFormData({ ...formData, retail_price: e.target.value })
          }
          placeholder="Retail Price"
          step="0.01"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <input
          type="number"
          value={formData.wholesale_price}
          onChange={(e) =>
            setFormData({ ...formData, wholesale_price: e.target.value })
          }
          placeholder="Wholesale Price"
          step="0.01"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          className="form-select border-pink-custom-200 mb-3"
          required
        >
          <option value="">Select Category</option>
          {Array.isArray(categories) ? (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>
        <input
          type="number"
          value={formData.stock_quantity}
          onChange={(e) =>
            setFormData({ ...formData, stock_quantity: e.target.value })
          }
          placeholder="Stock Quantity"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-pink">
            Add Item
          </button>
          <button
            onClick={() => navigate("/admin/add-items")}
            className="btn btn-outline-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItemPage;
