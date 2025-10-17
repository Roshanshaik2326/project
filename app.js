const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;
const file = "products.json";

app.use(express.json());


function getProducts() {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  const data = fs.readFileSync(file);
  return JSON.parse(data);
}


function saveProducts(products) {
  fs.writeFileSync(file, JSON.stringify(products, null, 2));
}


app.get("/", (req, res) => {
  res.send("Welcome to the Product Inventory API!");
});

app.get("/products", (req, res) => {
  const products = getProducts();
  res.json(products);
});

app.get("/products/instock", (req, res) => {
  const products = getProducts().filter(p => p.inStock);
  res.json(products);
});

app.post("/products", (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || typeof price !== "number" || typeof inStock !== "boolean") {
    return res.status(400).json({ message: "Invalid product data" });
  }

  const products = getProducts();
  const newId = products.length ? products[products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const products = getProducts();
  const product = products.find(p => p.id === id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  if (req.body.name !== undefined) product.name = req.body.name;
  if (req.body.price !== undefined) product.price = req.body.price;
  if (req.body.inStock !== undefined) product.inStock = req.body.inStock;

  saveProducts(products);
  res.json(product);
});

app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) return res.status(404).json({ message: "Product not found" });

  const removed = products.splice(index, 1);
  saveProducts(products);

  res.json({ message: "Product deleted", deleted: removed[0] });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
