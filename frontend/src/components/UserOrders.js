import React, { useEffect, useState } from "react";
import axios from "axios";

function UserOrders() {
  const [items, setItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    items: {},
    sell_mode: "retail",
    discount_mode: "none",
    discount_value: "",
    payment_method: "Cash",
  });
  const [error, setError] = useState("");
  const [lastOrderId, setLastOrderId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const fetchItems = async () => {
      try {
        console.log("Fetching items with token:", token);
        const response = await axios.get("http://localhost:5000/api/items", {
          headers: { "x-auth-token": token },
        });
        const userRole = localStorage.getItem("role");
        const filteredItems = response.data.items.map((item) => {
          if (userRole === "user") {
            return {
              id: item.id,
              name: item.name,
              retail_price: item.retail_price,
              wholesale_price: item.wholesale_price,
              category_id: item.category_id,
              stock_quantity: item.stock_quantity,
            };
          }
          return item;
        });
        console.log("Items response:", filteredItems);
        setItems(filteredItems);
      } catch (err) {
        console.error(
          "Error fetching items:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to access this resource");
        } else {
          setError(err.response?.data?.message || "Failed to load items");
        }
      }
    };
    fetchItems();
  }, []);

  const handleAddItemToOrder = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      setError("Item not found");
      return;
    }
    if (item.stock_quantity === 0) {
      setError(`No stock available for ${item.name}`);
      return;
    }
    setNewOrder((prev) => ({
      ...prev,
      items: { ...prev.items, [itemId]: (prev.items[itemId] || 0) + 1 },
    }));
    setError("");
  };

  const handleRemoveItem = (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from the order?"
      )
    ) {
      setNewOrder((prev) => {
        const updatedItems = { ...prev.items };
        delete updatedItems[itemId];
        return { ...prev, items: updatedItems };
      });
    }
  };

  const handleCreateOrder = async () => {
    const token = localStorage.getItem("token");
    const orderItems = Object.entries(newOrder.items).map(([id, quantity]) => ({
      id: parseInt(id),
      quantity,
    }));
    if (orderItems.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }
    try {
      console.log(
        "Creating order with data:",
        { items: orderItems, ...newOrder },
        "and token:",
        token
      );
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        { ...newOrder, items: orderItems },
        {
          headers: { "x-auth-token": token },
        }
      );
      console.log("Order created:", response.data);
      setLastOrderId(response.data.id);
      setNewOrder({
        items: {},
        sell_mode: "retail",
        discount_mode: "none",
        discount_value: "",
        payment_method: "Cash",
      });
      setError("Order created successfully");
      const itemsRes = await axios.get("http://localhost:5000/api/items", {
        headers: { "x-auth-token": token },
      });
      const filteredItems = itemsRes.data.items.map((item) => {
        if (localStorage.getItem("role") === "user") {
          return {
            id: item.id,
            name: item.name,
            retail_price: item.retail_price,
            wholesale_price: item.wholesale_price,
            category_id: item.category_id,
            stock_quantity: item.stock_quantity,
          };
        }
        return item;
      });
      setItems(filteredItems);
    } catch (err) {
      console.error(
        "Error creating order:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError(err.response?.data?.message || "Failed to create order");
    }
  };

  const downloadReceipt = async () => {
    if (!lastOrderId) {
      setError("No order to generate receipt for");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/receipt/${lastOrderId}`,
        {
          headers: { "x-auth-token": token },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_order_${lastOrderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Error downloading receipt:",
        err.response?.data || err.message,
        "Status:",
        err.response?.status
      );
      setError("Failed to download receipt");
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(newOrder.items).forEach(([itemId, quantity]) => {
      const item = items.find((i) => i.id === parseInt(itemId));
      if (item) {
        const price =
          newOrder.sell_mode === "wholesale"
            ? item.wholesale_price
            : item.retail_price;
        total += price * quantity;
      }
    });
    if (newOrder.discount_mode === "percentage" && newOrder.discount_value) {
      total -= total * (parseFloat(newOrder.discount_value) / 100);
    } else if (newOrder.discount_mode === "amount" && newOrder.discount_value) {
      total -= parseFloat(newOrder.discount_value) || 0;
    }
    return total > 0 ? total.toFixed(2) : "0.00";
  };

  return (
    <div className="min-vh-100 bg-white p-4">
      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="card p-4 shadow-sm">
        <h3 className="text-2xl font-bold text-pink-custom-300 mb-4">
          Create New Order
        </h3>
        <div className="mb-4">
          <h4 className="text-lg text-gray-800 mb-3">Available Items</h4>
          <ul className="list-group">
            {Array.isArray(items) ? (
              items.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item bg-pink-custom-100 d-flex justify-content-between align-items-center"
                >
                  <span className="text-lg text-gray-800">
                    {item.name} - Retail: MMK {item.retail_price}, Wholesale:
                    MMK {item.wholesale_price}, Stock: {item.stock_quantity}
                  </span>
                  <button
                    onClick={() => handleAddItemToOrder(item.id)}
                    className="btn btn-pink ms-3"
                  >
                    Add to Order
                  </button>
                </li>
              ))
            ) : (
              <li className="list-group-item bg-pink-custom-100">
                No items available
              </li>
            )}
          </ul>
        </div>

        <select
          value={newOrder.sell_mode}
          onChange={(e) =>
            setNewOrder({ ...newOrder, sell_mode: e.target.value })
          }
          className="form-select border-pink-custom-200 mb-3"
        >
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>

        <select
          value={newOrder.discount_mode}
          onChange={(e) =>
            setNewOrder({ ...newOrder, discount_mode: e.target.value })
          }
          className="form-select border-pink-custom-200 mb-3"
        >
          <option value="none">No Discount</option>
          <option value="percentage">Percentage</option>
          <option value="amount">Amount</option>
        </select>
        {newOrder.discount_mode !== "none" && (
          <input
            type="number"
            value={newOrder.discount_value}
            onChange={(e) =>
              setNewOrder({ ...newOrder, discount_value: e.target.value })
            }
            placeholder={
              newOrder.discount_mode === "percentage"
                ? "Percentage (%)"
                : "Amount ($)"
            }
            step="0.01"
            className="form-control border-pink-custom-200 mb-3"
          />
        )}

        <select
          value={newOrder.payment_method}
          onChange={(e) =>
            setNewOrder({ ...newOrder, payment_method: e.target.value })
          }
          className="form-select border-pink-custom-200 mb-3"
        >
          <option value="Cash">Cash</option>
          <option value="Kpay">Kpay</option>
          <option value="WavePay">WavePay</option>
          <option value="Banking">Banking</option>
        </select>

        <h4 className="text-lg text-gray-800 mt-4 mb-3">Order Items</h4>
        <ul className="list-group mb-4">
          {Object.entries(newOrder.items).map(([itemId, quantity]) => {
            const item = items.find((i) => i.id === parseInt(itemId));
            if (!item) return null;
            const price =
              newOrder.sell_mode === "wholesale"
                ? item.wholesale_price
                : item.retail_price;
            return (
              <li
                key={item.id}
                className="list-group-item bg-pink-custom-100 d-flex justify-content-between align-items-center"
              >
                <span className="text-lg text-gray-800">
                  {item.name} - Quantity: {quantity}, Price: ${price * quantity}
                </span>
                <button
                  onClick={() => handleRemoveItem(itemId)}
                  className="btn btn-pink"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-xl text-gray-800 mb-4">Total: ${calculateTotal()}</p>
        <div className="d-flex gap-3">
          <button
            onClick={handleCreateOrder}
            className="btn btn-pink px-4 py-2"
          >
            Create Order
          </button>
          {lastOrderId && (
            <button
              onClick={downloadReceipt}
              className="btn btn-pink px-4 py-2"
            >
              Download Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserOrders;
