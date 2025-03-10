import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AddCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchCategories = async () => {
      try {
        console.log(
          "Fetching categories with token:",
          token,
          "page:",
          page,
          "search:",
          search
        );
        const response = await axios.get(
          `http://localhost:5000/api/categories?page=${page}&limit=10&search=${encodeURIComponent(
            search
          )}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Categories response:", response.data);
        setCategories(response.data.categories);
        setTotalPages(response.data.totalPages);
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
  }, [page, search]);

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Categories
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="d-flex justify-content-between mb-4">
        <Link to="/admin/add-category" className="btn btn-pink">
          Add Category
        </Link>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search categories..."
          className="form-control border-pink-custom-200 w-25"
        />
      </div>

      <ul className="list-group">
        {categories.map((category) => (
          <li
            key={category.id}
            className="list-group-item bg-pink-custom-100 d-flex justify-content-between align-items-center"
          >
            <span className="text-lg text-gray-800">{category.name}</span>
            <div className="d-flex gap-2">
              <Link
                to={`/admin/edit-category/${category.id}`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
              {/* <button
                onClick={() => handleDelete(category.id)}
                className="btn btn-pink"
              >
                Delete
              </button> */}
            </div>
          </li>
        ))}
      </ul>

      <nav className="mt-4">
        <ul className="pagination">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button
              onClick={() => setPage(page - 1)}
              className="page-link bg-pink-custom-200 text-pink-custom-300 hover:bg-pink-custom-300 hover:text-white transition"
            >
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i + 1}
              className={`page-item ${page === i + 1 ? "active" : ""}`}
            >
              <button
                onClick={() => setPage(i + 1)}
                className="page-link bg-pink-custom-300 text-white hover:bg-pink-custom-200 transition"
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button
              onClick={() => setPage(page + 1)}
              className="page-link bg-pink-custom-200 text-pink-custom-300 hover:bg-pink-custom-300 hover:text-white transition"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AddCategories;
