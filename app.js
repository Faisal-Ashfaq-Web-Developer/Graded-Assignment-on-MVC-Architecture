// app.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://batch6:herovired@cluster0.aqifkg2.mongodb.net/faisal_DB-3', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  total_qnty: Number,
  category: String,
  price: Number,
});

// Create models
const UserModel = mongoose.model('User', userSchema);
const ProductModel = mongoose.model('Product', productSchema);

// Middleware
app.use(express.json());

// Encryption function using bcrypt
const encryptPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Authentication API

// Signup
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await encryptPassword(password);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Product API

// Get all products
app.get('/products/products', async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add new product
app.post('/products/new', async (req, res) => {
  try {
    const { name, total_qnty, category, price } = req.body;

    const newProduct = new ProductModel({
      name,
      total_qnty,
      category,
      price,
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get products by category
app.get('/products/:category', async (req, res) => {
  try {
    const products = await ProductModel.find({ category: req.params.category });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found in the specified category' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
