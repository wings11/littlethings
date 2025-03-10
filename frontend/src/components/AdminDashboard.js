import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard({ setRole }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [catName, setCatName] = useState('');
  const [itemData, setItemData] = useState({
    name: '',
    original_price: '',
    retail_price: '',
    wholesale_price: '',
    category_id: '',
    stock_quantity: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    const fetchData = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories', { headers: { 'x-auth-token': token } }),
          axios.get('http://localhost:5000/api/items', { headers: { 'x-auth-token': token } }),
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/categories',
        { name: catName },
        { headers: { 'x-auth-token': token } }
      );
      setCategories([...categories, response.data]);
      setCatName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/items',
        {
          name: itemData.name,
          original_price: parseFloat(itemData.original_price),
          retail_price: parseFloat(itemData.retail_price),
          wholesale_price: parseFloat(itemData.wholesale_price),
          category_id: parseInt(itemData.category_id),
          stock_quantity: parseInt(itemData.stock_quantity),
        },
        { headers: { 'x-auth-token': token } }
      );
      setItems([...items, response.data]);
      setItemData({
        name: '',
        original_price: '',
        retail_price: '',
        wholesale_price: '',
        category_id: '',
        stock_quantity: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <h3>Add Category</h3>
      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Category Name"
          required
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      
      <h3>Categories</h3>
      <ul className="list-group mb-4">
        {categories.map((cat) => (
          <li key={cat.id} className="list-group-item">{cat.name}</li>
        ))}
      </ul>
      
      <h3>Add Item</h3>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          value={itemData.name}
          onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
          placeholder="Item Name"
          required
          className="form-control mb-2"
        />
        <input
          type="number"
          value={itemData.original_price}
          onChange={(e) => setItemData({ ...itemData, original_price: e.target.value })}
          placeholder="Original Price"
          step="0.01"
          required
          className="form-control mb-2"
        />
        <input
          type="number"
          value={itemData.retail_price}
          onChange={(e) => setItemData({ ...itemData, retail_price: e.target.value })}
          placeholder="Retail Price"
          step="0.01"
          required
          className="form-control mb-2"
        />
        <input
          type="number"
          value={itemData.wholesale_price}
          onChange={(e) => setItemData({ ...itemData, wholesale_price: e.target.value })}
          placeholder="Wholesale Price"
          step="0.01"
          required
          className="form-control mb-2"
        />
        <select
          value={itemData.category_id}
          onChange={(e) => setItemData({ ...itemData, category_id: e.target.value })}
          required
          className="form-control mb-2"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number"
          value={itemData.stock_quantity}
          onChange={(e) => setItemData({ ...itemData, stock_quantity: e.target.value })}
          placeholder="Stock Quantity"
          required
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">Add Item</button>
      </form>
      
      <h3>Items</h3>
      <ul className="list-group">
        {items.map((item) => (
          <li key={item.id} className="list-group-item">
            {item.name} - Retail: ${item.retail_price}, Wholesale: ${item.wholesale_price}, Stock: {item.stock_quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;