const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  gatePassNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: String,
    required: true
  },
  from: {
    type: String,
    default: 'VEMAGIRI GIS'
  },
  to: {
    type: String,
    required: true
  },
  products: [{
    productId: String,
    name: String,
    transport: String,
    description: String,
    selectedQuantity: Number,
    type: String,
    remarks: String
  }],
  preparedBy: {
    type: String,
    required: true
  },
  checkedBy: String,
  authorizedBy: String,
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GatePass', gatePassSchema);