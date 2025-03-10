import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import AddCategories from "./components/AddCategories";
import AddItems from "./components/AddItems";
import Orders from "./components/Orders";
import OrderHistory from "./components/OrderHistory";
import UserDashboard from "./components/UserDashboard";
import UserOrders from "./components/UserOrders";
import UserOrderHistory from "./components/UserOrderHistory";
import Reports from "./components/Reports";
import SalesDetails from "./components/SalesDetails";
import AddItemPage from "./components/AddItemPage";
import EditItemPage from "./components/EditItemPage";
import AddCategoryPage from "./components/AddCategoryPage";
import EditCategoryPage from "./components/EditCategoryPage";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const PrivateRoute = ({ children, role: requiredRole }) => {
    const userRole = localStorage.getItem("role");
    if (!userRole) return <Navigate to="/" />;
    if (requiredRole === "admin" && userRole !== "admin")
      return <Navigate to="/user/orders" />;
    return children;
  };

  return (
    <Router>
      <Navbar role={role} />
      <div className="min-vh-100 bg-white p-4">
        <Routes>
          <Route path="/" element={<Login setRole={setRole} />} />

          {/* Admin Routes */}
          <Route
            path="/admin/add-categories"
            element={
              <PrivateRoute role="admin">
                <AddCategories />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/add-items"
            element={
              <PrivateRoute role="admin">
                <AddItems />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute role="admin">
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/order-history"
            element={
              <PrivateRoute role="admin">
                <OrderHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute role="admin">
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sales-details"
            element={
              <PrivateRoute role="admin">
                <SalesDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/add-item"
            element={
              <PrivateRoute role="admin">
                <AddItemPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/edit-item/:id"
            element={
              <PrivateRoute role="admin">
                <EditItemPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/add-category"
            element={
              <PrivateRoute role="admin">
                <AddCategoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/edit-category/:id"
            element={
              <PrivateRoute role="admin">
                <EditCategoryPage />
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user"
            element={
              <PrivateRoute role="user">
                <UserDashboard />
              </PrivateRoute>
            }
          >
            <Route path="orders" element={<UserOrders />} />
            <Route path="history" element={<UserOrderHistory />} />
          </Route>

          {/* Default redirect for unknown routes */}
          <Route
            path="*"
            element={
              <Navigate
                to={role === "admin" ? "/admin/add-categories" : "/user/orders"}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
