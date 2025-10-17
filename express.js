const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: "Wireless Mouse", price: 499, stock: 20 },
  { id: 2, name: "Keyboard", price: 899, stock: 10 },
  { id: 3, name: "Headphones", price: 1499, stock: 15 }
];

let orders = [];
let nextOrderId = 1;

app.get("/", (req, res) => {
  res.send("E-commerce API is running");
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/orders", (req, res) => {
  const { customerName, items } = req.body;
  if (!customerName || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  let total = 0;
  for (let item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product ID ${item.productId} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Not enough stock for ${product.name}` });
    }
    total += product.price * item.quantity;
    product.stock -= item.quantity;
  }

  const order = {
    id: nextOrderId++,
    customerName,
    items,
    totalAmount: total,
    status: "pending"
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.get("/api/orders/:id/status", (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ id: order.id, status: order.status });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Order not found" });
  const { status } = req.body;
  order.status = status || order.status;
  res.json(order);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
