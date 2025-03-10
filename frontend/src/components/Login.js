import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Logging in with email:", email, "and password:", password);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      console.log("Login response:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      setRole(response.data.user.role);
      navigate(
        response.data.user.role === "admin"
          ? "/admin/add-categories"
          : "/user/orders"
      );
    } catch (err) {
      console.error(
        "Error logging in:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card p-4 shadow-sm">
              <h2 className="text-2xl font-bold text-pink-custom-300 mb-4 text-center">
                Login
              </h2>
              {error && <p className="text-danger mb-4 text-center">{error}</p>}

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="form-control border-pink-custom-200 mb-3"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-control border-pink-custom-200 mb-3"
                  required
                />
                <button type="submit" className="btn btn-pink w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
