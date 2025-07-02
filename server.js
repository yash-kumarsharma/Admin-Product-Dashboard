const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const Products = require("./model/products");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.set("view engine", "hbs");
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use("/", authRoutes);

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

app.get("/", isAuthenticated, (req, res) => {
  Products.find()
    .then((products) => res.render("index", { products }))
    .catch((err) => res.status(500).send("Error loading products"));
});

app.get("/products", isAuthenticated, (req, res) => {
  Products.find()
    .then((products) => res.render("index", { products }))
    .catch((err) => res.status(500).send("Error loading products"));
});

app.post("/products", isAuthenticated, async (req, res) => {
  const { name, description, price, stock, image } = req.body;
  const newProduct = new Products({
    name,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    image: image || "default.png"
  });
  await newProduct.save();
  res.redirect("/products");
});

app.post("/products/update/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image } = req.body;
  const updatedFields = {};

  if (name) updatedFields.name = name;
  if (description) updatedFields.description = description;
  if (price) updatedFields.price = price;
  if (stock) updatedFields.stock = stock;
  if (image) updatedFields.image = image;

  await Products.findByIdAndUpdate(id, updatedFields);
  res.redirect("/products");
});

app.post("/products/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  await Products.findByIdAndDelete(id);
  res.redirect("/products");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
