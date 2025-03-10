import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function SalesDetails() {
  const [salesDetails, setSalesDetails] = useState({ itemSales: [] });
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    const query = new URLSearchParams(location.search);
    const period = query.get("period");
    const date = query.get("date");

    if (!period || !date) {
      setError("Invalid period or date");
      return;
    }

    const fetchSalesDetails = async () => {
      try {
        console.log(
          "Fetching sales details with token:",
          token,
          "period:",
          period,
          "date:",
          date
        );
        const response = await axios.get(
          `http://localhost:5000/api/reports/sales/details?period=${period}&date=${date}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Sales details response:", response.data);
        setSalesDetails({ itemSales: response.data.itemSales });
      } catch (err) {
        console.error(
          "Error fetching sales details:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load sales details");
      }
    };
    fetchSalesDetails();
  }, [location.search]);

  // Debug item sales data
  console.log("Item Sales:", salesDetails.itemSales);

  if (salesDetails.itemSales.length === 0) {
    return (
      <div className="min-vh-100 bg-white p-4">
        <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
          Sales Details
        </h2>
        {error && <p className="text-danger mb-4">{error}</p>}
        <p>No sales data available for this period.</p>
        <button
          onClick={() => navigate("/admin/reports")}
          className="mt-4 bg-pink-custom-200 text-pink-custom-300 px-4 py-2 rounded-md font-medium hover:bg-pink-custom-300 hover:text-white transition"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Sales Details
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <button
        onClick={() => navigate("/admin/reports")}
        className="mb-4 bg-pink-custom-200 text-pink-custom-300 px-4 py-2 rounded-md font-medium hover:bg-pink-custom-300 hover:text-white transition"
      >
        Back to Reports
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-pink-custom-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-pink-custom-100 text-left">
              <th className="py-3 px-4 border-b border-pink-custom-200 text-gray-700 font-semibold">
                Item Name
              </th>
              <th className="py-3 px-4 border-b border-pink-custom-200 text-gray-700 font-semibold">
                Quantity Sold
              </th>
              <th className="py-3 px-4 border-b border-pink-custom-200 text-gray-700 font-semibold">
                Total Sales ($)
              </th>
            </tr>
          </thead>
          <tbody>
            {salesDetails.itemSales.map((sale, index) => (
              <tr key={index} className="hover:bg-pink-custom-50 transition">
                <td className="py-3 px-4 border-b border-pink-custom-200">
                  {sale.item_name || "Unknown Item"}
                </td>
                <td className="py-3 px-4 border-b border-pink-custom-200">
                  {sale.total_quantity || 0}
                </td>
                <td className="py-3 px-4 border-b border-pink-custom-200">
                  $
                  {typeof sale.total_sales === "number"
                    ? sale.total_sales.toFixed(2)
                    : parseFloat(sale.total_sales || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesDetails;
