import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditCategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchCategory = async () => {
      try {
        console.log("Fetching category with ID:", id, "and token:", token);
        const response = await axios.get(
          `http://localhost:5000/api/categories/${id}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Category response:", response.data);
        setCategory(response.data);
        setName(response.data.name);
      } catch (err) {
        console.error(
          "Error fetching category:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load category");
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      console.log("Updating category with name:", name, "and token:", token);
      const response = await axios.put(
        `http://localhost:5000/api/categories/${id}`,
        { name },
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Category updated:", response.data);
      navigate("/admin/add-categories"); // Redirect back to the categories list
      setError("");
    } catch (err) {
      console.error(
        "Error updating category:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  if (!category)
    return <div className="min-vh-100 bg-white p-4">Loading...</div>;

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Edit Category
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
            Update Category
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

export default EditCategoryPage;
