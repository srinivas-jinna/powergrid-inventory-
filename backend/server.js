const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// File paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const GATEPASSES_FILE = path.join(__dirname, 'data', 'gatepasses.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Load data from files
async function loadProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Return default data if file doesn't exist
    const defaultProducts = [
      {
        _id: '1',
        productId: 'PRD-001-2025',
        name: 'Wireless Headphones',
        transport: 'Air',
        description: 'Bluetooth 5.0 wireless headphones with noise cancellation',
        quantity: 150,
        from: 'Mumbai GIS',
        to: 'Vemagiri GIS',
        type: 'Electronics',
        remarks: 'Fragile - Handle with care'
      },
      {
        _id: '2',
        productId: 'PRD-002-2025',
        name: 'Cotton T-Shirts',
        transport: 'Road',
        description: '100% cotton casual t-shirts in various sizes',
        quantity: 500,
        from: 'Bangalore GIS',
        to: 'Vemagiri GIS',
        type: 'Clothing',
        remarks: 'Bulk order for retail chain'
      },
      {
        _id: '3',
        productId: 'PRD-003-2025',
        name: 'Organic Rice',
        transport: 'Rail',
        description: 'Premium basmati rice, organically grown',
        quantity: 1000,
        from: 'Punjab GIS',
        to: 'Vemagiri GIS',
        type: 'Food',
        remarks: 'Temperature controlled storage required'
      }
    ];
    await saveProducts(defaultProducts);
    return defaultProducts;
  }
}

async function loadGatePasses() {
  try {
    const data = await fs.readFile(GATEPASSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save data to files
async function saveProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

async function saveGatePasses(gatePasses) {
  await fs.writeFile(GATEPASSES_FILE, JSON.stringify(gatePasses, null, 2));
}

// Initialize data
let products = [];
let gatePasses = [];

async function initializeData() {
  await ensureDataDirectory();
  products = await loadProducts();
  gatePasses = await loadGatePasses();
  console.log(`📊 Loaded ${products.length} products and ${gatePasses.length} gate passes`);
}

// Products routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  try {
    // Check if product already exists
    const existingIndex = products.findIndex(
      p => p.name.toLowerCase() === req.body.name.toLowerCase() && 
           p.type === req.body.type &&
           p.from === req.body.from
    );

    if (existingIndex !== -1) {
      // Update existing product quantity
      products[existingIndex].quantity += parseInt(req.body.quantity);
      products[existingIndex].updatedAt = new Date().toISOString();
      await saveProducts(products);
      res.json(products[existingIndex]);
    } else {
      // Add new product
      const newProduct = {
        _id: Date.now().toString(),
        productId: `PRD-${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        ...req.body,
        quantity: parseInt(req.body.quantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.push(newProduct);
      await saveProducts(products);
      res.json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    products = products.filter(p => p._id !== req.params.id);
    await saveProducts(products);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Gate pass routes
app.get('/api/gatepasses', (req, res) => {
  res.json(gatePasses);
});

app.post('/api/gatepasses', async (req, res) => {
  try {
    const newGatePass = {
      _id: Date.now().toString(),
      gatePassNumber: `GP-${Date.now().toString().slice(-6)}`,
      ...req.body,
      generatedAt: new Date().toISOString()
    };
    
    // Update product quantities
    req.body.products.forEach(item => {
      const product = products.find(p => p.productId === item.productId);
      if (product) {
        product.quantity -= item.selectedQuantity;
        product.updatedAt = new Date().toISOString();
      }
    });

    // Remove products with zero quantity
    products = products.filter(p => p.quantity > 0);
    
    // Save both products and gate pass
    await saveProducts(products);
    
    gatePasses.push(newGatePass);
    await saveGatePasses(gatePasses);
    
    res.json(newGatePass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate gate pass' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PowerGrid Backend API is running!',
    products: products.length,
    gatePasses: gatePasses.length,
    dataStorage: 'JSON Files'
  });
});

const PORT = 5000;

// Start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ PowerGrid Backend Server running on http://localhost:${PORT}`);
    console.log(`💾 Data stored in JSON files (persistent storage)`);
    console.log(`📊 Current data: ${products.length} products, ${gatePasses.length} gate passes`);
    console.log(`📁 Data files location: ${path.join(__dirname, 'data')}`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
});
