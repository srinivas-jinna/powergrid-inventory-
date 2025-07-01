const express = require('express');
const router = express.Router();
const GatePass = require('../Models/GatePass');
const Product = require('../Models/Product');

// Get all gate passes
router.get('/', async (req, res) => {
  try {
    const gatePasses = await GatePass.find().sort({ generatedAt: -1 });
    res.json(gatePasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate new gate pass
router.post('/', async (req, res) => {
  try {
    const gatePass = new GatePass({
      ...req.body,
      gatePassNumber: `GP-${Date.now().toString().slice(-6)}`
    });

    // Update product quantities
    for (const item of req.body.products) {
      const product = await Product.findOne({ productId: item.productId });
      if (product) {
        product.quantity -= item.selectedQuantity;
        if (product.quantity <= 0) {
          await Product.findByIdAndDelete(product._id);
        } else {
          product.updatedAt = new Date();
          await product.save();
        }
      }
    }

    await gatePass.save();
    res.status(201).json(gatePass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;