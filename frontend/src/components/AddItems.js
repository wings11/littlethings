import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AddItems() {
  const [items, setItems] = useState([]);
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
    const fetchItems = async () => {
      try {
        console.log(
          "Fetching items with token:",
          token,
          "page:",
          page,
          "search:",
          search
        );
        const response = await axios.get(
          `http://localhost:5000/api/items?page=${page}&limit=10&search=${encodeURIComponent(
            search
          )}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Items response:", response.data);
        setItems(response.data.items);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error(
          "Error fetching items:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load items");
      }
    };
    fetchItems();
  }, [page, search]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      console.log("Deleting item with ID:", id, "and token:", token);
      const response = await axios.delete(
        `http://localhost:5000/api/items/${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Item deleted:", response.data);
      setItems(items.filter((item) => item.id !== id));
      setError("");
    } catch (err) {
      console.error(
        "Error deleting item:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">Items</h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="container">
        <div className="row justify-content-between mb-4">
          <div className="col-12 col-md-6 mb-2">
            <Link to="/admin/add-item" className="btn btn-pink w-100 w-md-auto">
              Add Item
            </Link>
          </div>
          <div className="col-12 col-md-6">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search items..."
              className="form-control border-pink-custom-200 w-100"
            />
          </div>
        </div>

        <ul className="list-group">
          {items.map((item) => (
            <li
              key={item.id}
              className="list-group-item bg-pink-custom-100 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
            >
              <span className="text-lg text-gray-800 mb-2 mb-md-0">
                {item.name} - Original: ${item.original_price || 0}, Retail: $
                {item.retail_price}, Wholesale: ${item.wholesale_price}, Stock:{" "}
                {item.stock_quantity}
              </span>
              <div className="d-flex flex-column flex-md-row gap-2 mt-2 mt-md-0">
                <Link
                  to={`/admin/edit-item/${item.id}`}
                  className="btn btn-outline-primary w-100 w-md-auto"
                >
                  Edit
                </Link>
                {/* <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-pink w-100 w-md-auto"
                >
                  Delete
                </button> */}
              </div>
            </li>
          ))}
        </ul>

        <nav className="mt-4">
          <ul className="pagination justify-content-center">
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
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
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
    </div>
  );
}

export default AddItems;
