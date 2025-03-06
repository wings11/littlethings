const db = require("../config/db");
const path = require("path"); // For logo path

const getOrders = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query; // Add search for email or order ID
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT o.id, o.created_at, o.total_price, o.payment_method, o.sell_mode, o.is_refunded, u.email AS created_by_email, 
             JSON_ARRAYAGG(JSON_OBJECT('id', oi.item_id, 'name', i.name, 'quantity', oi.quantity, 'price', oi.price)) AS items 
      FROM Orders o 
      JOIN Users u ON o.created_by = u.id 
      LEFT JOIN OrderItems oi ON o.id = oi.order_id 
      LEFT JOIN Items i ON oi.item_id = i.id 
      WHERE (u.email LIKE ? OR o.id LIKE ?) 
      GROUP BY o.id, o.created_at, o.total_price, o.payment_method, o.sell_mode, o.is_refunded, u.email 
      ORDER BY o.created_at DESC 
      LIMIT ? OFFSET ?`;
    const params = [
      `%${search}%`,
      `%${search}%`,
      parseInt(limit),
      parseInt(offset),
    ];

    const [orders] = await db.query(query, params);

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(DISTINCT o.id) as total 
      FROM Orders o 
      JOIN Users u ON o.created_by = u.id 
      WHERE u.email LIKE ? OR o.id LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );
    const totalPages = Math.ceil(total / limit);

    console.log("Orders fetched:", orders);
    res.json({ orders, totalPages, currentPage: parseInt(page) });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createOrder = async (req, res) => {
  const { items, sell_mode, discount_mode, discount_value, payment_method } =
    req.body;
  const created_by = req.user.id; // Ensure this is set via auth middleware

  if (!items || items.length === 0 || !sell_mode || !payment_method) {
    return res
      .status(400)
      .json({ message: "Items, sell mode, and payment method are required" });
  }

  try {
    // Calculate total price based on items, sell_mode, and discount
    let total_price = 0;
    for (const item of items) {
      const [itemRows] = await db.query(
        "SELECT retail_price, wholesale_price, stock_quantity FROM Items WHERE id = ?",
        [item.id]
      );
      if (itemRows.length === 0) {
        return res
          .status(400)
          .json({ message: `Item with ID ${item.id} not found` });
      }
      const itemData = itemRows[0];
      if (itemData.stock_quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for item ${item.id}` });
      }
      const price =
        sell_mode === "wholesale"
          ? itemData.wholesale_price
          : itemData.retail_price;
      total_price += price * item.quantity;
    }

    // Apply discount
    if (discount_mode === "percentage" && discount_value) {
      total_price -= total_price * (parseFloat(discount_value) / 100);
    } else if (discount_mode === "amount" && discount_value) {
      total_price -= parseFloat(discount_value) || 0;
    }

    // Insert order
    const [orderResult] = await db.query(
      "INSERT INTO Orders (created_by, total_price, payment_method, sell_mode, is_refunded) VALUES (?, ?, ?, ?, FALSE)",
      [created_by, total_price, payment_method, sell_mode]
    );
    const orderId = orderResult.insertId;

    // Insert order items and update stock
    for (const item of items) {
      const [itemRows] = await db.query(
        "SELECT retail_price, wholesale_price, stock_quantity FROM Items WHERE id = ?",
        [item.id]
      );
      const itemData = itemRows[0];
      const price =
        sell_mode === "wholesale"
          ? itemData.wholesale_price
          : itemData.retail_price;
      await db.query(
        "INSERT INTO OrderItems (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, price]
      );
      await db.query(
        "UPDATE Items SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.id]
      );
    }

    res.status(201).json({ id: orderId, total_price, created_at: new Date() });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const refundOrder = async (req, res) => {
  const { id } = req.params;
  console.log("Refunding order with ID:", id, "by user:", req.user.id);

  try {
    const [order] = await db.query(
      "SELECT * FROM Orders WHERE id = ? AND is_refunded = FALSE",
      [id]
    );
    if (order.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or already refunded" });
    }

    // Update order to mark as refunded
    await db.query("UPDATE Orders SET is_refunded = TRUE WHERE id = ?", [id]);

    // Restore stock for refunded items
    const [orderItems] = await db.query(
      "SELECT item_id, quantity FROM OrderItems WHERE order_id = ?",
      [id]
    );
    for (const item of orderItems) {
      await db.query(
        "UPDATE Items SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.item_id]
      );
    }

    res.json({ message: "Order refunded successfully", orderId: id });
  } catch (err) {
    console.error("Error refunding order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getReceipt = async (req, res) => {
  const { id } = req.params;

  try {
    const [order] = await db.query(
      `
      SELECT o.id, o.created_at, o.total_price, o.payment_method, o.sell_mode, u.email AS created_by_email 
      FROM Orders o 
      JOIN Users u ON o.created_by = u.id 
      WHERE o.id = ?`,
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch order items
    const [orderItems] = await db.query(
      `
      SELECT i.name, oi.quantity, oi.price 
      FROM OrderItems oi 
      JOIN Items i ON oi.item_id = i.id 
      WHERE oi.order_id = ?`,
      [id]
    );

    let totalPrice = order[0].total_price;
    if (typeof totalPrice !== "number") {
      totalPrice = parseFloat(totalPrice) || 0;
      console.log(
        "Converted total_price to:",
        totalPrice,
        "from:",
        order[0].total_price
      );
    }

    const PDFKit = require("pdfkit");
    const doc = new PDFKit({ size: [226, 400], margin: 10 }); // 80mm x 297mm in pixels (1mm ≈ 2.83px)

    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="receipt_order_${id}.pdf"`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    });

    // Logo at the top (centered)
    const logoPath = path.join(__dirname, "public/logo.png"); // Ensure this path is correct
    doc.image(logoPath, (doc.page.width - 100) / 2, 10, { width: 100 }); // Center logo, 10px from top

    // Store name and address (centered)
    doc
      .fontSize(8)
      .fillColor("#333")
      .text("Little Things Cosmetics", { align: "center" })
      .moveDown(0.2)
      .text("78st, Bet: 102x102A, Mandalay, Myanmar", { align: "center" });

    // Prominent total amount (centered, bold)
    doc.moveDown(0.9);
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000")
      .text(`Ks ${totalPrice.toLocaleString()}`, { align: "center" })
      .moveDown(0.2)
      .font("Helvetica")
      .fontSize(8)
      .text("Total", { align: "center" });

    // Employee and POS information (left-aligned)
    const leftMargin = 10; // Left margin for text
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor("#333");

    // Item list (left-aligned, simple format)
    doc.moveDown(0.8);
    orderItems.forEach((item, index) => {
      const itemNumber = `(0${index + 1})`.slice(-2); // Format as (01), (02), etc.
      doc.text(
        `${itemNumber} ${item.name}, ${
          item.quantity
        } x Ks ${item.price.toLocaleString()}`,
        leftMargin
      );
      doc.moveDown(0.6);
    });

    // Final total (left-aligned "Total" with right-aligned price)
    doc.moveDown(0.5);
    const totalStartX = leftMargin; // Left margin for "Total:"
    const totalValueX = doc.page.width - 40; // Right margin for price
    doc
      .fontSize(8)
      .fillColor("#000")
      .text(`Total : Ks ${totalPrice.toLocaleString()}`, totalStartX, doc.y); // Keep on same line
    // doc.text(, totalValueX, doc.y, {
    //   align: "right",
    // });

    // Payment method (left-aligned method with right-aligned price)
    doc.moveDown(0.2);
    const paymentMethod = order[0].payment_method || "Kpay"; // Default to "Kpay" if not found
    doc.text(paymentMethod, totalStartX, doc.y);

    // Thank-you message in Burmese (centered)
    doc.moveDown(0.5);
    doc
      .fontSize(8)
      .fillColor("#333")
      .text("Thanks For Shopping with Little Things", {
        align: "center",
      });

    // Date and receipt number (centered at the bottom)
    doc.moveDown(0.2);
    const dateStr = new Date(order[0].created_at).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(` ${dateStr}`, { align: "center" }); // Using order ID as receipt number

    doc.end();
  } catch (err) {
    console.error("Error generating receipt:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports = { getOrders, createOrder, refundOrder, getReceipt };
