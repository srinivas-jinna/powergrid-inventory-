const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  transport: {
    type: String,
    required: true,
    enum: ['Road', 'Rail', 'Air', 'Sea', 'Multi-modal']
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    default: 'Vemagiri GIS'
  },
  type: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Food', 'Accessories', 'Healthcare', 'Industrial', 'Books', 'Furniture', 'Sports', 'Beauty']
  },
  remarks: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);