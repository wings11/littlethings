import React, { useEffect, useState } from "react";
import axios from "axios";

function UserOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchOrders = async () => {
      try {
        console.log(
          "Fetching orders with token:",
          token,
          "page:",
          page,
          "search:",
          search
        );
        const response = await axios.get(
          `http://localhost:5000/api/orders?page=${page}&limit=10&search=${encodeURIComponent(
            search
          )}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Orders response:", response.data);
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error(
          "Error fetching orders:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to load orders");
      }
    };
    fetchOrders();
  }, [page, search]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closePopup = () => {
    setSelectedOrder(null);
  };

  const handleRefund = async (orderId) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to refund this order?")) {
      try {
        console.log("Refunding order with ID:", orderId, "and token:", token);
        const response = await axios.post(
          `http://localhost:5000/api/orders/refund/${orderId}`,
          {},
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Refund response:", response.data);
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, is_refunded: true } : order
          )
        );
        setSelectedOrder(null);
        setError("Order refunded successfully");
      } catch (err) {
        console.error(
          "Error refunding order:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        setError(err.response?.data?.message || "Failed to refund order");
      }
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("order-slip").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Slip - ${selectedOrder.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .order-slip { padding: 20px; border: 1px solid #000; font-size: 14px; }
            h3 { margin-top: 0; color: #ff4d4d; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="order-slip">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      <h2 className="text-2xl font-bold text-pink-custom-300 mb-4">
        User Order History
      </h2>
      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="d-flex justify-content-between mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by email or order ID..."
          className="form-control border-pink-custom-200 w-25"
        />
      </div>

      <ul className="list-group">
        {orders.map((order) => (
          <li
            key={order.id}
            className="list-group-item bg-pink-custom-100 cursor-pointer hover:bg-pink-custom-200 transition"
            onClick={() => handleOrderClick(order)}
          >
            <span className="text-lg text-gray-800">
              Order ID: {order.id}, Date & Time:{" "}
              {new Date(order.created_at).toLocaleString()}, Created By:{" "}
              {order.created_by_email}, Total: MMK {order.total_price}
              {order.is_refunded && " (Refunded)"}
            </span>
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

      {selectedOrder && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white p-4 shadow-lg">
              <button
                onClick={closePopup}
                className="btn btn-pink position-absolute top-0 end-0 mt-2 me-2"
              >
                Close
              </button>
              <div id="order-slip" className="text-gray-800">
                <h3 className="text-pink-custom-300 mb-3">
                  Order Details - {selectedOrder.id}
                </h3>
                <p>Payment Method: {selectedOrder.payment_method}</p>
                <p>Sale Mode: {selectedOrder.sell_mode}</p>
                <p>
                  Created: {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
                <p>Total: MMK {selectedOrder.total_price}</p>
                <h4 className="text-pink-custom-300 mt-3 mb-2">Items:</h4>
                <ul className="list-group">
                  {selectedOrder.items.map((item, index) => (
                    <li
                      key={index}
                      className="list-group-item bg-pink-custom-100"
                    >
                      {item.name} - Quantity: {item.quantity}, Price:{" "}
                      {item.price} MMK
                    </li>
                  ))}
                </ul>
                {!selectedOrder.is_refunded && (
                  <button
                    onClick={() => handleRefund(selectedOrder.id)}
                    className="btn btn-pink mt-3"
                  >
                    Refund Order
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="btn btn-pink mt-3 ms-3"
                >
                  Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrderHistory;
