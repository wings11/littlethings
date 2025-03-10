import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
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
    const fetchItemAndCategories = async () => {
      try {
        // Fetch item
        console.log("Fetching item with ID:", id, "and token:", token);
        const itemResponse = await axios.get(
          `http://localhost:5000/api/items/${id}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Item response:", itemResponse.data);
        setItem(itemResponse.data);
        setFormData(itemResponse.data);

        // Fetch categories
        console.log("Fetching categories with token:", token);
        const categoriesResponse = await axios.get(
          "http://localhost:5000/api/categories",
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Categories response:", categoriesResponse.data);
        setCategories(
          categoriesResponse.data.categories || categoriesResponse.data
        ); // Handle both paginated and non-paginated responses
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load data");
      }
    };
    fetchItemAndCategories();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      console.log("Updating item with data:", formData, "and token:", token);
      const response = await axios.put(
        `http://localhost:5000/api/items/${id}`,
        formData,
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Item updated:", response.data);
      navigate("/admin/add-items"); // Redirect back to the items list
      setError("");
    } catch (err) {
      console.error(
        "Error updating item:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to update item");
    }
  };

  if (!item) return <div className="min-vh-100 bg-white p-4">Loading...</div>;

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Edit Item
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
            Update Item
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

export default EditItemPage;
