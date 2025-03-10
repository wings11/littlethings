import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Reports() {
  const [salesReport, setSalesReport] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchSalesReport = async () => {
      try {
        console.log(
          "Fetching sales report with token:",
          token,
          "and period:",
          period
        );
        const response = await axios.get(
          `http://localhost:5000/api/reports/sales?period=${period}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Sales report response:", response.data);
        setSalesReport(response.data);
      } catch (err) {
        console.error(
          "Error fetching sales report:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load sales report");
      }
    };
    fetchSalesReport();
  }, [period]);

  const handleReportClick = (date) => {
    navigate(`/admin/sales-details?period=${period}&date=${date}`);
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        Sales Reports
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="form-select border-pink-custom-200 mb-4"
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <ul className="list-group">
        {salesReport.map((report, index) => (
          <li
            key={index}
            className="list-group-item bg-pink-custom-100 cursor-pointer hover:bg-pink-custom-200 transition"
            onClick={() =>
              handleReportClick(
                period === "monthly" ? report.month : report.year
              )
            }
          >
            <span className="text-lg text-gray-800">
              {period === "monthly"
                ? `Month: ${report.month}`
                : `Year: ${report.year}`}
              , Total Sales: ${report.total_sales}, Orders: {report.order_count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reports;
