const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    // Check if product exists
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(req.body.name, 'i') },
      type: req.body.type,
      from: req.body.from
    });

    if (existingProduct) {
      // Update quantity
      existingProduct.quantity += parseInt(req.body.quantity);
      existingProduct.updatedAt = new Date();
      await existingProduct.save();
      res.json(existingProduct);
    } else {
      // Create new product
      const product = new Product({
        ...req.body,
        productId: generateProductId()
      });
      await product.save();
      res.status(201).json(product);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product quantity
router.patch('/:id/quantity', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.quantity = req.body.quantity;
    product.updatedAt = new Date();
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function generateProductId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `PRD-${random}-${timestamp}`;
}

module.exports = router;