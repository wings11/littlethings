import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCategoryPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      console.log("Creating category with name:", name, "and token:", token);
      const response = await axios.post(
        "http://localhost:5000/api/categories",
        { name },
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Category created:", response.data);
      navigate("/admin/add-categories"); // Redirect back to the categories list
      setError("");
    } catch (err) {
      console.error(
        "Error creating category:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Add New Category
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          className="form-control border-pink-custom-200 mb-3"
          required
        />
        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-pink">
            Add Category
          </button>
          <button
            onClick={() => navigate("/admin/add-categories")}
            className="btn btn-outline-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCategoryPage;
