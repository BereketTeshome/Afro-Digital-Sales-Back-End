
const express = require('express');
const connectDB = require('./config/db');
const config = require('./config/config');
const vendorRoutes = require('./routes/vendorRoutes');
const salesRoutes = require('./routes/salesRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Connect to database (pass `app` instance)
connectDB(app);

app.use(cors())
// Routes
app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/sales', salesRoutes);
app.use('/api/auth/customer', customerRoutes);
app.use('/api/product', productRoutes);

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

module.exports = app;
