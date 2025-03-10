import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-pink-custom-100 mb-4">
      <div className="container-fluid">
        <Link
          to={role === "admin" ? "/admin/add-categories" : "/user/orders"}
          className="navbar-brand text-pink-custom-300 fw-bold"
        >
          Little Things
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {role === "admin" ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/admin/add-categories"
                    className="nav-link text-pink-custom-300"
                  >
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/add-items"
                    className="nav-link text-pink-custom-300"
                  >
                    Items
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/orders"
                    className="nav-link text-pink-custom-300"
                  >
                    Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/order-history"
                    className="nav-link text-pink-custom-300"
                  >
                    Order History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/reports"
                    className="nav-link text-pink-custom-300"
                  >
                    Reports
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/user/orders"
                    className="nav-link text-pink-custom-300"
                  >
                    Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/user/history"
                    className="nav-link text-pink-custom-300"
                  >
                    Order History
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="nav-link btn btn-link text-pink-custom-300 p-0"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
